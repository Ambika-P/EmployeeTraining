import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Define the schema for course data
const courseFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description cannot exceed 500 characters." }),
  category: z.string().optional(), // Example: Programming, Design, Business
  thumbnail: z.string().url("Must be a valid file").or(z.literal("")).optional(),
  // Add other relevant fields like target audience, difficulty level, etc.
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  initialData?: Partial<CourseFormData>; // For editing existing courses
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CourseForm({ initialData, onSubmit, isSubmitting }: CourseFormProps) {
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      thumbnail: initialData?.thumbnail || "",
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    await onSubmit(data);
    // Optionally reset form after successful submission if needed
    // form.reset(); 
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a brief overview of the course content and learning objectives."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add more fields as needed */}

        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Image (Optional)</FormLabel>
              <FormControl>
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append("image", file);
                      try {
                        const res = await fetch("/api/upload/image", {
                          method: "POST",
                          body: formData,
                        });
                        if (!res.ok) throw new Error("Upload failed");
                        const data = await res.json();
                        if (data.url) {
                          const absoluteUrl = `${window.location.origin}${data.url}`;
                          field.onChange(absoluteUrl);
                        } else {
                          alert("Upload failed: No URL returned");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Image upload failed");
                      }
                    }}
                  />
                  {field.value && field.value.trim() !== "" && !field.value.includes("placeholder.com") && (
                    <div className="mt-2 flex flex-col items-start gap-2">
                      <img
                        src={field.value}
                        alt="Course Thumbnail"
                        className="max-h-40 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => field.onChange("")}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? "Save Changes" : "Create Course"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default CourseForm;

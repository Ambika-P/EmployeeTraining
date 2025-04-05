import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const { forgotPasswordMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await forgotPasswordMutation.mutateAsync(data);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 mx-auto h-12 w-12 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-green-600 dark:text-green-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We have sent a password reset link to <span className="font-medium">{form.getValues().email}</span>.
          The link will expire in 30 minutes.
        </p>
        <div className="pt-4">
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setLocation("/auth")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} autoComplete="email" />
              </FormControl>
              <FormDescription>
                We'll send a password reset link to this email address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            type="button"
            onClick={() => setLocation("/auth")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ForgotPasswordForm;

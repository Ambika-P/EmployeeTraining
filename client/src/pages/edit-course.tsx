import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import CourseForm from "@/components/dashboard/course-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useRoute, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
// Import API call functions when ready
// import { getCourse, updateCourse } from "@/services/courseService";
import ModuleList from "@/components/dashboard/module-list"; // Import ModuleList

// Placeholder type - replace with actual Prisma type if available shared
type CourseData = {
  id: number;
  title: string;
  description: string;
  category?: string;
  instructorId?: number;
  // Add other fields from your Course model
};

export default function EditCoursePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/edit-course/:id");

  const courseId = params?.id ? parseInt(params.id) : null;

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        console.error("No course ID found in URL");
        setIsLoading(false);
        navigate("/my-content"); // Redirect if no ID
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.error("Course not found");
            navigate("/my-content"); // Redirect if not found
          } else if (response.status === 403) {
             console.warn("User not authorized to edit this course.");
             navigate("/my-content"); // Redirect if forbidden
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          return; // Stop execution if response not ok
        }

        const data: CourseData = await response.json();

        // Authorization check (redundant if backend handles 403, but safe)
        if (data.instructorId !== user?.id && user?.role !== 'admin') {
           console.warn("User not authorized to edit this course (frontend check).");
           navigate("/my-content");
           return;
        }

        setCourseData(data);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        // TODO: Add user-facing error handling (e.g., show toast)
        navigate("/my-content"); // Redirect on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate, user?.id, user?.role]);

  const handleUpdateCourse = async (data: any) => {
     if (!courseId) return;
    setIsSubmitting(true);
    console.log("Updating course data:", data);
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Include auth headers if needed
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedCourse = await response.json();
      console.log("Course updated successfully:", updatedCourse);
      setCourseData(updatedCourse); // Update local state with response
      // TODO: Show success toast notification

    } catch (error) {
      console.error("Failed to update course:", error);
      // TODO: Show error toast notification
      alert(`Error updating course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
       {/* Removed max-w-3xl to allow wider content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 mx-auto">
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : courseData ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Course: {courseData.title}</CardTitle>
              <CardDescription>
                Update the details for your course. Add modules and lessons below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm 
                onSubmit={handleUpdateCourse} 
                isSubmitting={isSubmitting}
                initialData={courseData} 
              />
              
              {/* Module/Lesson Management */}
              <div className="mt-8 pt-8 border-t">
                 {/* Pass the courseId to ModuleList */}
                 <ModuleList courseId={courseData.id} />
              </div>
            </CardContent>
          </Card>
        ) : (
           <Card>
             <CardHeader>
               <CardTitle className="text-2xl text-red-600">Error</CardTitle>
               <CardDescription>
                 Could not load course data. It might not exist or you may not have permission.
               </CardDescription>
             </CardHeader>
           </Card>
        )}
      </div>
    </MainLayout>
  );
}

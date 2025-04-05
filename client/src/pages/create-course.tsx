import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import CourseForm from "@/components/dashboard/course-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context"; // Assuming auth context provides user info/roles
import { useLocation } from "wouter";
// Import API call functions when ready (e.g., from a service file)
// import { createCourse } from "@/services/courseService"; 

export default function CreateCoursePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); // Get user info if needed for authorization
  const [, navigate] = useLocation();

  // Function to handle the actual API call
  const handleCreateCourse = async (data: any) => {
    setIsSubmitting(true);
    console.log("Submitting course data:", data);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authentication headers if necessary (e.g., CSRF token)
        },
        body: JSON.stringify({
          ...data,
          // instructorId is set on the backend based on the authenticated user
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newCourse = await response.json();
      console.log("Course created:", newCourse);
      
      // Redirect to the edit page for the newly created course
      if (newCourse && newCourse.id) {
        navigate(`/edit-course/${newCourse.id}`); 
      } else {
        console.error("Created course data did not include an ID. Redirecting to My Content.");
        navigate("/my-content"); 
      }
      
    } catch (error) {
      console.error("Failed to create course:", error);
      // TODO: Add user-facing error handling (e.g., show a toast notification)
      alert(`Error creating course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add role check if only certain users can create courses
  // if (user?.role !== 'contributor' && user?.role !== 'admin') {
  //   navigate('/'); // Redirect if not authorized
  //   return null;
  // }

  return (
    <MainLayout>
      {/* Removed max-w-3xl to allow wider content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 mx-auto"> 
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Course</CardTitle>
            <CardDescription>
              Fill in the details below to start building your new course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CourseForm onSubmit={handleCreateCourse} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

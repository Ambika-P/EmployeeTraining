import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function CourseApproval() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["pending-courses"] });
  }, []);

  // Fetch pending courses
  const { data: pendingCourses, isLoading } = useQuery({
    queryKey: ["pending-courses"],
    queryFn: async () => {
      const response = await fetch("/api/pending-courses");
      if (!response.ok) {
        throw new Error("Failed to fetch pending courses");
      }
      return response.json();
    },
  });

  // Approve course mutation
  const approveMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}/approve`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to approve course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-courses"] });
      toast({
        title: "Success",
        description: "Course has been approved and published",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve course",
        variant: "destructive",
      });
    },
  });

  // Reject course mutation
  const rejectMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await fetch(`/api/courses/${courseId}/reject`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to reject course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-courses"] });
      toast({
        title: "Success",
        description: "Course has been rejected",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject course",
        variant: "destructive",
      });
    },
  });

  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">
            Course Approval
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review and approve submitted courses
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Pending Approval
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {isLoading
                ? "Loading..."
                : `${pendingCourses?.length || 0} courses pending`}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : pendingCourses?.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No courses pending approval
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingCourses?.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Creator:
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">
                        {course.creator}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Submitted:
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">
                        {course.submittedDate}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = `/course-detail/${course.id}`)
                    }
                  >
                    View Details
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectMutation.mutate(course.id)}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(course.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

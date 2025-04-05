import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function CourseApproval() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const pendingCourses = [
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      creator: "Jane Smith",
      submittedDate: "2023-09-15",
      description: "A deep dive into JavaScript patterns, best practices, and advanced techniques.",
    },
    {
      id: 2,
      title: "Database Design Fundamentals",
      creator: "Mark Johnson",
      submittedDate: "2023-09-12",
      description: "Learn how to design efficient database schemas and optimize queries.",
    },
    {
      id: 3,
      title: "Product Management Essentials",
      creator: "Sarah Williams",
      submittedDate: "2023-09-10",
      description: "A comprehensive guide to product management methodologies and frameworks.",
    },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Course Approval</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review and approve submitted courses
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Pending Approval</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {pendingCourses.length} courses pending
            </span>
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {pendingCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
                </div>
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Creator:</span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">{course.creator}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Submitted:</span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">{course.submittedDate}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Button variant="outline">View Details</Button>
                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm">
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
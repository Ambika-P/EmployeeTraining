import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, FileText, Video, BarChart, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter"; // Import useLocation
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { Loader2 } from "lucide-react"; // Import Loader2 for loading state
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define a type for the course data expected from the API
type CourseType = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null; // e.g., 'published', 'draft', 'under review'
  instructorId?: number | null; // Crucial for filtering
  modules?: { id: number }[]; // Example: if module count is needed
  createdAt: string; // Assuming this is available for sorting/display
};


export default function MyContent() {
  const { user } = useAuth();
  const [, navigate] = useLocation(); // Get navigate function

  // Fetch all courses
  const { data: allCourses = [], isLoading, error, isError } = useQuery<CourseType[]>({
    queryKey: ["/api/my-courses"], // Query key for caching user's courses
    queryFn: async () => {
      if (!user?.id) {
        console.warn("User not available, skipping fetch.");
        return []; 
      }
      const res = await fetch('/api/my-courses'); 
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch courses: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!user?.id, 
  });

  // Filter courses created by the current user
  const myCourses = allCourses.filter(course => course.instructorId === user?.id);

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete course");
      }
      alert("Course deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(`Error deleting course: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // TODO: Implement filtering/sorting based on UI controls using the 'myCourses' array

  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">My Content</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage the courses and learning content you've created
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button variant="default" onClick={() => navigate('/create-course')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search content..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select className="appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-sm">
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            <div className="relative">
              <select className="appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-sm">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="students">Most Students</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="courses">
          <TabsList className="mb-6">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            {isLoading ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-5 w-12" /></div>
                        <div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-5 w-10" /></div>
                        <div><Skeleton className="h-4 w-24 mb-1" /><Skeleton className="h-5 w-20" /></div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Skeleton className="h-5 w-24" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : isError ? (
              // Error Message
              <div className="text-center py-10 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-md p-4">
                <h3 className="font-semibold mb-2">Error Loading Courses</h3>
                <p className="text-sm">{error instanceof Error ? error.message : 'An unknown error occurred.'}</p>
              </div>
            ) : myCourses.length === 0 ? (
               // Empty State
               <div className="text-center py-16 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-md">
                 <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No Courses Found</h3>
                 <p className="mb-4">You haven't created any courses yet.</p>
                 <Button onClick={() => navigate('/create-course')}>
                   <Plus className="mr-2 h-4 w-4" /> Create Your First Course
                 </Button>
               </div>
            ) : (
              // Display Filtered Courses
              <div className="grid grid-cols-1 gap-6">
                {myCourses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{course.title}</CardTitle>
                          <CardDescription>{course.description || 'No description provided.'}</CardDescription>
                        </div>
                        <StatusBadge status={course.status ? course.status : 'unknown'} /> 
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 dark:text-slate-400 mb-1">Status</div>
                          <div className="font-medium capitalize">{course.status || 'N/A'}</div>
                        </div>
                        <div>
                          {/* Module count display removed temporarily */}
                          <div className="text-slate-500 dark:text-slate-400 mb-1">Modules</div>
                          <div className="font-medium">{course.modules ? course.modules.length : 0}</div> 
                        </div>
                        <div>
                          <div className="text-slate-500 dark:text-slate-400 mb-1">Created</div>
                          <div className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        {/* Module count display removed temporarily */}
                        {/* <FileText className="h-4 w-4 text-slate-400" /> */}
                        {/* <span>{course.modules ? course.modules.length : 0} modules</span> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/course-detail/${course.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/edit-course/${course.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="flex items-center">
                              <BarChart className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 dark:text-red-400 flex items-center"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Other TabsContent sections remain unchanged */}
          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle>Modules</CardTitle>
                <CardDescription>
                  Individual modules you've created that can be used in courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You haven't created any standalone modules yet. Modules are created within courses.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/create-course')}>Create a Course</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle>Lessons & Resources</CardTitle>
                <CardDescription>
                  Learning content including videos, documents, and other resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <Video className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Content Yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                    You haven't uploaded any videos, documents, or other learning resources yet.
                    Start creating engaging content for your learners!
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                    <Button>
                      <Video className="mr-2 h-4 w-4" />
                      Upload Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>
                  Quizzes, tests and other assessment materials you've created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Assessments Yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                    You haven't created any quizzes or tests yet. 
                    Assessments help you evaluate learning outcomes and engage students.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  let badgeClasses = "";
  
  switch (status) {
    case "published":
      badgeClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "draft":
      badgeClasses = "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400";
      break;
    case "under review":
      badgeClasses = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      break;
    default:
      badgeClasses = "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400";
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses}`}>
      {status === "under review" ? "Under Review" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

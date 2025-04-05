import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, FileText, Video, BarChart } from "lucide-react";
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
// Adjust based on the actual fields returned by /api/courses
type CourseType = {
  id: number;
  title: string;
  description?: string | null;
  status?: string | null; // e.g., 'published', 'draft', 'under review'
  instructorId?: number | null; // Crucial for filtering
  // Add other fields displayed in the card if available from API
  // studentsEnrolled?: number; 
  // lastUpdated?: string; 
  // completionRate?: number; 
  modules?: { id: number }[]; // Example: if module count is needed
  createdAt: string; // Assuming this is available for sorting/display
};

export default function MyContent() {
  const { user } = useAuth();
  const [, navigate] = useLocation(); // Get navigate function
  
  // Mock data for demonstration
  const courses = [
    {
      id: 1,
      title: "JavaScript Programming Fundamentals",
      description: "Learn the core concepts of JavaScript programming.",
      status: "published",
      studentsEnrolled: 124,
      lastUpdated: "2023-08-15",
      completionRate: 68,
      modules: 12,
    },
    {
      id: 2,
      title: "Introduction to React Hooks",
      description: "Master the modern way to write React components.",
      status: "draft",
      studentsEnrolled: 0,
      lastUpdated: "2023-09-02",
      completionRate: 0,
      modules: 8,
    },
    {
      id: 3,
      title: "Advanced TypeScript for Developers",
      description: "Take your TypeScript skills to the next level.",
      status: "under review",
      studentsEnrolled: 0,
      lastUpdated: "2023-08-28",
      completionRate: 0,
      modules: 10,
    },
  ];
  
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
            <Button onClick={() => navigate('/create-course')}>
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
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
            </select>
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="students">Most Students</option>
            </select>
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
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </div>
                      <StatusBadge status={course.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 mb-1">Students Enrolled</div>
                        <div className="font-medium">{course.studentsEnrolled}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 mb-1">Completion Rate</div>
                        <div className="font-medium">{course.completionRate}%</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 mb-1">Last Updated</div>
                        <div className="font-medium">{course.lastUpdated}</div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>{course.modules} modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
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
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 flex items-center">
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
          </TabsContent>
          
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
                <Button>Create a Course</Button>
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

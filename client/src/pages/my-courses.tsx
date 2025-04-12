import { useState } from "react";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowRight, Clock, BookOpen, CheckCircle, Loader2, ChevronDown } from "lucide-react"; // Import icons
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter"; 
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define types based on Prisma schema and expected API response
// Adjust these based on the actual data returned by /api/enrollments
type CourseInEnrollment = {
  id: number;
  title: string;
  description?: string | null;
  duration?: number | null; // Assuming duration is in minutes from schema
  modules?: { id: number }[]; // Just need module count, or fetch full modules if needed
  instructor?: { firstName?: string | null; lastName?: string | null; } | null; // Assuming instructor relation is included
};

type EnrollmentWithCourse = {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string; // Assuming string date from JSON
  completedAt?: string | null;
  progress: number;
  course?: CourseInEnrollment | null; // Nested course data
};

export default function MyCourses() {
  const { user } = useAuth();
  const [, navigate] = useLocation(); 
  
  // Fetch enrollments using React Query
  const { data: enrollments = [], isLoading, error } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ["/api/enrollments"], // Query key for caching
    queryFn: async () => { // Added fetcher function
      const res = await fetch('/api/enrollments'); // Assumes API endpoint exists
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      return res.json();
    },
    // Enable query only if user is logged in
    enabled: !!user, 
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredEnrollments = enrollments.filter(e => {
    const course = e.course;
    if (!course) return false;

    const matchesSearch =
      !searchQuery ||
      (course.title && course.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = category === "all" || course.category === category;

    return matchesSearch && matchesCategory;
  });

  const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
    } else if (sortOrder === "oldest") {
      return new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
    } else if (sortOrder === "az") {
      return (a.course?.title || "").localeCompare(b.course?.title || "");
    } else if (sortOrder === "za") {
      return (b.course?.title || "").localeCompare(a.course?.title || "");
    }
    return 0;
  });

  const completedCourses = sortedEnrollments.filter(e => (e.progress === 100 || e.completedAt) && e.course);
  const inProgressCourses = sortedEnrollments.filter(e => !(e.progress === 100 || e.completedAt) && e.course);

  // TODO: Implement search/filter/sort logic based on fetched data if needed

  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your enrolled and completed courses
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Search and Filter Section (Keep UI, functionality needs wiring) */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search your courses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
            <div className="relative">
              <select
                className="appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {/* Add dynamic categories later */}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="inProgress">
          <TabsList className="mb-6">
            <TabsTrigger value="inProgress">In Progress ({inProgressCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
             <div className="flex justify-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : error ? (
             <div className="text-center py-10 text-red-600">
               Error loading courses: {error instanceof Error ? error.message : 'Unknown error'}
             </div>
          ) : (
            <>
              <TabsContent value="inProgress">
                {inProgressCourses.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-10">You have no courses in progress.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inProgressCourses.map((enrollment) => (
                      <Card key={enrollment.id}>
                        <CardHeader>
                          <CardTitle>{enrollment.course?.title || 'Course Title Missing'}</CardTitle>
                          <CardDescription>{enrollment.course?.description || 'No description.'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{enrollment.progress}%</span>
                              </div>
                              <Progress value={enrollment.progress} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>{enrollment.course?.duration ? `${Math.round(enrollment.course.duration / 60)} hours` : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                <span>{enrollment.course?.modules?.length || 0} modules</span>
                              </div>
                            </div>
                            {/* Add Last Accessed if available from API */}
                            {/* <div className="text-sm text-slate-500 dark:text-slate-400">
                              Last accessed: {enrollment.lastAccessed} 
                            </div> */}
                          </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                          <div className="text-sm">
                            Instructor: <span className="font-medium">{enrollment.course?.instructor?.firstName || 'N/A'}</span>
                          </div>
                          {/* Navigate to course content page */}
                          <Button size="sm" onClick={() => navigate(`/course-content?id=${enrollment.courseId}`)}> 
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                 {completedCourses.length === 0 ? (
                   <p className="text-center text-slate-500 dark:text-slate-400 py-10">You have not completed any courses yet.</p>
                 ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedCourses.map((enrollment) => (
                      <Card key={enrollment.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{enrollment.course?.title || 'Course Title Missing'}</CardTitle>
                              <CardDescription>{enrollment.course?.description || 'No description.'}</CardDescription>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-1 rounded-full">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>{enrollment.course?.duration ? `${Math.round(enrollment.course.duration / 60)} hours` : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-400" />
                                <span>{enrollment.course?.modules?.length || 0} modules</span>
                              </div>
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Completed on: {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                          <div className="text-sm">
                            Instructor: <span className="font-medium">{enrollment.course?.instructor?.firstName || 'N/A'}</span>
                          </div>
                          {/* Link to review the course, maybe back to course detail */}
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => navigate(`/course-content?id=${enrollment.courseId}`)}>
                              View Course
                            </Button>
                            <Button variant="default" size="sm" onClick={() => navigate(`/course-detail?id=${enrollment.courseId}`)}>
                              Review Course
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                 )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}

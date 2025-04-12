import { useState, useEffect } from "react"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Import useMutation and queryClient
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link, useRoute } from "wouter"; 
import { Play, Clock, Users, BookOpen, Star, Flag, Award, ArrowLeft, MessageSquare, Calendar, PlayCircle, FileText, ClipboardCheck, Loader2 } from "lucide-react"; 
import { Skeleton } from "@/components/ui/skeleton"; 

// Define types based on Prisma schema and expected API response
type Instructor = { 
  id: number;
  name: string; 
  avatar: string; 
  title?: string | null; 
  bio?: string | null; 
  firstName?: string | null; 
  lastName?: string | null;
  profilePicture?: string | null;
};
type Lesson = { 
  id: number; 
  title: string; 
  duration?: string | number | null; 
  type?: string; 
  completed?: boolean; // This will be derived from lessonCompletionMap
  questions?: number; 
  videoUrl?: string | null; 
  content?: string | null; 
  position: number; 
}; 
type Module = { 
  id: number; 
  title: string; 
  description?: string | null; 
  lessons: Lesson[]; 
  position: number; 
}; 
type Course = {
  id: number;
  title: string;
  description?: string | null;
  instructor?: Instructor | null; 
  modules: Module[]; 
  duration?: string | null; // Formatted duration
  level?: string | null; // Formatted level
  updatedAt: string; 
  lastUpdated: string; // Formatted date string
  rating: number; 
  reviews: number; 
  enrolled: number; 
  progress: number; // User-specific progress fetched from backend
  prerequisites?: string[] | null; 
  objectives?: string[] | null; 
  difficulty?: string | null; // Original difficulty from DB
};

// Type for user-specific lesson progress 
type LessonProgress = { lessonId: number; status: string; }; 

export default function CourseDetail() {
  const { user } = useAuth();
  const { data: enrollments = [] } = useQuery<any[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get query client instance
  
  const [match, params] = useRoute("/course-detail/:id");
  const courseId = params?.id; 

  // Fetch Course Details
  const { data: course, isLoading: isLoadingCourse, error, isError } = useQuery<Course, Error>({ // Correct destructuring
    queryKey: ["course", courseId], 
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await fetch(`/api/courses/${courseId}`); 
      if (!response.ok) {
        if (response.status === 404) throw new Error("Course not found");
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(errorData.message || `Failed to fetch course details: ${response.statusText}`);
      }
      const data = await response.json();
      // Basic processing
      return {
         ...data, 
         instructor: data.instructor ? {
           id: data.instructor.id,
           name: `${data.instructor.firstName || ''} ${data.instructor.lastName || ''}`.trim() || 'Instructor',
           avatar: data.instructor.profilePicture || `https://ui-avatars.com/api/?name=${data.instructor.firstName?.[0] || 'N'}+${data.instructor.lastName?.[0] || 'A'}`,
           title: 'Instructor', bio: 'Bio not available', 
           firstName: data.instructor.firstName, lastName: data.instructor.lastName, profilePicture: data.instructor.profilePicture,
         } : { id: 0, name: 'Unknown', avatar: '', title: '', bio: '' }, 
         lastUpdated: new Date(data.updatedAt).toLocaleDateString(), 
         duration: data.duration ? `${Math.round(data.duration / 60)} hours` : "N/A", 
         level: data.difficulty ? data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1) : "All Levels", 
         progress: data.progress || 0, 
         rating: 4.5, reviews: 0, enrolled: 0, // Placeholders
         prerequisites: data.prerequisites || [], 
         objectives: data.objectives || [], 
         modules: (data.modules || []).sort((a: Module, b: Module) => a.position - b.position).map((mod: Module) => ({ 
            ...mod,
            lessons: (mod.lessons || []).sort((a: Lesson, b: Lesson) => a.position - b.position).map((lesson: Lesson) => ({ 
                ...lesson,
                duration: lesson.duration ? `${Math.floor(Number(lesson.duration) / 60)}:${(Number(lesson.duration) % 60).toString().padStart(2, '0')}` : undefined 
            }))
         }))
      };
    },
    enabled: !!courseId, 
    staleTime: 5 * 60 * 1000, 
    retry: 1, 
  });

  // Fetch Lesson Progress
  const { data: lessonProgressData = [], isLoading: isLoadingProgress } = useQuery<LessonProgress[]>({
    queryKey: ["lessonProgress", courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return []; 
      const response = await fetch(`/api/courses/${courseId}/progress`);
      if (!response.ok) {
        console.error("Failed to fetch lesson progress:", response.statusText);
        return []; 
      }
      return response.json();
    },
    enabled: !!courseId && !!user?.id, 
    staleTime: 1 * 60 * 1000, 
  });

  // Create a map for easy lookup of lesson completion status
  const lessonCompletionMap = lessonProgressData.reduce((acc: Record<number, boolean>, p) => {
    acc[p.lessonId] = p.status === 'completed';
    return acc;
  }, {});

  // --- Enrollment Mutation ---
  const enrollMutation = useMutation({
    mutationFn: async (courseIdToEnroll: number) => {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseIdToEnroll }),
      });
      if (!response.ok) {
        // Handle specific errors like already enrolled (400) gracefully
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.message?.includes("Already enrolled")) {
            return { alreadyEnrolled: true }; // Indicate already enrolled
          }
        }
        // Throw for other errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to enroll: ${response.statusText}`);
      }
      return response.json(); // Return enrollment data on success
    },
    onSuccess: (data, courseIdToEnroll) => {
      // Invalidate queries to refetch data on other pages
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] }); 
      queryClient.invalidateQueries({ queryKey: ["course", courseIdToEnroll.toString()] }); // Refetch course details to update progress potentially

      // Navigate only after successful enrollment or if already enrolled
      if (course) {
        const firstModule = course.modules?.[0];
        const firstLesson = firstModule?.lessons?.[0];
        if (firstModule && firstLesson) {
          setLocation(`/course-content?id=${course.id}&moduleId=${firstModule.id}&lessonId=${firstLesson.id}`);
        } else {
          toast({ title: "Enrolled", description: "Enrolled successfully, but couldn't find the first lesson.", variant: "default" });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Could not enroll in the course.",
        variant: "destructive",
      });
    },
  });

  // --- Component logic ---
  // Moved calculations inside the return after checks
  
  const handleStartCourse = () => {
    if (!course || !user) {
       toast({ title: "Login Required", description: "Please log in to enroll.", variant: "destructive" });
       return;
    }
    if (enrollMutation.isPending) return; // Prevent double clicks
    
    enrollMutation.mutate(course.id); // Trigger the enrollment mutation
  };
  
  const handleContinueProgress = () => {
    // Navigate directly to the first lesson if already enrolled
    if (!course) return;
    const firstModule = course.modules?.[0];
    const firstLesson = firstModule?.lessons?.[0];
    // TODO: Ideally, find the *next uncompleted* lesson instead of the first one.
    if (firstModule && firstLesson) { 
      setLocation(`/course-content?id=${course.id}&moduleId=${firstModule.id}&lessonId=${firstLesson.id}`);
    } else {
       toast({ title: "Error", description: "Could not find the first lesson to continue.", variant: "destructive" });
    }
  };
  
  const handleNavigateToLesson = (moduleId: number, lessonId: number) => {
    if (course?.id) {
      setLocation(`/course-content?id=${course.id}&moduleId=${moduleId}&lessonId=${lessonId}`);
    } else {
      toast({ title: "Error", description: "Cannot navigate to lesson.", variant: "destructive" });
    }
  };
  
  const getLessonIcon = (lesson: Lesson) => {
     const isCompleted = lessonCompletionMap[lesson.id] ?? false; // Use the map
     if (lesson.videoUrl) return <PlayCircle className={`mr-3 h-5 w-5 ${isCompleted ? "text-green-500" : "text-slate-400"}`} />;
     return <FileText className={`mr-3 h-5 w-5 ${isCompleted ? "text-green-500" : "text-slate-400"}`} />;
  };

  // --- Render Logic ---
  const isLoading = isLoadingCourse || (!!user && isLoadingProgress); 

  if (isLoading) {
    // Render Skeleton
    return (
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
           <Skeleton className="h-8 w-1/4 mb-6" /> 
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             <div className="lg:col-span-2 space-y-4"> <Skeleton className="h-64 w-full" /> <Skeleton className="h-48 w-full" /> </div>
             <div> <Skeleton className="h-96 w-full" /> </div>
           </div>
        </div>
      </MainLayout>
    );
  }

  if (isError || !course) { // Use the correctly destructured isError
     // Render Error/Not Found
     return (
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Course Not Found</h1>
          <p className="mt-2 text-slate-500">{error?.message || "The course you are looking for does not exist or could not be loaded."}</p> {/* Use the correctly destructured error */}
          <Button onClick={() => setLocation('/course-catalog')} className="mt-4">Back to Catalog</Button>
        </div>
      </MainLayout>
    );
  }
  
  // Render Course Detail Page (Calculations moved inside)
  const totalLessons = course.modules?.reduce((sum: number, module: Module) => sum + (module.lessons?.length || 0), 0) || 0;
  const completedLessonsCount = Object.values(lessonCompletionMap).filter(Boolean).length;

  const isEnrolled = enrollments.some((e) => e.courseId === course.id);

  return (
    <MainLayout>
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/course-catalog">
              <a className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Courses
              </a>
            </Link>
          </div>
          <div className="md:flex md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">{course.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-3xl">{course.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /><span>{course.duration}</span></div>
                <div className="flex items-center gap-1"><BookOpen className="h-4 w-4 text-slate-400" /><span>{totalLessons} lessons</span></div>
                <div className="flex items-center gap-1"><Users className="h-4 w-4 text-slate-400" /><span>{course.enrolled.toLocaleString()} enrolled</span></div>
                <div className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400" /><span className="font-medium">{course.rating}</span><span className="text-slate-400">({course.reviews} reviews)</span></div>
                <div className="flex items-center gap-1"><Flag className="h-4 w-4 text-slate-400" /><span>{course.level}</span></div>
              </div>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              {/* Start/Continue Button based on fetched progress */}
              {isEnrolled ? ( 
                <Button onClick={handleContinueProgress} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">Continue Course</Button>
              ) : (
                <Button 
                  onClick={handleStartCourse} 
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                  disabled={enrollMutation.isPending} // Disable button while enrolling
                >
                  {enrollMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {enrollMutation.isPending ? 'Enrolling...' : 'Start Course'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Tabs) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content">
              <TabsList className="mb-6 w-full">
                <TabsTrigger value="content" className="flex-1">Course Content</TabsTrigger>
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content">
                <Card>
                  <CardHeader><CardTitle>Course Curriculum</CardTitle><CardDescription>{course.modules?.length || 0} modules • {totalLessons} lessons • {course.duration} total length</CardDescription></CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y dark:divide-slate-700">
                      {course.modules?.map((module: Module) => (
                        <div key={module.id} className="py-4 px-6">
                          <div className="mb-2"><h3 className="text-lg font-medium">{module.title}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{module.description}</p></div>
                          <div className="space-y-2 mt-3">
                            {module.lessons?.map((lesson: Lesson) => {
                              const isCompleted = lessonCompletionMap[lesson.id] ?? false; // Use progress map
                              return (
                                <div 
                                  key={lesson.id} 
                                  className={`flex items-center justify-between p-3 rounded-md ${isCompleted ? "bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30" : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"}`} 
                                  onClick={() => handleNavigateToLesson(module.id, lesson.id)}
                                >
                                  <div className="flex items-center min-w-0"> 
                                    {/* Pass only lesson, getLessonIcon uses the map */}
                                    {getLessonIcon(lesson)} 
                                    <div className="min-w-0"> 
                                      <h4 className="text-sm font-medium truncate">{lesson.title}</h4> 
                                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        {lesson.videoUrl && (<span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.duration}</span>)}
                                        <span className="capitalize">{lesson.videoUrl ? 'Video' : 'Text'}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Use isCompleted for badge/button */}
                                  {isCompleted ? (<Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/50 flex-shrink-0">Completed</Badge>) : (<Button variant="ghost" size="sm" className="flex-shrink-0">Start</Button>)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="overview">
                <div className="space-y-8">
                  <Card><CardHeader><CardTitle>What You'll Learn</CardTitle></CardHeader><CardContent><ul className="grid grid-cols-1 md:grid-cols-2 gap-2">{course.objectives?.map((objective: string, index: number) => (<li key={index} className="flex items-start gap-2"><div className="h-5 w-5 flex-shrink-0 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><span className="text-sm">{objective}</span></li>))}</ul></CardContent></Card>
                  <Card><CardHeader><CardTitle>Prerequisites</CardTitle></CardHeader><CardContent><ul className="space-y-2">{course.prerequisites?.map((prerequisite: string, index: number) => (<li key={index} className="flex items-start gap-2"><div className="h-5 w-5 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg></div><span className="text-sm">{prerequisite}</span></li>))}</ul></CardContent></Card>
                  <Card><CardHeader><CardTitle>About the Instructor</CardTitle></CardHeader><CardContent><div className="flex items-start gap-4"><Avatar className="h-12 w-12"><AvatarImage src={course.instructor?.avatar} alt={course.instructor?.name} /><AvatarFallback>{course.instructor?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}</AvatarFallback></Avatar><div><h3 className="font-medium">{course.instructor?.name}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor?.title}</p><p className="text-sm mt-2">{course.instructor?.bio}</p></div></div></CardContent></Card>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                 <Card><CardHeader><CardTitle>Student Reviews</CardTitle><CardDescription>{course.reviews} reviews • {course.rating} average rating</CardDescription></CardHeader><CardContent>{/* Review content */}</CardContent></Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div>
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Progress Card */}
              {course.progress > 0 && ( 
                <Card>
                  <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Use completedLessonsCount and course.progress */}
                      <div className="flex justify-between text-sm"><span>{completedLessonsCount} of {totalLessons} completed</span><span>{course.progress}%</span></div> 
                      <Progress value={course.progress} /> 
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">You're making great progress! Continue where you left off:</p>
                      <Button onClick={handleContinueProgress} className="w-full mt-2"><Play className="mr-2 h-4 w-4" />Continue Course</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Course Info Card */}
              <Card>
                <CardHeader><CardTitle>Course Information</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><div className="flex items-center"><Calendar className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Last Updated</span></div><span className="text-sm font-medium">{course.lastUpdated}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center"><BookOpen className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Content</span></div><span className="text-sm font-medium">{totalLessons} lessons</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center"><Clock className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Duration</span></div><span className="text-sm font-medium">{course.duration}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center"><Flag className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Level</span></div><span className="text-sm font-medium">{course.level}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center"><Users className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Students</span></div><span className="text-sm font-medium">{course.enrolled.toLocaleString()}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center"><MessageSquare className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Language</span></div><span className="text-sm font-medium">English</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center"><Award className="h-4 w-4 text-slate-400 mr-2" /><span className="text-sm">Certificate</span></div><span className="text-sm font-medium">Upon Completion</span></div>
                  </div>
                </CardContent>
                <CardFooter>
                  {/* Show Start Learning button only if not enrolled (progress === 0) */}
                  {isEnrolled ? (
                    <Button 
                      onClick={handleContinueProgress} 
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleStartCourse} 
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                      disabled={enrollMutation.isPending} // Disable button while enrolling
                    >
                      {enrollMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      {enrollMutation.isPending ? 'Enrolling...' : 'Start Learning'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Share Card */}
              <Card>
                <CardHeader><CardTitle>Share this Course</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Copied to clipboard" }); }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </Button>
                    {/* Other share buttons */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

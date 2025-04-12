import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Import cn utility (though not explicitly used here, good practice to keep if intended)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator"; // Import Separator (though not explicitly used here)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation, Link, useSearch } from "wouter"; // Removed useRoute as it wasn't used
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, MessageSquare, Clock, Download, BookOpen, HelpCircle, PlayCircle, ClipboardCheck, FileText, Loader2, PanelLeftClose, PanelRightOpen } from "lucide-react"; // Added required icons
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define types based on Prisma schema (adjust if needed)
type Instructor = { id: number; firstName?: string | null; lastName?: string | null; profilePicture?: string | null; /* add other fields if included */ };
type Lesson = { id: number; title: string; content?: string | null; videoUrl?: string | null; duration?: number | null; position: number; completed?: boolean; /* Add 'type' if needed based on logic */ };
type Module = { id: number; title: string; description?: string | null; lessons: Lesson[]; position: number; };
type Course = {
  id: number;
  title: string;
  description?: string | null;
  instructor?: Instructor | null;
  modules: Module[];
  duration?: number | null; // Course duration in minutes from schema
  difficulty?: string | null; // CourseDifficulty enum as string
  updatedAt: string; // Date string from JSON
};
// Type for user-specific progress (fetch separately)
type LessonProgress = { lessonId: number; status: string; };

import { useQuery } from "@tanstack/react-query";

export default function CourseContent() {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchComments = async (lessonId: number) => {
    try {
      const res = await fetch(`/api/comments?lessonId=${lessonId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostComment = async () => {
    if (!currentLesson?.id || !newComment.trim()) return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          comment: newComment.trim(),
          parentId: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setNewComment("");
      fetchComments(currentLesson.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!currentLesson?.id || !replyText.trim()) return;
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          comment: replyText.trim(),
          parentId,
        }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      setReplyText("");
      setReplyingTo(null);
      fetchComments(currentLesson.id);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleReply = (commentId: number) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    setReplyText("");
  };

  const { user } = useAuth();
  const { data: certificates = [] } = useQuery<any[]>({
    queryKey: ["/api/certificates-user"],
    enabled: !!user,
  });
  const [location, setLocation] = useLocation();
  const search = useSearch(); // Use wouter's useSearch hook
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<number, boolean>>({}); // Store completion status
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar toggle

  // Get IDs from URL query parameters using useSearch
  const queryParams = new URLSearchParams(search);
  const courseId = queryParams.get("id");
  // Get module/lesson IDs from query params for initial load/navigation
  const currentModuleIdParam = queryParams.get("moduleId");
  const currentLessonIdParam = queryParams.get("lessonId");

  // Fetch course data including modules and lessons
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        toast({ title: "Error", description: "Course ID missing.", variant: "destructive" });
        setLocation('/course-catalog');
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Course not found");
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Course = await response.json();

        data.modules?.sort((a, b) => a.position - b.position);
        data.modules?.forEach(m => m.lessons?.sort((a, b) => a.position - b.position));


        setCourse(data);

        const initialModuleId = currentModuleIdParam ? parseInt(currentModuleIdParam, 10) : data.modules?.[0]?.id;
        const initialLessonId = currentLessonIdParam ? parseInt(currentLessonIdParam, 10) : data.modules?.[0]?.lessons?.[0]?.id;

        const initialModule = data.modules?.find(m => m.id === initialModuleId);
        const moduleToSearchIn = initialModule || data.modules?.[0];
        const initialLesson = moduleToSearchIn?.lessons?.find(l => l.id === initialLessonId);

        setCurrentModule(initialModule || data.modules?.[0] || null);
        setCurrentLesson(initialLesson || moduleToSearchIn?.lessons?.[0] || null);

        if (user?.id) {
          try {
            const progressResponse = await fetch(`/api/courses/${courseId}/progress`);
            if (progressResponse.ok) {
              const progressData: LessonProgress[] = await progressResponse.json();
              const progressMap = progressData.reduce((acc: Record<number, boolean>, p) => {
                acc[p.lessonId] = p.status === 'completed';
                return acc;
              }, {});
              setLessonProgressMap(progressMap);
            } else {
              console.error("Failed to fetch lesson progress:", progressResponse.statusText);
            }
          } catch (progressError) {
            console.error("Error fetching lesson progress:", progressError);
          }
        }

      } catch (error) {
        console.error("Failed to fetch course data:", error);
        toast({ title: "Error", description: `Could not load course: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user?.id, setLocation, toast]);

  // Change lesson without re-fetching course
  useEffect(() => {
    if (!course) return;
    const newModuleId = parseInt(queryParams.get("moduleId") || "0", 10);
    const newLessonId = parseInt(queryParams.get("lessonId") || "0", 10);

    const targetModule = course.modules?.find(m => m.id === newModuleId);
    const finalModule = targetModule || course.modules?.[0];

    const targetLesson = finalModule?.lessons?.find(l => l.id === newLessonId);
    const finalLesson = targetLesson || finalModule?.lessons?.[0];

    if (finalModule && finalLesson) {
      setCurrentModule(finalModule);
      setCurrentLesson(finalLesson);
    }
  }, [search, course]);

  // Fetch comments when currentLesson changes
  useEffect(() => {
    if (currentLesson?.id) {
      fetchComments(currentLesson.id);
    }
  }, [currentLesson?.id]);


  // Calculate navigation links
  const allLessons = course?.modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id }))) || [];
  const filteredLessons = allLessons.filter(l => !l.title.toLowerCase().includes("certificate"));
  const currentLessonIndex = allLessons.findIndex(l => l.moduleId === currentModule?.id && l.id === currentLesson?.id);
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Calculate completion statistics excluding dummy lesson
  const totalLessons = filteredLessons.length;
  const completedLessons = filteredLessons.filter(l => lessonProgressMap[l.id]).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleMarkComplete = async () => {
    if (!currentLesson || !user) return;

    // Optimistic UI update (optional, uncomment if desired)
    // const previousProgress = { ...lessonProgressMap };
    // setLessonProgressMap(prev => ({ ...prev, [currentLesson.id!]: true }));

    console.log(`Marking lesson ${currentLesson.id} as complete`);
    try {
      const response = await fetch(`/api/lesson-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // userId: user.id, // Backend should get user ID from session/auth
          lessonId: currentLesson.id,
          status: 'completed'
        })
      });

      if (!response.ok) {
        const errorData = await response.text(); // Get more error details
        throw new Error(`Failed to update progress: ${response.status} ${response.statusText} - ${errorData}`);
      }

      // Update local state *after* successful API call (if not doing optimistic update)
      setLessonProgressMap(prev => ({ ...prev, [currentLesson.id]: true }));


      toast({
        title: "Lesson marked as complete",
        description: "Your progress has been saved.",
        variant: "default", // Use "default" or "success"
      });

      // Navigate to the next lesson if available
      if (nextLesson) {
        navigateToLesson(nextLesson.moduleId, nextLesson.id);
      }
    } catch (error) {
       // Revert optimistic update if it failed
       // setLessonProgressMap(previousProgress);

       console.error("Failed to mark lesson complete:", error);
       toast({
         title: "Error",
         description: `Could not update progress: ${error instanceof Error ? error.message : 'Unknown error'}`,
         variant: "destructive",
       });
    }
  };

  const navigateToLesson = (moduleId: number | undefined, lessonId: number | undefined) => {
    // Ensure all required IDs are valid numbers before navigating
    if (courseId && typeof moduleId === 'number' && typeof lessonId === 'number') {
      setLocation(`/course-content?id=${courseId}&moduleId=${moduleId}&lessonId=${lessonId}`);
    } else {
        console.warn("Navigation cancelled: Missing required IDs", { courseId, moduleId, lessonId });
        // Change "warning" to "default" as "warning" is not a standard variant
        toast({ 
          title: "Navigation Info", // Maybe adjust title slightly if not a critical error
          description: "Cannot navigate, missing information.", 
          variant: "default" // Corrected: Use "default" variant 
        });
    }
  };

  // Determine lesson type icon (simplified)
  const getLessonIcon = (lesson: Lesson) => {
    const isCertificateLesson = lesson.title.toLowerCase().includes("certificate");
    let iconColor = "text-slate-400";

    if (isCertificateLesson) {
      const hasCert = certificates.some((c) => c.courseId === course?.id);
      iconColor = hasCert ? "text-green-500" : "text-slate-400";
    } else {
      const isCompleted = lesson.id ? lessonProgressMap[lesson.id] ?? false : false;
      iconColor = isCompleted ? "text-green-500" : "text-slate-400";
    }

    const iconClasses = `mr-3 h-5 w-5 ${iconColor}`;

    if (lesson.videoUrl) return <PlayCircle className={iconClasses} />;
    return <FileText className={iconClasses} />;
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
           <Skeleton className="h-6 w-48 mb-6" /> {/* Back link skel */}
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             <div className="lg:col-span-1"> <Skeleton className="h-[600px] w-full rounded-lg" /> </div> {/* Sidebar skel */}
             <div className="lg:col-span-3 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-40 w-full rounded-lg" />
             </div> {/* Content skel */}
           </div>
        </div>
      </MainLayout>
    );
  }

  // Added more robust check: ensure course AND currentModule AND currentLesson are not null
  if (!course || !currentModule || !currentLesson) {
     return (
      <MainLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Content Not Found</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            { !courseId ? "No course ID provided." : !course ? "The course could not be loaded." : "The selected module or lesson could not be found." }
          </p>
          <Button onClick={() => setLocation('/course-catalog')} className="mt-6">
             <ArrowLeft className="mr-2 h-4 w-4"/> Back to Catalog
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Check lesson completion status safely
  const isLessonCompleted = currentLesson.id ? lessonProgressMap[currentLesson.id] ?? false : false;

  return (
    <MainLayout>
      {/* Header Section */}
      {/* Ensure header doesn't overlap content when sidebar is sticky */}
      <div className="bg-white dark:bg-slate-900 shadow sticky top-0 z-30"> {/* Increased z-index */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4"> {/* Added gap */}
          <div className="flex items-center gap-2 md:gap-4 text-sm flex-shrink-0"> {/* Prevent shrinking */}
             {/* Sidebar Toggle Button */}
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="lg:hidden" // Only show on smaller screens
               aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
             >
               {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
             </Button>
            {/* Use wouter Link correctly with an inner <a> tag */}
            <Link href={`/course-detail/${courseId}`}>
              <a className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back to Course Details</span> {/* Hide text on very small screens */}
                <span className="sm:hidden">Back</span> {/* Show shorter text */}
              </a>
            </Link>
          </div>
           {/* Header Progress Bar */}
           <div className="flex-grow mx-4 min-w-0"></div>
        </div>
      </div>

      {/* Main Content Area */}
      {/* Use max-w-full and mx-auto to center content, remove max-w-7xl from here */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Apply max-w-7xl to the grid container instead */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Sidebar - Conditionally Rendered based on state */}
          {/* Use translate-x for smoother transitions on mobile (optional, requires CSS) */}
          <aside className={cn(
            "lg:col-span-1 transition-transform duration-300 ease-in-out lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full absolute lg:static" // Slide out on mobile, remove from flow
          )}>
            {/* Make sidebar content scrollable independently */}
             {/* Adjusted sticky top based on potential header height (approx 60px + padding) */}
            <div className="lg:sticky lg:top-[70px] space-y-6 max-h-[calc(100vh-90px)] overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom scrollbar class if needed */}
              <Card>
                <CardHeader className="p-4"> {/* Reduced padding */}
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle> {/* Allow wrapping */}
                  <div className="mt-2">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {progressPercentage}% Complete
                    </div>
                    <span id="progress-label" className="sr-only">Course completion progress</span>
                    <Progress value={progressPercentage} className="h-2 w-full" aria-labelledby="progress-label" />
                  </div>
                  {/* Removed CardDescription - Progress moved to header */}
                </CardHeader>
                <CardContent className="p-0">
                   {/* Ensure currentModule.id is valid before using it */}
                  <Accordion type="multiple" defaultValue={currentModule?.id ? [`module-${currentModule.id}`] : []} className="w-full">
                    {course.modules.map((module) => (
                      <AccordionItem key={module.id} value={`module-${module.id}`} className="border-b dark:border-slate-700 last:border-b-0">
                        <AccordionTrigger className="px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 [&[data-state=open]]:bg-slate-100 dark:[&[data-state=open]]:bg-slate-800 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none rounded-t-md"> {/* Improved focus and styling */}
                          <div className="text-left flex-grow mr-2"> {/* Allow text to grow */}
                            <div className="font-medium leading-snug">{module.title}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {module.lessons?.length || 0} lessons
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                          <div className="divide-y dark:divide-slate-700 border-t dark:border-slate-700">
                            {module.lessons.map((lesson) => (
                              <button // Use button for better accessibility
                                key={lesson.id}
                                onClick={() => navigateToLesson(module.id, lesson.id)}
                                disabled={module.id === currentModule?.id && lesson.id === currentLesson?.id} // Disable current lesson
                                className={cn(`w-full px-4 py-3 text-left flex items-center gap-2 text-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none`,
                                  module.id === currentModule?.id && lesson.id === currentLesson?.id
                                    ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-slate-100 cursor-default" // Style for current
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300" // Style for others
                                )}
                                aria-current={module.id === currentModule?.id && lesson.id === currentLesson?.id ? "page" : undefined} // Accessibility
                              >
                                {getLessonIcon(lesson)}
                                <div className="flex-grow min-w-0"> {/* Added min-w-0 */}
                                  <div className="line-clamp-1">{lesson.title}</div>
                                  {/* Display duration if available */}
                                  {lesson.duration && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                      <Clock className="inline h-3 w-3 mr-1" /> {/* Add clock icon */}
                                      {`${Math.floor(lesson.duration / 60)}m ${(lesson.duration % 60).toString()}s`} {/* Improved format */}
                                    </div>
                                  )}
                                </div>
                                {lesson.id && lessonProgressMap[lesson.id] && (
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> /* Show checkmark if completed */
                                )}
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-t dark:border-slate-700 gap-2"> {/* Added gap */}
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {completedLessons} of {totalLessons} completed
                  </div>
                  {/* Use wouter Link correctly */}
                  <Link href={`/course-detail/${courseId}`}>
                    <a className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      Course Overview
                    </a>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </aside>

          {/* Main Content - Adjust column span based on sidebar state */}
          <main className={`space-y-6 ${isSidebarOpen ? "lg:col-span-3" : "lg:col-span-4"}`}>
            <Card>
              <CardHeader className="pb-4"> {/* Reduced bottom padding */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-grow"> {/* Allow title area to grow */}
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      {currentModule.title}
                    </div>
                    <CardTitle className="text-xl lg:text-2xl">{currentLesson.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0"> {/* Prevent shrinking, add gap */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToLesson(previousLesson?.moduleId, previousLesson?.id)}
                      disabled={!previousLesson}
                      aria-label="Previous lesson"
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" /> {/* Hide text on smaller screens */}
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToLesson(nextLesson?.moduleId, nextLesson?.id)}
                      disabled={!nextLesson}
                      aria-label="Next lesson"
                    >
                       <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" /> {/* Hide text on smaller screens */}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Video Player or Text Content */}
                {currentLesson.title.toLowerCase().includes("certificate") ? (
                  <div className="p-6 text-center flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Congratulations!</h2>
                    <p className="text-slate-600 dark:text-slate-300">You have completed the course.</p>
                    <Button
                      variant="default"
                      disabled={
                        progressPercentage < 100 ||
                        certificates.some((c) => c.courseId === course?.id)
                      }
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/certificates/${course?.id}`, {
                            method: "POST",
                          });
                          if (!res.ok) throw new Error("Failed to generate certificate");
                          const data = await res.json();
                          alert(`Certificate generated! ID: ${data.certificateId}`);
                          const { queryClient } = await import("@/lib/queryClient");
                          queryClient.invalidateQueries({ queryKey: ["/api/certificates-user"] });
                        } catch (err) {
                          console.error(err);
                          alert("Failed to generate certificate");
                        }
                      }}
                    >
                      <Download className="mr-2 h-4 w-4 text-yellow-500" />
                      Generate Certificate
                    </Button>
                  </div>
                ) : currentLesson.videoUrl ? (
                  <div className="aspect-video bg-black rounded-t-none"> {/* Removed top rounding if card has it */}
                    <video
                      key={currentLesson.videoUrl} // Force re-render on URL change
                      src={currentLesson.videoUrl}
                      className="w-full h-full"
                      controls
                      // Consider adding poster attribute: poster="/path/to/poster.jpg"
                      // Consider adding track for captions: <track kind="captions" src="/path/to/captions.vtt" srclang="en" label="English" default />
                    ></video>
                  </div>
                ) : currentLesson.content ? (
                   <div className="p-6 prose dark:prose-invert max-w-none prose-sm sm:prose-base"> {/* Adjusted prose size */}
                     {/* Render text content safely. Consider using a Markdown renderer if content is Markdown */}
                     {/* Example using react-markdown (install required): */}
                     {/* import ReactMarkdown from 'react-markdown'; */}
                     {/* <ReactMarkdown>{currentLesson.content}</ReactMarkdown> */}
                     <p>{currentLesson.content}</p> {/* Simple rendering for now */}
                   </div>
                ) : (
                   <div className="p-6 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                       <BookOpen className="h-8 w-8 text-slate-400"/>
                       <span>No content available for this lesson.</span>
                   </div>
                )}

                {/* Tabs for Transcript, Resources, etc. */}
                {/* Only show tabs if there's primary content */}
                {(currentLesson.videoUrl || currentLesson.content) && (
                  <div className="p-4 sm:p-6 border-t dark:border-slate-700">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="mb-4 grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto"> {/* Adjust grid for responsiveness */}
                         {/* Conditionally render transcript tab */}
                        {currentLesson.videoUrl && <TabsTrigger value="transcript">Transcript</TabsTrigger>}
                         {/* Always render other tabs, adjust grid accordingly */}
                         {/* If videoUrl is null, these will span more cols */}
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                        <TabsTrigger value="notes">My Notes</TabsTrigger>
                        <TabsTrigger value="discussion">Discussion</TabsTrigger>
                      </TabsList>

                      {currentLesson.videoUrl && (
                        <TabsContent value="transcript">
                          <div className="prose dark:prose-invert max-w-none text-sm border rounded-md p-4 max-h-60 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-800/30">
                            {/* TODO: Fetch or display actual transcript */}
                            <p className="text-slate-500 dark:text-slate-400 italic">Transcript currently unavailable.</p>
                          </div>
                        </TabsContent>
                      )}

                      <TabsContent value="resources">
                        <div className="space-y-3">
                          <h3 className="text-base font-medium">Lesson Resources</h3>
                          {/* TODO: Fetch and display actual resources (e.g., downloadable files) */}
                           <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 border rounded-md p-3 bg-slate-50 dark:bg-slate-800/30">
                             <Download className="h-4 w-4" />
                             <span>No resources attached to this lesson yet.</span>
                           </div>
                           {/* Example resource item:
                           <a href="#" download className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50">
                               <Download className="h-4 w-4" />
                               <span>Lesson_Slides.pdf</span>
                           </a>
                           */}
                        </div>
                      </TabsContent>

                      <TabsContent value="notes">
                        <div className="space-y-3">
                           <h3 className="text-base font-medium">My Notes</h3>
                          <div className="w-full rounded-md border border-slate-200 dark:border-slate-700 focus-within:ring-1 focus-within:ring-ring">
                            <textarea
                              className="w-full h-36 p-3 bg-transparent resize-none focus:outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              placeholder="Take notes on this lesson here..."
                              aria-label="Lesson notes"
                              // TODO: Implement state and saving logic for notes
                            ></textarea>
                          </div>
                          <Button size="sm" disabled> {/* TODO: Enable when save logic exists */}
                             {/* TODO: Implement save logic */}
                             <Loader2 className="mr-2 h-4 w-4 animate-spin hidden" /> {/* Show loader on save */}
                            Save Notes (Coming Soon)
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="discussion">
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">Discussion</h3>

                          {/* New comment input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              className="flex-1 border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button size="sm" onClick={handlePostComment} disabled={!newComment.trim()}>
                              Post
                            </Button>
                          </div>

                          {/* Comments list */}
                          <div className="space-y-4 mt-4 max-h-[60rem] overflow-y-auto custom-scrollbar">
                            {comments.map((comment) => (
                              <div key={comment.id} className="border rounded p-3 bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                  <span>
                                    {comment.user?.firstName || comment.user?.username || "User"}
                                  </span>
                                  <span>
                                    {new Date(comment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-sm">{comment.comment}</div>
                                <div className="mt-2 flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => toggleReply(comment.id)}>
                                    Reply
                                  </Button>
                                </div>
                                {replyingTo === comment.id && (
                                  <div className="mt-2 flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Write a reply..."
                                      className="flex-1 border rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <Button size="sm" onClick={() => handlePostReply(comment.id)} disabled={!replyText.trim()}>
                                      Post
                                    </Button>
                                  </div>
                                )}
                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-3 space-y-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply.id} className="border rounded p-2 bg-slate-100 dark:bg-slate-800/50">
                                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                          <span>
                                            {reply.user?.firstName || reply.user?.username || "User"}
                                          </span>
                                          <span>
                                            {new Date(reply.createdAt).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="text-sm">{reply.comment}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-t dark:border-slate-700 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <HelpCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Need help? <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Contact instructor</a> {/* Make it a link */}
                  </span>
                </div>
                <div>
                  {/* Show Checkmark if completed, else show Button */}
                  {currentLesson.title.toLowerCase().includes("certificate") ? null : isLessonCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm p-2 rounded-md bg-green-50 dark:bg-green-900/30">
                        <Check className="h-5 w-5"/>
                        <span>Completed</span>
                      </div>
                  ) : currentLesson.title.toLowerCase().includes("certificate") ? null : (
                    <Button variant="default" onClick={handleMarkComplete} disabled={isLoading}>
                       {/* Consider adding a loading state to the button */}
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}

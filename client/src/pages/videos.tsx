import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UploadCloud, Play, Clock, Calendar, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Videos() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const videos = [
    {
      id: 1,
      title: "Introduction to JavaScript",
      description: "Learn the basics of JavaScript programming.",
      thumbnail: "https://placehold.co/320x180/333/white?text=JS+Intro",
      duration: "10:25",
      views: 245,
      uploadDate: "2023-08-15",
      courses: ["JavaScript Fundamentals"],
    },
    {
      id: 2,
      title: "React Hooks Explained",
      description: "A deep dive into React hooks and their use cases.",
      thumbnail: "https://placehold.co/320x180/61DAFB/333?text=React+Hooks",
      duration: "15:42",
      views: 187,
      uploadDate: "2023-08-20",
      courses: ["React for Beginners"],
    },
    {
      id: 3,
      title: "CSS Grid Layouts",
      description: "Master CSS Grid for modern web layouts.",
      thumbnail: "https://placehold.co/320x180/2965f1/white?text=CSS+Grid",
      duration: "8:15",
      views: 132,
      uploadDate: "2023-08-25",
      courses: ["Advanced CSS Techniques"],
    },
    {
      id: 4,
      title: "TypeScript Type Systems",
      description: "Understanding TypeScript's powerful type system.",
      thumbnail: "https://placehold.co/320x180/007ACC/white?text=TypeScript",
      duration: "12:33",
      views: 98,
      uploadDate: "2023-08-30",
      courses: ["Introduction to TypeScript"],
    },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Video Library</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your video content for courses
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search videos..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="all">All Courses</option>
              <option value="js">JavaScript Fundamentals</option>
              <option value="react">React for Beginners</option>
              <option value="css">Advanced CSS Techniques</option>
              <option value="ts">Introduction to TypeScript</option>
            </select>
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Viewed</option>
              <option value="longest">Longest First</option>
              <option value="shortest">Shortest First</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden flex flex-col">
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {video.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-auto">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span>Uploaded: {video.uploadDate}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-2" />
                  <span>{video.views} views</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  <span>{video.duration}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t flex justify-between">
                <div className="text-xs">
                  {video.courses.length > 0 && (
                    <span className="text-slate-500 dark:text-slate-400">
                      Used in: <span className="font-medium text-slate-700 dark:text-slate-300">{video.courses[0]}</span>
                      {video.courses.length > 1 && <span> +{video.courses.length - 1} more</span>}
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Replace Video
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {videos.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <UploadCloud className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Videos Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              You haven't uploaded any videos yet. Videos are an engaging way to deliver course content.
            </p>
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload Your First Video
            </Button>
          </div>
        )}
        
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {videos.length} of {videos.length} videos
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
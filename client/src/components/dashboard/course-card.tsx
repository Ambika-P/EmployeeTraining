import { Link, useLocation } from "wouter"; // Import useLocation
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button"; // Import Button

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
  progress?: number;
  rating?: number;
  isInProgress?: boolean;
  className?: string;
}

export function CourseCard({
  id,
  title,
  description,
  thumbnailUrl,
  progress = 0,
  rating,
  isInProgress = false,
  className,
}: CourseCardProps) {
  const [, navigate] = useLocation(); // Get navigate function
  const defaultThumbnail = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

  const handleNavigate = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Explicitly prevent default and stop propagation
    e.preventDefault(); 
    e.stopPropagation(); 
    const targetUrl = isInProgress ? `/course-content?id=${id}&moduleId=1&lessonId=3` : `/course-detail/${id}`;
    navigate(targetUrl);
    // Returning false is generally not needed with preventDefault/stopPropagation
  };

  return (
    <div className={cn("bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden flex flex-col", className)}>
      <div className="h-40 bg-slate-200 dark:bg-slate-700 relative">
        <img 
          src={thumbnailUrl || defaultThumbnail} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultThumbnail;
          }}
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs font-medium px-2 py-1 rounded">
            {rating} ★
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{description}</p> {/* Added line-clamp */}
        
        {isInProgress && (
          <div className="mt-auto mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Reverted to Button with onClick for navigation */}
        <Button 
          type="button" // Explicitly set button type
          variant="default" 
          className="w-full mt-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
          onClick={handleNavigate} // Use the handler function
        > 
          {isInProgress ? "Continue Learning" : "View Course"}
        </Button>
      </div>
    </div>
  );
}

export default CourseCard;

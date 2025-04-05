import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, GripVertical, Video, FileText, Loader2, UploadCloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Placeholder types - replace with actual Prisma types later
type Lesson = {
  id: number;
  title: string;
  position: number;
  content?: string | null;
  videoUrl?: string | null;
  duration?: number | null; // Optional duration in seconds
};

interface LessonListProps {
  moduleId: number;
}

export function LessonList({ moduleId }: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Optional progress tracking

  // State for editing lessons
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  // Add state for editing content/video if needed later

  // Fetch lessons for the module
  useEffect(() => {
    const fetchLessons = async () => {
      if (!moduleId) return;
      setIsLoading(true);
      console.log(`Fetching lessons for module ID: ${moduleId}`);
      try {
        const response = await fetch(`/api/modules/${moduleId}/lessons`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Lesson[] = await response.json();
        setLessons(data.sort((a, b) => a.position - b.position));
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        // TODO: Add user-facing error handling
      } finally {
        setIsLoading(false);
      }
    };
    fetchLessons();
  }, [moduleId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedVideoFile(event.target.files[0]);
      console.log("Selected file:", event.target.files[0].name);
    } else {
      setSelectedVideoFile(null);
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;

    let uploadedVideoUrl: string | null = null;

    // --- Video Upload Logic ---
    if (selectedVideoFile) {
      setIsUploading(true);
      setUploadProgress(0); // Reset progress
      console.log(`Uploading video: ${selectedVideoFile.name}`);
      try {
        const formData = new FormData();
        formData.append('video', selectedVideoFile); // 'video' must match uploadVideo.single('video') in backend

        // Real API call to upload video
        const uploadResponse = await fetch('/api/upload/video', {
          method: 'POST',
          body: formData,
          // Note: Don't set Content-Type header for FormData, browser does it correctly with boundary
          // Optional: Add progress tracking using XMLHttpRequest if needed
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || `Upload failed with status: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        uploadedVideoUrl = uploadResult.videoUrl; // Get URL from backend response

        if (!uploadedVideoUrl) {
          throw new Error("Backend did not return a video URL after upload.");
        }
        
        console.log(`Video uploaded to: ${uploadedVideoUrl}`);
        setUploadProgress(100); // Mark as complete

      } catch (error) {
        console.error("Failed to upload video:", error);
        alert("Video upload failed. Please try again.");
        setIsUploading(false);
        return; // Stop lesson creation if upload fails
      } finally {
        setIsUploading(false);
      }
    }
    // --- End Video Upload Logic ---

    console.log(`Adding lesson: ${newLessonTitle}`);
    const newPosition = lessons.length > 0 ? Math.max(...lessons.map(l => l.position)) + 1 : 1;
    
    try {
      const lessonPayload = {
        moduleId: moduleId,
        title: newLessonTitle,
        position: newPosition,
        content: newLessonContent || null,
        videoUrl: uploadedVideoUrl, // Use the URL from upload
        // Duration might be calculated/set on backend after video processing
      };

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newLesson: Lesson = await response.json();
      setLessons([...lessons, newLesson].sort((a, b) => a.position - b.position));
      
      // Reset form
      setNewLessonTitle('');
      setNewLessonContent('');
      setSelectedVideoFile(null);
      setShowAddForm(false);

    } catch (error) {
      console.error("Failed to add lesson:", error);
      // TODO: Add user-facing error handling
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
     if (!confirm('Are you sure you want to delete this lesson?')) return;
     console.log(`Deleting lesson ID: ${lessonId}`);
     try {
       const response = await fetch(`/api/lessons/${lessonId}`, { // Assuming DELETE /api/lessons/:id exists
         method: 'DELETE',
       });
       if (!response.ok) {
          if (response.status !== 204) { 
             throw new Error(`HTTP error! status: ${response.status}`);
          }
       }
       setLessons(lessons.filter(l => l.id !== lessonId));
       // Note: Backend should handle deleting associated video file if necessary
     } catch (error) {
       console.error("Failed to delete lesson:", error);
      // TODO: Add user-facing error handling
     }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonTitle(lesson.title);
    // TODO: Set state for editing content/video if needed
  };

  const handleSaveLessonEdit = async (lessonId: number) => {
    if (!editingLessonTitle.trim()) return; // Maybe allow empty if needed?
    console.log(`Saving edit for lesson ID ${lessonId}: ${editingLessonTitle}`);
    try {
      // Replace with actual API call: PUT /api/lessons/:lessonId (body: { title, ... })
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
      
      // Assuming backend returns the updated lesson
      const updatedLessonFromServer: Lesson = { 
          id: lessonId, 
          title: editingLessonTitle, 
          position: lessons.find(l => l.id === lessonId)?.position ?? 0, // Keep original position
          // Include other fields from backend response
      }; 

      setLessons(lessons.map(l => 
          l.id === lessonId ? updatedLessonFromServer : l
      ).sort((a, b) => a.position - b.position)); // Maintain sort order
      
      setEditingLessonId(null); // Exit editing mode
      setEditingLessonTitle('');
    } catch (error) {
      console.error("Failed to save lesson edit:", error);
      // TODO: Add user-facing error handling
    }
  };

  // TODO: Implement drag-and-drop reordering

  return (
    <div className="pl-8 mt-3 space-y-3 border-l border-dashed ml-4">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900/50 shadow-sm">
             <div className="flex items-center gap-3 flex-grow min-w-0"> {/* Added min-w-0 for flex truncation */}
                <GripVertical className="h-4 w-4 text-slate-400 cursor-grab flex-shrink-0" />
                {lesson.videoUrl ? <Video className="h-4 w-4 text-blue-500 flex-shrink-0" /> : <FileText className="h-4 w-4 text-slate-500 flex-shrink-0" />}
                
                {/* Display Input or Title based on editing state */}
                {editingLessonId === lesson.id ? (
                  <Input 
                    value={editingLessonTitle}
                    onChange={(e) => setEditingLessonTitle(e.target.value)}
                    onBlur={() => handleSaveLessonEdit(lesson.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveLessonEdit(lesson.id)}
                    className="h-7 text-sm flex-grow" // Adjusted height and added flex-grow
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium flex-grow truncate" title={lesson.title}>{lesson.title}</span>
                )}

                {lesson.duration && editingLessonId !== lesson.id && ( // Hide duration while editing title
                   <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{Math.floor(lesson.duration / 60)} min</span>
                )}
             </div>
             <div className="flex items-center gap-1 flex-shrink-0">
                {/* Edit/Cancel Button */}
                {editingLessonId === lesson.id ? (
                   <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingLessonId(null)}>Cancel</Button>
                ) : (
                   <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditLesson(lesson)}>
                      <Edit2 className="h-3.5 w-3.5" />
                   </Button>
                )}
                <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 h-7 w-7" onClick={() => handleDeleteLesson(lesson.id)}>
                   <Trash2 className="h-3.5 w-3.5" />
                </Button>
             </div>
          </div>
        ))
      )}

      {/* Add New Lesson Form Toggle/Display */}
      {showAddForm ? (
        <Card className="bg-white dark:bg-slate-900/50 shadow-sm mt-3">
          <CardHeader className="p-3">
            <CardTitle className="text-base">Add New Lesson</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            <Input 
              placeholder="Lesson Title" 
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              className="h-9"
            />
            <Textarea 
              placeholder="Lesson content (optional, if not using video)"
              value={newLessonContent}
              onChange={(e) => setNewLessonContent(e.target.value)}
              rows={3}
            />
            <div>
              <label className="text-sm font-medium block mb-1.5">Video (Optional)</label>
              <div className="flex items-center gap-2">
                 <label className="flex-grow cursor-pointer border border-dashed rounded-md p-2 text-center text-sm text-slate-500 hover:border-slate-400">
                    <UploadCloud className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    {selectedVideoFile ? selectedVideoFile.name : 'Click or drag to upload'}
                    <Input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                 </label>
                 {selectedVideoFile && (
                    <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8" onClick={() => setSelectedVideoFile(null)}>
                       <Trash2 className="h-4 w-4" />
                    </Button>
                 )}
              </div>
              {isUploading && (
                 <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                       <span>Uploading...</span>
                       <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                       <div className="h-1 bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                 </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddLesson} disabled={!newLessonTitle.trim() || isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" /> Add Lesson
        </Button>
      )}
    </div>
  );
}

export default LessonList;

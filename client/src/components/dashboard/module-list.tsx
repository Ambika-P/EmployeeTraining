import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LessonList } from './lesson-list'; // Import LessonList

// Placeholder types - replace with actual Prisma types later
type Module = {
  id: number;
  title: string;
  position: number;
  // lessons: Lesson[]; // Add lessons later
};

interface ModuleListProps {
  courseId: number;
}

export function ModuleList({ courseId }: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  // Fetch modules for the course
  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) return; // Don't fetch if courseId isn't available yet
      setIsLoading(true);
      console.log(`Fetching modules for course ID: ${courseId}`);
      try {
        const response = await fetch(`/api/courses/${courseId}/modules`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Module[] = await response.json();
        setModules(data.sort((a, b) => a.position - b.position));
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        // TODO: Add user-facing error handling
      } finally {
        setIsLoading(false);
      }
    };
    fetchModules();
  }, [courseId]);

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    console.log(`Adding module: ${newModuleTitle}`);
    // Determine the position for the new module
    const newPosition = modules.length > 0 ? Math.max(...modules.map(m => m.position)) + 1 : 1;
    try {
       const response = await fetch('/api/modules', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
           courseId: courseId, 
           title: newModuleTitle, 
           position: newPosition 
         }),
       });
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       const newModule: Module = await response.json();
       setModules([...modules, newModule].sort((a, b) => a.position - b.position));
       setNewModuleTitle(''); // Clear input
    } catch (error) {
      console.error("Failed to add module:", error);
      // TODO: Add user-facing error handling
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModuleId(module.id);
    setEditingModuleTitle(module.title);
  };

  const handleSaveEdit = async (moduleId: number) => {
     if (!editingModuleTitle.trim()) return;
     console.log(`Saving edit for module ID ${moduleId}: ${editingModuleTitle}`);
     try {
        const response = await fetch(`/api/modules/${moduleId}`, { // Assuming PUT /api/modules/:id exists
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editingModuleTitle }), 
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedModule: Module = await response.json();
        setModules(modules.map(m => 
            m.id === moduleId ? updatedModule : m
        ).sort((a, b) => a.position - b.position)); // Ensure sort order is maintained
        setEditingModuleId(null); // Exit editing mode
        setEditingModuleTitle('');
     } catch (error) {
        console.error("Failed to save module edit:", error);
        // TODO: Add user-facing error handling
     }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    console.log(`Deleting module ID: ${moduleId}`);
    try {
       const response = await fetch(`/api/modules/${moduleId}`, { // Assuming DELETE /api/modules/:id exists
         method: 'DELETE',
       });
       if (!response.ok) {
         // Handle 204 No Content success specifically if backend returns that
         if (response.status !== 204) { 
            throw new Error(`HTTP error! status: ${response.status}`);
         }
       }
       setModules(modules.filter(m => m.id !== moduleId));
    } catch (error) {
      console.error("Failed to delete module:", error);
      // TODO: Add user-facing error handling
    }
  };

  // TODO: Implement drag-and-drop reordering

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Modules</h3>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => (
            <Card key={module.id} className="bg-slate-50 dark:bg-slate-800/50">
              <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
                <div className="flex items-center gap-3 flex-grow">
                   <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" /> {/* Drag handle */}
                   {editingModuleId === module.id ? (
                     <Input 
                       value={editingModuleTitle}
                       onChange={(e) => setEditingModuleTitle(e.target.value)}
                       onBlur={() => handleSaveEdit(module.id)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(module.id)}
                       className="h-8 flex-grow"
                       autoFocus
                     />
                   ) : (
                     <CardTitle className="text-lg font-medium flex-grow">{module.title}</CardTitle>
                   )}
                </div>
                <div className="flex items-center gap-1">
                   {editingModuleId === module.id ? (
                     <Button size="sm" variant="ghost" onClick={() => setEditingModuleId(null)}>Cancel</Button>
                   ) : (
                     <Button size="icon" variant="ghost" onClick={() => handleEditModule(module)}>
                       <Edit2 className="h-4 w-4" />
                     </Button>
                   )}
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteModule(module.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                 {/* Render LessonList for this module */}
                 <LessonList moduleId={module.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Module Form */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter new module title"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
            />
            <Button onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add Module
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ModuleList;

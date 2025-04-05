import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, FileText, ClipboardCheck, MoreHorizontal, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Assessments() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const assessments = [
    {
      id: 1,
      title: "JavaScript Fundamentals Quiz",
      description: "Test your knowledge of JavaScript basics",
      course: "JavaScript Fundamentals",
      questions: 15,
      timeLimit: 30,
      attempts: 156,
      avgScore: 78,
      lastUpdated: "2023-08-15",
      status: "active",
    },
    {
      id: 2,
      title: "React Components Mid-Term Test",
      description: "Comprehensive assessment on React components and props",
      course: "React for Beginners",
      questions: 20,
      timeLimit: 45,
      attempts: 98,
      avgScore: 72,
      lastUpdated: "2023-08-20",
      status: "active",
    },
    {
      id: 3,
      title: "CSS Grid Final Exam",
      description: "Final assessment on CSS Grid layouts and responsive design",
      course: "Advanced CSS Techniques",
      questions: 25,
      timeLimit: 60,
      attempts: 45,
      avgScore: 65,
      lastUpdated: "2023-08-25",
      status: "draft",
    },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Assessments</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create and manage quizzes, tests, and exams
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search assessments..." className="pl-8" />
          </div>
          <div className="flex gap-2">
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="all">All Courses</option>
              <option value="js">JavaScript Fundamentals</option>
              <option value="react">React for Beginners</option>
              <option value="css">Advanced CSS Techniques</option>
            </select>
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        
        <Tabs defaultValue="list">
          <TabsList className="mb-6">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50 dark:bg-slate-800/50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Assessment Title</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Course</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Questions</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Time Limit</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Attempts</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Score</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((assessment) => (
                        <tr key={assessment.id} className="border-b">
                          <td className="px-4 py-3 text-sm font-medium">
                            {assessment.title}
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {assessment.description}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{assessment.course}</td>
                          <td className="px-4 py-3 text-sm">{assessment.questions}</td>
                          <td className="px-4 py-3 text-sm">{assessment.timeLimit} min</td>
                          <td className="px-4 py-3 text-sm">{assessment.attempts}</td>
                          <td className="px-4 py-3 text-sm">{assessment.avgScore}%</td>
                          <td className="px-4 py-3 text-sm">
                            <StatusBadge status={assessment.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Assessment
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ClipboardCheck className="mr-2 h-4 w-4" />
                                  View Results
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{assessment.title}</CardTitle>
                        <CardDescription>{assessment.description}</CardDescription>
                      </div>
                      <StatusBadge status={assessment.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Course</span>
                        <span className="text-sm font-medium">{assessment.course}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Questions</div>
                          <div className="text-sm font-medium flex items-center">
                            <ClipboardCheck className="mr-2 h-4 w-4 text-slate-400" />
                            {assessment.questions}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Time Limit</div>
                          <div className="text-sm font-medium flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-slate-400" />
                            {assessment.timeLimit} min
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Attempts</div>
                          <div className="text-sm font-medium">{assessment.attempts}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Avg. Score</div>
                          <div className="text-sm font-medium">{assessment.avgScore}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t pt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      View Results
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {assessments.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ClipboardCheck className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Assessments Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              You haven't created any quizzes or tests yet. Assessments help you evaluate learning outcomes.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Assessment
            </Button>
          </div>
        )}
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
    case "active":
      badgeClasses = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "draft":
      badgeClasses = "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400";
      break;
    default:
      badgeClasses = "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-400";
  }
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
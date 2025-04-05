import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, BarChart, PieChart, LineChart, Users, Clock, BookOpen, Award, Download, 
  FileText, BarChart2
} from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const courseData = [
    { name: "JavaScript Fundamentals", enrollment: 124, completion: 68, avgScore: 82 },
    { name: "React for Beginners", enrollment: 98, completion: 45, avgScore: 78 },
    { name: "Advanced CSS Techniques", enrollment: 76, completion: 32, avgScore: 75 },
    { name: "Introduction to TypeScript", enrollment: 52, completion: 18, avgScore: 70 },
    { name: "Data Analysis with Python", enrollment: 42, completion: 10, avgScore: 65 },
  ];
  
  // Stats cards data
  const statsData = [
    {
      title: "Total Users",
      value: "1,254",
      change: "+12%",
      positive: true,
      icon: <Users className="h-4 w-4" />,
      description: "Active learners in platform",
    },
    {
      title: "Course Completion",
      value: "67%",
      change: "+5%",
      positive: true,
      icon: <BookOpen className="h-4 w-4" />,
      description: "Average completion rate",
    },
    {
      title: "Avg. Engagement",
      value: "3.8h",
      change: "+0.5h",
      positive: true,
      icon: <Clock className="h-4 w-4" />,
      description: "Weekly time spent learning",
    },
    {
      title: "Certificates Issued",
      value: "358",
      change: "+24",
      positive: true,
      icon: <Award className="h-4 w-4" />,
      description: "Last 30 days",
    },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Analytics</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Monitor learning metrics and platform performance
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <select className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm mr-2">
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</span>
                  <span className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    {stat.icon}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={`text-xs ${stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Course Enrollments</CardTitle>
                      <CardDescription>Tracking monthly enrollments</CardDescription>
                    </div>
                    <AreaChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Enrollment chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Completion Rates</CardTitle>
                      <CardDescription>Course completion trends</CardDescription>
                    </div>
                    <LineChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Completion rate chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Platform Engagement</CardTitle>
                    <CardDescription>Daily active users and session duration</CardDescription>
                  </div>
                  <AreaChart className="h-4 w-4 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <div className="text-center">
                    <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Platform engagement visualization would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="courses">
            {/* Course Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Popular Courses</CardTitle>
                      <CardDescription>By enrollment numbers</CardDescription>
                    </div>
                    <BarChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {courseData.map((course, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{course.name}</p>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (course.enrollment / 150) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{course.enrollment}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Course Distribution</CardTitle>
                      <CardDescription>By category</CardDescription>
                    </div>
                    <PieChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Course distribution chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Completion rates and assessment scores</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Course Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Enrollments</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Completion</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Score</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-slate-500 dark:text-slate-400">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseData.map((course, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3 text-sm font-medium">{course.name}</td>
                          <td className="px-4 py-3 text-sm">{course.enrollment}</td>
                          <td className="px-4 py-3 text-sm">{course.completion}%</td>
                          <td className="px-4 py-3 text-sm">{course.avgScore}%</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            {/* User Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>New registrations over time</CardDescription>
                    </div>
                    <LineChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        User growth chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Users</CardTitle>
                      <CardDescription>Daily and monthly active users</CardDescription>
                    </div>
                    <AreaChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Active users chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Demographics</CardTitle>
                    <CardDescription>User distribution by department and role</CardDescription>
                  </div>
                  <PieChart className="h-4 w-4 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <div className="text-center">
                    <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      User demographics visualization would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assessments">
            {/* Assessment Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Assessment Performance</CardTitle>
                      <CardDescription>Average scores by assessment</CardDescription>
                    </div>
                    <BarChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Assessment performance chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Question Analysis</CardTitle>
                      <CardDescription>Identifying challenging questions</CardDescription>
                    </div>
                    <BarChart className="h-4 w-4 text-slate-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Question analysis chart visualization would appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Assessment Completion Trends</CardTitle>
                <CardDescription>Tracking assessment attempts and completions over time</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-md">
                  <div className="text-center">
                    <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Assessment trends visualization would appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
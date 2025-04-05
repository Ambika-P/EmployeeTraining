import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Lock, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccessControl() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const courseAccess = [
    { id: 1, course: "React Fundamentals", accessType: "Group", assignedTo: "Engineering Team", date: "2023-08-15" },
    { id: 2, course: "Agile Project Management", accessType: "User", assignedTo: "John Doe", date: "2023-08-12" },
    { id: 3, course: "Data Analysis with Python", accessType: "Group", assignedTo: "Data Science Team", date: "2023-08-10" },
    { id: 4, course: "Digital Marketing Essentials", accessType: "Group", assignedTo: "Marketing Team", date: "2023-08-08" },
    { id: 5, course: "Leadership Skills", accessType: "User", assignedTo: "Sarah Williams", date: "2023-08-01" },
  ];
  
  const roles = [
    { id: 1, name: "Employee", description: "Learn and complete courses", permissions: 3 },
    { id: 2, name: "Contributor", description: "Create and manage courses", permissions: 8 },
    { id: 3, name: "Admin", description: "Full system access", permissions: 15 },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Access Control</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage course access and permissions
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <Tabs defaultValue="courseAccess">
          <TabsList className="mb-6">
            <TabsTrigger value="courseAccess">Course Access</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courseAccess">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search course access..." className="pl-8" />
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Access
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Access Assignments</CardTitle>
                <CardDescription>Control who can access which courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Access Type</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Date Assigned</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseAccess.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.course}</TableCell>
                        <TableCell>{item.accessType}</TableCell>
                        <TableCell>{item.assignedTo}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Role Management</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {role.permissions} permissions
                      </span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      {role.name === "Employee" && (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>View assigned courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Complete lessons</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Take assessments</span>
                          </div>
                        </>
                      )}
                      
                      {role.name === "Contributor" && (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Create courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Edit own content</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>View analytics</span>
                          </div>
                        </>
                      )}
                      
                      {role.name === "Admin" && (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Manage users</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>Approve courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span>System settings</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
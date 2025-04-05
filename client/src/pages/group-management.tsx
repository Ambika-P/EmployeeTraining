import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersRound, Search, MoreHorizontal, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GroupManagement() {
  const { user } = useAuth();
  
  // Mock data for demonstration
  const groups = [
    { id: 1, name: "Engineering Team", members: 18, courses: 12, createdAt: "2023-05-12" },
    { id: 2, name: "Marketing Department", members: 12, courses: 8, createdAt: "2023-06-23" },
    { id: 3, name: "Sales Team", members: 24, courses: 15, createdAt: "2023-04-05" },
    { id: 4, name: "HR Department", members: 6, courses: 10, createdAt: "2023-07-18" },
    { id: 5, name: "Executive Team", members: 5, courses: 5, createdAt: "2023-03-30" },
  ];
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Group Management</h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button>
              <UsersRound className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search groups..." className="pl-8" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Assigned Courses</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-14"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.members}</TableCell>
                  <TableCell>{group.courses}</TableCell>
                  <TableCell>{group.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>Assign Courses</DropdownMenuItem>
                        <DropdownMenuItem>Edit Group</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          Delete Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing 1-5 of 12 groups
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
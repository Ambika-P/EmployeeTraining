import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsersRound, Search, MoreHorizontal, UserPlus, Badge } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";

export default function GroupManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editSelectedUsers, setEditSelectedUsers] = useState([]);
  const [editSelectedCourses, setEditSelectedCourses] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<any>(null);


  const handleEditClick = (group) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
    setEditSelectedUsers(group.members);
    setEditSelectedCourses(group.courses);
    setEditOpen(true);
  };


  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setDetailsOpen(true);
  };

  const handleUpdateGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${editingGroupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editGroupName,
          userIds: editSelectedUsers.map((u) => u.id),
          courseIds: editSelectedCourses.map((c) => c.id),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update group");
      }
      setEditOpen(false);
      fetchGroups();
      toast({
        title: "Success",
        description: "Group updated successfully",
      });
    } catch (err) {
      console.error("Error updating group:", err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleOpenDeleteDialog = (group: any) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };


  useEffect(() => {
    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));

    // Fetch courses
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data));

    // Fetch groups
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert("Please enter group name");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName,
        userIds: selectedUsers.map((u) => u.id),
        courseIds: selectedCourses.map((c) => c.id),
      }),
    });

    if (res.ok) {
      toast({
        title: "Success",
        description: "Group added successfully",
      });
      setGroupName("");
      setSelectedUsers([]);
      setSelectedCourses([]);
      setOpen(false);
      fetchGroups(); // Refresh group list
    } else {
      toast({
        title: "Error",
        description: "Error creating a Group",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDeleteGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log(response);

        fetchGroups();
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
        toast({
          title: "Success",
          description: "Group deleted successfully",
        });
      } else {
        console.error('Failed to delete group');
        toast({
          title: "Error",
          description: "Failed to delete group",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Group Management</h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={() => setOpen(true)}>
              <UsersRound className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Table */}
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
              {loadingGroups ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No groups found</TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.members.length}</TableCell>

                    <TableCell>{group.courses.length}</TableCell>


                    <TableCell>
                      {new Date(group.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(group)}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(group)}>Edit Group</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleOpenDeleteDialog(group)}
                          >
                            Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {groups.length} group{groups.length !== 1 ? "s" : ""}
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

      {/* Dialog for Create Group */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Add a group name, select users and assign courses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <MultiSelect
              label="Select Users"
              labelKey="username"
              options={users}
              selected={selectedUsers}
              onChange={setSelectedUsers}
            />
            <MultiSelect
              label="Select Courses"
              labelKey="title"
              options={courses}
              selected={selectedCourses}
              onChange={setSelectedCourses}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
          </DialogHeader>

          {selectedGroup && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Group Name:</p>
                <span>{selectedGroup.name}</span>
              </div>

              <div>
                <p className="font-semibold">Members:</p>
                <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                  {selectedGroup.members?.map((user) => (
                    <li key={user.id}>{user.username}</li>
                  ))}
                </ul>

              </div>

              <div>
                <p className="font-semibold">Courses:</p>
                <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                  {selectedGroup.courses?.map((course) => (
                    <li key={course.id}>{course.title}</li>
                  ))}
                </ul>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group name, members, and assigned courses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Name
              </label>
              <Input
                placeholder="Enter group name"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
              />
            </div>
            <MultiSelect
              label="Select Users"
              labelKey="username"
              options={users}
              selected={editSelectedUsers}
              onChange={setEditSelectedUsers}
            />
            <MultiSelect
              label="Select Courses"
              labelKey="title"
              options={courses}
              selected={editSelectedCourses}
              onChange={setEditSelectedCourses}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateGroup}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete group{" "}
              <span className="font-semibold">{groupToDelete?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteGroup}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



    </MainLayout>
  );
}

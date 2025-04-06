import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Home,
  Store,
  Medal,
  User,
  Settings,
  FileEdit,
  Video,
  HelpCircle,
  LineChart,
  UserCog,
  Users,
  CheckSquare,
  Lock,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const role = user?.role || "employee";

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const NavItem = ({ href, icon: Icon, label, itemKey }: { href: string; icon: React.ElementType; label: string; itemKey: string }) => (
    <Link href={href}>
      <a
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
          isActive(href)
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        )}
      >
        <Icon className={cn(
          "mr-3 h-5 w-5",
          isActive(href) 
            ? "text-blue-600 dark:text-blue-500" 
            : "text-slate-500 dark:text-slate-400"
        )} />
        <span>{label}</span>
      </a>
    </Link>
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700",
        className
      )}
    >
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto sidebar-scroll-container">
        <div className="px-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Dashboard
          </h2>
          <div className="mt-2 space-y-1">
            <NavItem href="/" icon={Home} label="Overview" itemKey="overview" />
            <NavItem href="/my-courses" icon={BookOpen} label="My Courses" itemKey="my-courses" />
            <NavItem href="/course-catalog" icon={Store} label="Course Catalog" itemKey="course-catalog" />
            <NavItem href="/certificates" icon={Medal} label="Certificates" itemKey="certificates" />
          </div>
        </div>

        <div className="mt-6 px-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Account
          </h2>
          <div className="mt-2 space-y-1">
            <NavItem href="/profile" icon={User} label="Profile" itemKey="profile" />
            <NavItem href="/settings" icon={Settings} label="Settings" itemKey="settings" />
          </div>
        </div>

        {(role === "contributor" || role === "admin") && (
          <div className="mt-6 px-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Content Management
            </h2>
            <div className="mt-2 space-y-1">
              <NavItem href="/my-content" icon={FileEdit} label="My Content" itemKey="my-content" />
              <NavItem href="/videos" icon={Video} label="Videos" itemKey="videos" />
              <NavItem href="/assessments" icon={HelpCircle} label="Assessments" itemKey="assessments" />
              <NavItem href="/analytics" icon={LineChart} label="Analytics" itemKey="analytics" />
            </div>
          </div>
        )}

        {role === "admin" && (
          <div className="mt-6 px-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Administration
            </h2>
            <div className="mt-2 space-y-1">
              <NavItem href="/user-management" icon={UserCog} label="User Management" itemKey="user-management" />
              <NavItem href="/group-management" icon={Users} label="Group Management" itemKey="group-management" />
              <NavItem href="/category-management" icon={FileEdit} label="Category Management" itemKey="category-management" />
              <NavItem href="/course-approval" icon={CheckSquare} label="Course Approval" itemKey="course-approval" />
              <NavItem href="/access-control" icon={Lock} label="Access Control" itemKey="access-control" />
              <NavItem href="/system-settings" icon={Settings} label="System Settings" itemKey="system-settings" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex border-t border-slate-200 p-4 dark:border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-500 dark:text-slate-400" />
          <span>Sign out</span>
        </Button>
      </div>
    </div>
  );
}

export default Sidebar;

import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<number>(2); // Sample notification count

  const getInitials = () => {
    if (!user) return "?";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    
    return "?";
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex-shrink-0 flex items-center ml-0 lg:ml-0">
            <span className="font-bold text-xl text-slate-900 dark:text-white">LMS</span>
          </Link>
        </div>

        {/* Search input */}
        <div className="flex-1 max-w-xl mx-auto lg:max-w-2xl px-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <Input
              className="pl-10 bg-white dark:bg-slate-800"
              type="search"
              placeholder="Search..."
              id="search"
            />
          </div>
        </div>

        {/* Right side navigation items */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Dark mode toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
                <span className="sr-only">View notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-72 overflow-y-auto py-1">
                <div className="py-2 px-4">
                  <div className="font-medium">New course available</div>
                  <div className="text-sm text-gray-500">TypeScript Essentials is now available.</div>
                </div>
                <DropdownMenuSeparator />
                <div className="py-2 px-4">
                  <div className="font-medium">Assignment due soon</div>
                  <div className="text-sm text-gray-500">React Hooks assignment due in 2 days.</div>
                </div>
                <DropdownMenuSeparator />
                <div className="py-2 px-4">
                  <div className="font-medium">Course update</div>
                  <div className="text-sm text-gray-500">JavaScript Fundamentals module has been updated.</div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">
                <Button variant="ghost" className="w-full justify-center">View all notifications</Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative rounded-full h-8 w-8 p-0 overflow-hidden"
              >
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt={user?.username || "User"} />
                  <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.username || "User"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/system-settings">System Settings</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;

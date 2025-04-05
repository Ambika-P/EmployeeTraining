import { useState, ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <Header onMobileMenuToggle={toggleMobileMenu} />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <Sidebar className="h-[calc(100vh-4rem)] sticky top-16" />
        </div>

        {/* Mobile menu backdrop */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 bg-slate-900 bg-opacity-75 z-40 transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={closeMobileMenu}
        />

        {/* Mobile sidebar */}
        <div
          className={cn(
            "lg:hidden fixed inset-y-0 left-0 flex flex-col w-72 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="font-bold text-xl text-slate-900 dark:text-white">LMS</span>
            <button
              type="button"
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={closeMobileMenu}
            >
              <span className="sr-only">Close menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider } from "@/context/auth-context";
import { ProtectedRoute } from "@/lib/protected-route";

import Dashboard from "@/pages/dashboard";
import CourseCatalog from "@/pages/course-catalog";
import MyCourses from "@/pages/my-courses";
import Certificates from "@/pages/certificates";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import MyContent from "@/pages/my-content";
import Videos from "@/pages/videos";
import Assessments from "@/pages/assessments";
import Analytics from "@/pages/analytics";
import UserManagement from "@/pages/user-management";
import GroupManagement from "@/pages/group-management";
import CourseApproval from "@/pages/course-approval";
import AccessControl from "@/pages/access-control";
import SystemSettings from "@/pages/system-settings";
import CourseDetail from "@/pages/course-detail";
import CourseContent from "@/pages/course-content";
import Quiz from "@/pages/quiz";
import AuthPage from "@/pages/auth-page";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import CreateCoursePage from "./pages/create-course";
import EditCoursePage from "./pages/edit-course"; // Import EditCoursePage

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/course-catalog" component={CourseCatalog} />
      <ProtectedRoute path="/my-courses" component={MyCourses} />
      <ProtectedRoute path="/certificates" component={Certificates} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/my-content" component={MyContent} />
      <ProtectedRoute path="/videos" component={Videos} />
      <ProtectedRoute path="/assessments" component={Assessments} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/user-management" component={UserManagement} />
      <ProtectedRoute path="/group-management" component={GroupManagement} />
      <ProtectedRoute path="/course-approval" component={CourseApproval} />
      <ProtectedRoute path="/access-control" component={AccessControl} />
      <ProtectedRoute path="/system-settings" component={SystemSettings} />
      <ProtectedRoute path="/course-detail/:id" component={CourseDetail} /> {/* Use path param */}
      <ProtectedRoute path="/course-content" component={CourseContent} />
      <ProtectedRoute path="/create-course" component={CreateCoursePage} />
      <ProtectedRoute path="/edit-course/:id" component={EditCoursePage} /> {/* Add Edit Course Route */}
      <ProtectedRoute path="/quiz" component={Quiz} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

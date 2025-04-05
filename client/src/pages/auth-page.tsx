import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { MoonIcon, SunIcon, BookOpen, GraduationCap, BarChart3, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const { theme, setTheme } = useTheme();

  // Redirect to dashboard if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Left side - Auth forms */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 relative">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5 text-yellow-500" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-700" />
            )}
          </Button>
        </div>
        
        <div className="mx-auto w-full max-w-sm lg:w-[420px]">
          <div className="text-center lg:text-left mb-8">
            <div className="flex items-center mb-4">
              <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                LearnSphere
              </h2>
            </div>
            <p className="text-base text-slate-600 dark:text-slate-400">
              A modern learning management system for organizations
            </p>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            <div>
              <TabsContent value="login">
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Sign in to your account</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="register">
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Create a new account</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Fill in your details to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          <div className="relative z-10 flex flex-col justify-center items-start h-full px-16 text-white">
            <h1 className="text-4xl font-bold mb-8 leading-tight">Enhance your skills with our modern learning platform</h1>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-500/30 p-3 rounded-lg mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Comprehensive Courses</h3>
                  <p className="text-blue-100 text-sm">Access hundreds of courses across various disciplines</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-500/30 p-3 rounded-lg mr-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Learn at Your Own Pace</h3>
                  <p className="text-blue-100 text-sm">Flexible learning schedule that fits your busy lifestyle</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-500/30 p-3 rounded-lg mr-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Professional Certificates</h3>
                  <p className="text-blue-100 text-sm">Earn recognized certificates upon course completion</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-500/30 p-3 rounded-lg mr-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Track Your Progress</h3>
                  <p className="text-blue-100 text-sm">Visual analytics to monitor your learning journey</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-8 right-8 text-xs text-blue-200 opacity-70">
              © 2025 LearnSphere. All rights reserved.
            </div>
          </div>
          
          {/* Abstract shapes for visual interest */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-indigo-900/30 to-transparent"></div>
          <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-[20%] left-[5%] w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/theme-context";
import { Moon, Sun, Monitor, Download, LogOut, Languages, Clock } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your app preferences and account settings
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reducedMotion">Reduced motion</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch id="reducedMotion" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highContrast">High contrast</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Increase contrast for better readability
                  </p>
                </div>
                <Switch id="highContrast" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
              <CardDescription>Configure your language and date format preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <div className="flex items-center">
                  <Languages className="mr-2 h-4 w-4 text-slate-400" />
                  <select id="language" className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                  <select id="dateFormat" className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                    <option value="mdy">MM/DD/YYYY</option>
                    <option value="dmy">DD/MM/YYYY</option>
                    <option value="ymd">YYYY/MM/DD</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select id="timezone" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                  <option value="utc">UTC (GMT+0)</option>
                  <option value="et">Eastern Time (GMT-5)</option>
                  <option value="ct">Central Time (GMT-6)</option>
                  <option value="mt">Mountain Time (GMT-7)</option>
                  <option value="pt">Pacific Time (GMT-8)</option>
                  <option value="cet">Central European Time (GMT+1)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Allow us to collect anonymous usage data
                  </p>
                </div>
                <Switch id="analytics" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch id="profileVisibility" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="progressVisibility">Learning Progress Visibility</Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Allow instructors to view your learning progress
                  </p>
                </div>
                <Switch id="progressVisibility" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Privacy Settings</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full flex justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export Your Data
              </Button>
              
              <Button variant="destructive" className="w-full flex justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out from All Devices
              </Button>
              
              <div className="pt-4 border-t">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Deactivating your account will remove your profile and all your data from the platform.
                </p>
                <Button variant="outline" className="text-red-500 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950">
                  Deactivate Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
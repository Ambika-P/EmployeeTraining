import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SystemSettings() {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">System Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure global system preferences
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic system configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="Learning Management System" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Input id="site-description" defaultValue="Corporate learning portal for employee development" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Administrator Email</Label>
                  <Input id="admin-email" defaultValue="admin@example.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <select id="default-timezone" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                    <option value="utc">UTC (GMT+0)</option>
                    <option value="et">Eastern Time (GMT-5)</option>
                    <option value="pt">Pacific Time (GMT-8)</option>
                    <option value="cet">Central European Time (GMT+1)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <select id="default-language" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notification">Email Notifications</Label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Send system notifications via email
                    </div>
                  </div>
                  <Switch id="email-notification" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-20 w-full rounded-md bg-white border border-slate-200 shadow-sm"></div>
                      <Label className="text-sm">Light</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-20 w-full rounded-md bg-slate-900 border border-slate-700 shadow-sm"></div>
                      <Label className="text-sm">Dark</Label>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-20 w-full rounded-md bg-gradient-to-r from-slate-100 via-white to-slate-800 border border-slate-200 shadow-sm"></div>
                      <Label className="text-sm">System</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 border border-slate-200 shadow-sm"></div>
                    <div className="h-8 w-8 rounded-full bg-purple-600 border border-slate-200 shadow-sm"></div>
                    <div className="h-8 w-8 rounded-full bg-green-600 border border-slate-200 shadow-sm"></div>
                    <div className="h-8 w-8 rounded-full bg-red-600 border border-slate-200 shadow-sm"></div>
                    <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-200 shadow-sm"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <Input id="logo-upload" type="file" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-css">Custom CSS</Label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Allow custom CSS for the platform
                    </div>
                  </div>
                  <Switch id="custom-css" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure system security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password-policy">Password Policy</Label>
                  <select id="password-policy" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                    <option value="basic">Basic (min 6 characters)</option>
                    <option value="standard">Standard (min 8 chars, 1 uppercase, 1 number)</option>
                    <option value="strong">Strong (min 10 chars, mixed case, numbers, symbols)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <select id="session-timeout" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="force-ssl">Force SSL</Label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Force all connections to use HTTPS
                    </div>
                  </div>
                  <Switch id="force-ssl" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Require 2FA for administrative accounts
                    </div>
                  </div>
                  <Switch id="two-factor" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lockout">Account Lockout</Label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Lock accounts after failed login attempts
                    </div>
                  </div>
                  <Switch id="lockout" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect with external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-slate-900 dark:text-white">Google Workspace</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Sync users with Google Workspace
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-slate-900 dark:text-white">Microsoft 365</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Sync users with Microsoft 365
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-slate-900 dark:text-white">Slack</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Send notifications to Slack
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-slate-900 dark:text-white">Zoom</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Integration with Zoom meetings
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="api-key"
                      value="••••••••••••••••••••••••••••••"
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Use this API key to access the system programmatically
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
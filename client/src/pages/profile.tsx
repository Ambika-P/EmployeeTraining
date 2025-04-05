import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, Mail, Phone, MapPin, Briefcase, GraduationCap, User, ShieldCheck, Bell } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="bg-white dark:bg-slate-900 shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white">Profile</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-6">
              <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 shadow rounded-lg mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1">John Doe</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">john.doe@example.com</p>
                <Badge className="mb-3">Employee</Badge>
                <Button variant="outline" size="sm" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">Profile Completion</h3>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">85% complete</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center">
                    <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span>Verify email address</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span>Complete basic info</span>
                  </li>
                  <li className="flex items-center text-slate-500 dark:text-slate-400">
                    <div className="h-4 w-4 border border-current rounded-full mr-2"></div>
                    <span>Add profile picture</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <Tabs defaultValue="personal">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="personal" className="flex-1">Personal Info</TabsTrigger>
                <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                            +1
                          </span>
                          <Input id="phone" className="rounded-l-none" defaultValue="555-123-4567" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <select id="department" className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
                          <option value="engineering">Engineering</option>
                          <option value="marketing">Marketing</option>
                          <option value="sales">Sales</option>
                          <option value="hr">Human Resources</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 min-h-[100px]"
                        defaultValue="Software engineer with expertise in frontend development and UI/UX design."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">JavaScript</Badge>
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">TypeScript</Badge>
                        <Badge variant="secondary">UI/UX Design</Badge>
                        <Badge variant="outline" className="cursor-pointer">+ Add Skill</Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Username</Label>
                      <Input id="userName" defaultValue="johndoe" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch id="twoFactorAuth" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="sessionTimeout">Session Timeout</Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Automatically log out after inactivity
                            </p>
                          </div>
                          <select id="sessionTimeout" className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm">
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="240">4 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Control how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Email Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-400" />
                            <Label htmlFor="courseUpdates">Course updates and announcements</Label>
                          </div>
                          <Switch id="courseUpdates" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-400" />
                            <Label htmlFor="assessmentReminders">Assessment reminders</Label>
                          </div>
                          <Switch id="assessmentReminders" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-400" />
                            <Label htmlFor="certificateIssued">Certificate issued</Label>
                          </div>
                          <Switch id="certificateIssued" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-400" />
                            <Label htmlFor="newCourses">New course recommendations</Label>
                          </div>
                          <Switch id="newCourses" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-base font-medium">System Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-400" />
                            <Label htmlFor="browserNotifs">Browser notifications</Label>
                          </div>
                          <Switch id="browserNotifs" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-slate-400" />
                            <Label htmlFor="emailDigest">Weekly email digest</Label>
                          </div>
                          <Switch id="emailDigest" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
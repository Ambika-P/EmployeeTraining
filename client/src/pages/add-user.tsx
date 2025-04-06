import RegisterForm from "@/components/auth/register-form";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function AddUser() {
    return (
        <MainLayout>
            <div className="px-4 sm:px-6 lg:px-8 py-8 mx-auto">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-2xl">Create a new user</CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            Fill in the user details to create a new account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RegisterForm />
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}

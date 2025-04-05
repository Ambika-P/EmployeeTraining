import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { useAuth } from "@/context/auth-context";
import { useLocation } from "wouter";

export default function ForgotPassword() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            We'll send you a link to reset your password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

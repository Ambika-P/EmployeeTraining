import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, ArrowLeft, UserCircle, Lock, Mail, Check } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["employee", "contributor", "admin"]).default("employee"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const { registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      role: "employee",
      termsAccepted: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }
    
    const { termsAccepted, ...registerData } = data;
    await registerMutation.mutateAsync(registerData);
    setLocation("/");
  };

  const passwordStrength = (password: string) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    if (strength === 4) return "Strong";
    if (strength === 5) return "Very Strong";
    return "";
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-gray-200 dark:bg-gray-700";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    if (strength === 4) return "bg-green-500";
    if (strength === 5) return "bg-green-600";
    return "bg-gray-200 dark:bg-gray-700";
  };

  const checkStepValidity = (currentStep: number) => {
    switch (currentStep) {
      case 1: 
        return !form.formState.errors.username && 
               !form.formState.errors.email && 
               form.getValues('username') && 
               form.getValues('email');
      case 2:
        return !form.formState.errors.password && 
               !form.formState.errors.confirmPassword && 
               form.getValues('password') && 
               form.getValues('confirmPassword');
      case 3:
        return form.getValues('termsAccepted');
      default:
        return true;
    }
  };

  const moveToNextStep = () => {
    if (step < totalSteps && checkStepValidity(step)) {
      setStep(step + 1);
    }
  };

  const moveToPrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const password = form.watch("password");
  const strength = passwordStrength(password);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-0 shadow-sm"> {/* Removed min-h-[420px] */}
          <CardHeader className="pb-3">
            <div className="flex justify-between mb-2">
              {Array(totalSteps).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold ${
                    i + 1 === step 
                      ? 'bg-blue-600 text-white' 
                      : i + 1 < step 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {i + 1 < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
              ))}
            </div>
            <CardTitle className="text-xl mb-0">
              {step === 1 && "Account Information"}
              {step === 2 && "Create Password"}
              {step === 3 && "Final Steps"}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === 1 && "Set up your basic account details"}
              {step === 2 && "Create a secure password"}
              {step === 3 && "Just a few more details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Identity</h3>
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel className="mb-1 text-xs">Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} autoComplete="username" className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel className="mb-1 text-xs">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} autoComplete="email" className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="mb-1">
                        <FormLabel className="mb-1 text-xs">First name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="mb-1">
                        <FormLabel className="mb-1 text-xs">Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Security</h3>
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel className="mb-1 text-xs">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            autoComplete="new-password"
                            className="h-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-xs"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </FormControl>
                      {password && (
                        <div className="mt-1 space-y-1">
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`${getPasswordStrengthColor(strength)} transition-all duration-300 ease-in-out dark:bg-blue-500`}
                              style={{ width: `${(strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Password strength: {getPasswordStrengthText(strength)}
                          </p>
                        </div>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel className="mb-1 text-xs">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                            autoComplete="new-password"
                            className="h-9"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-xs"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="text-blue-600 dark:text-blue-400 h-5 w-5" />
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Preferences</h3>
                </div>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="mb-1">
                      <FormLabel className="mb-1 text-xs">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee (Learner)</SelectItem>
                          <SelectItem value="contributor">Contributor (Content Creator)</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-slate-500 dark:border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-slate-900 dark:text-white text-xs">
                          I accept the{" "}
                          <Button variant="link" className="h-auto p-0 text-blue-600 dark:text-blue-400 font-medium text-xs">
                            terms and conditions
                          </Button>
                        </FormLabel>
                        <FormMessage className="text-xs"/>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={moveToPrevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div></div>
            )}
            
            {step < totalSteps ? (
              <Button 
                type="button" 
                onClick={moveToNextStep}
                disabled={!checkStepValidity(step)}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={registerMutation.isPending || !form.formState.isValid}>
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default RegisterForm;

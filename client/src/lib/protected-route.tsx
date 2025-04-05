import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  roles?: string[];
}

export function ProtectedRoute({ path, component: Component, roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading) {
      if (!user) {
        setLocation('/auth');
      } else if (roles && !roles.includes(user.role)) {
        setLocation('/');
      }
    }
  }, [user, isLoading, roles, setLocation]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : user && (!roles || roles.includes(user.role)) ? (
        <Component />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </Route>
  );
}

export default ProtectedRoute;

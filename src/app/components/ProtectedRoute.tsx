import { Navigate } from "react-router-dom";
import { useAuth } from "../../lib/authContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "maintainer" | "user";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  const roleHierarchy = { admin: 3, maintainer: 2, user: 1 };
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = requiredRole ? roleHierarchy[requiredRole] || 0 : 0;

  if (requiredRole && userLevel < requiredLevel) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

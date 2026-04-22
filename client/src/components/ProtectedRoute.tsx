import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// import LoadingScreen from "../components/ui/LoadingScreen"; // Not needed if App handles initial load
import { useAppSelector } from "../hooks/redux/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "admin" | "agent")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);

  // 🚫 Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔒 Check role-based access if applicable
  if (allowedRoles && !allowedRoles.includes(user.role as "user" | "admin" | "agent")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authenticated & authorized
  return <>{children}</>;
};

export default ProtectedRoute;

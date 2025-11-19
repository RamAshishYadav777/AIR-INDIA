import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoadingScreen from "../components/ui/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);

  useEffect(() => {
    // 🟢 Fetch the current Supabase session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      // Optionally fetch role from user metadata or database
      if (session?.user) {
        const role =
          (session.user.user_metadata?.role as "user" | "admin") || "user";
        setUserRole(role);
      }
    };

    getSession();

    // 🔁 Listen for session changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⏳ Show loading screen until Supabase is ready
  if (loading) return <LoadingScreen />;

  // 🚫 Redirect if not authenticated
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🔒 Check role-based access if applicable
  if (allowedRoles && !allowedRoles.includes(userRole || "user")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authenticated & authorized
  return <>{children}</>;
};

export default ProtectedRoute;

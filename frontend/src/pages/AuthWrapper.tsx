import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { CircularProgress, Box } from "@mui/material"; // Or your custom loader
import { useAuth } from "@/Zustand/Store";

interface AuthWrapperProps {
  children: React.ReactNode;
}

function AuthWrapper({ children }: AuthWrapperProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const setIsAuthenticated = useAuth((state) => state.setIsAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setIsAuthenticated(false);
        navigate("/", { replace: true }); // 'replace' prevents the user from clicking 'back' to the locked page
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate]);

  // While checking, show a loader (or return null) to prevent content flashing
  if (isAuthenticated === null) {
    return <></>;
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}

export default AuthWrapper;

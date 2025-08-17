import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const auth = useAuthContext();
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Check session expiry every minute
  useEffect(() => {
    const checkSessionExpiry = () => {
      const sessionToken = localStorage.getItem("admin_session_token");
      if (sessionToken) {
        // Session expires in 24 hours from creation
        // In a real app, you'd decode the JWT or check with server
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setSessionExpiry(expiry);
      }
    };

    checkSessionExpiry();
    const interval = setInterval(checkSessionExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-logout when session expires
  useEffect(() => {
    if (sessionExpiry && new Date() >= sessionExpiry) {
      auth.logout();
    }
  }, [sessionExpiry, auth]);

  // Check if user has specific role
  const hasRole = (role: "admin" | "super_admin") => {
    return auth.user?.role === role;
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return auth.user?.role === "super_admin";
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (auth.user?.first_name && auth.user?.last_name) {
      return `${auth.user.first_name} ${auth.user.last_name}`;
    }
    return auth.user?.first_name || auth.user?.email || "Admin";
  };

  // Get session time remaining
  const getSessionTimeRemaining = () => {
    if (!sessionExpiry) return null;

    const now = new Date();
    const timeDiff = sessionExpiry.getTime() - now.getTime();

    if (timeDiff <= 0) return null;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  };

  // Check if session is about to expire (within 30 minutes)
  const isSessionExpiringSoon = () => {
    const timeRemaining = getSessionTimeRemaining();
    if (!timeRemaining) return false;

    return timeRemaining.hours === 0 && timeRemaining.minutes <= 30;
  };

  return {
    ...auth,
    hasRole,
    isSuperAdmin,
    getUserDisplayName,
    getSessionTimeRemaining,
    isSessionExpiringSoon,
    sessionExpiry,
  };
};

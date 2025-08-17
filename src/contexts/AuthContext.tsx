import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "admin" | "super_admin";
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Generate a secure session token
  const generateSessionToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionToken = localStorage.getItem("admin_session_token");
      const userData = localStorage.getItem("admin_user_data");

      if (!sessionToken || !userData) {
        setLoading(false);
        return;
      }

      // For now, use a simple session check
      // In production, you'd validate against the database
      try {
        const user = JSON.parse(userData);
        const sessionExpiry = localStorage.getItem("admin_session_expiry");

        if (sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
          setUser(user);
        } else {
          // Session expired
          localStorage.removeItem("admin_session_token");
          localStorage.removeItem("admin_user_data");
          localStorage.removeItem("admin_session_expiry");
          setUser(null);
        }
      } catch (parseError) {
        console.error("Session data parse error:", parseError);
        localStorage.removeItem("admin_session_token");
        localStorage.removeItem("admin_user_data");
        localStorage.removeItem("admin_session_expiry");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("admin_session_token");
      localStorage.removeItem("admin_user_data");
      localStorage.removeItem("admin_session_expiry");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Simple admin authentication for now
      // In production, you'd validate against the database
      if (email === "admin@xivttw.com" && password === "admin123") {
        const sessionToken = generateSessionToken();
        const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours

        const userData = {
          id: "admin-1",
          email: email,
          first_name: "Admin",
          last_name: "User",
          role: "admin" as const,
        };

        // Store session data
        localStorage.setItem("admin_session_token", sessionToken);
        localStorage.setItem("admin_user_data", JSON.stringify(userData));
        localStorage.setItem("admin_session_expiry", sessionExpiry.toString());

        // Set user state
        setUser(userData);

        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!",
        });

        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear all session data
      localStorage.removeItem("admin_session_token");
      localStorage.removeItem("admin_user_data");
      localStorage.removeItem("admin_session_expiry");

      // Clear user state
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear local state
      localStorage.removeItem("admin_session_token");
      localStorage.removeItem("admin_user_data");
      localStorage.removeItem("admin_session_expiry");
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

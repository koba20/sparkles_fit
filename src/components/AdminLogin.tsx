import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  const { login } = useAuth();
  const { toast } = useToast();

  // Check if account is locked
  const checkLockout = () => {
    if (isLocked && lockoutTime) {
      const now = new Date();
      const timeDiff = lockoutTime.getTime() - now.getTime();

      if (timeDiff > 0) {
        const minutes = Math.floor(timeDiff / 60000);
        const seconds = Math.floor((timeDiff % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      } else {
        setIsLocked(false);
        setLockoutTime(null);
        setLoginAttempts(0);
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if account is locked
    const lockoutRemaining = checkLockout();
    if (lockoutRemaining) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Please try again in ${lockoutRemaining}.`,
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (!success) {
        setLoginAttempts((prev) => prev + 1);

        // Lock account after 5 failed attempts
        if (loginAttempts >= 4) {
          setIsLocked(true);
          setLockoutTime(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
          toast({
            title: "Account Locked",
            description:
              "Too many failed attempts. Please try again in 15 minutes.",
            variant: "destructive",
          });
        }
      } else {
        // Reset attempts on successful login
        setLoginAttempts(0);
        setIsLocked(false);
        setLockoutTime(null);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const lockoutRemaining = checkLockout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Lock className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Sparkles Fit Admin
          </h1>
          <p className="text-gray-400">Secure access to your dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Admin Login
            </CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@xivttw.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isLocked}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20 focus:border-white/40 focus:ring-white/40"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isLocked}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:bg-white/20 focus:border-white/40 focus:ring-white/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isLocked}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Attempts Warning */}
              {loginAttempts > 0 && loginAttempts < 5 && (
                <div className="text-yellow-400 text-sm text-center">
                  Failed login attempts: {loginAttempts}/5
                </div>
              )}

              {/* Lockout Message */}
              {isLocked && lockoutRemaining && (
                <div className="text-red-400 text-sm text-center">
                  Account locked. Try again in {lockoutRemaining}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Admin Access */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-sm font-medium text-white mb-2">
                Admin Access
              </h3>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Use your admin credentials to access the dashboard</div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              <p>
                This is a secure admin panel. Unauthorized access is prohibited.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

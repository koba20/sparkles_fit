import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, RefreshCw } from "lucide-react";

export const SessionWarning: React.FC = () => {
  const { isSessionExpiringSoon, getSessionTimeRemaining, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const checkSession = () => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);

      if (isSessionExpiringSoon()) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array to prevent infinite loop

  const handleExtendSession = () => {
    // In a real app, you'd call an API to extend the session
    // For now, we'll just hide the warning
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (!showWarning || !timeRemaining) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-yellow-200 bg-yellow-50">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <p className="font-medium mb-2">
            Your session will expire soon
          </p>
          <p className="text-sm mb-3">
            Time remaining: {timeRemaining.hours}h {timeRemaining.minutes}m
          </p>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-300 hover:bg-yellow-100 text-yellow-800"
              onClick={handleExtendSession}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Extend Session
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-300 hover:bg-yellow-100 text-yellow-800"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

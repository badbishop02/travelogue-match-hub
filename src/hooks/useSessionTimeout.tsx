import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SESSION_TIMEOUT_MS = 72 * 60 * 60 * 1000; // 72 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const LAST_ACTIVITY_KEY = "tourly_last_activity";

export const useSessionTimeout = () => {
  const { toast } = useToast();

  const updateLastActivity = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  };

  const checkSessionTimeout = async () => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    
    if (!lastActivity) {
      updateLastActivity();
      return;
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

    if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
      // Session expired due to inactivity
      await supabase.auth.signOut();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      
      toast({
        title: "Session expired",
        description: "Your session has expired due to inactivity. Please sign in again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check session timeout on mount
    checkSessionTimeout();

    // Set up activity listeners
    const activities = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
    };

    activities.forEach(activity => {
      window.addEventListener(activity, handleActivity, true);
    });

    // Periodic check for session timeout
    const interval = setInterval(checkSessionTimeout, ACTIVITY_CHECK_INTERVAL);

    return () => {
      activities.forEach(activity => {
        window.removeEventListener(activity, handleActivity, true);
      });
      clearInterval(interval);
    };
  }, []);

  return { updateLastActivity };
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { OnboardingSteps } from "./OnboardingSteps";

const Onboarding = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    
    fetchUserRole();
  }, [session]);

  const fetchUserRole = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setUserRole(data.role);
    }
    
    setLoading(false);
  };

  const handleComplete = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingSteps 
            userId={session.user.id} 
            userRole={userRole}
            onComplete={handleComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

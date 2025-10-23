import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminVerifications } from "@/components/admin/AdminVerifications";
import { AdminBookings } from "@/components/admin/AdminBookings";
import { AdminTours } from "@/components/admin/AdminTours";
import { AdminCommissions } from "@/components/admin/AdminCommissions";
import { AdminActivityLogs } from "@/components/admin/AdminActivityLogs";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    checkAdminRole();
  }, [user, authLoading, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Admin Dashboard</CardTitle>
            </div>
            <CardDescription>
              Manage all aspects of the Tourly platform
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="tours">Tours</TabsTrigger>
            <TabsTrigger value="commissions">Finance</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="verifications">
            <AdminVerifications />
          </TabsContent>

          <TabsContent value="bookings">
            <AdminBookings />
          </TabsContent>

          <TabsContent value="tours">
            <AdminTours />
          </TabsContent>

          <TabsContent value="commissions">
            <AdminCommissions />
          </TabsContent>

          <TabsContent value="logs">
            <AdminActivityLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

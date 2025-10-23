import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Verification {
  id: string;
  user_id: string;
  verification_type: string;
  document_url: string;
  status: string;
  submitted_at: string;
  profiles: { full_name: string } | null;
}

export const AdminVerifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    const { data } = await supabase
      .from("identity_verifications")
      .select("*, profiles(full_name)")
      .order("submitted_at", { ascending: false });

    if (data) {
      setVerifications(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleVerification = async (id: string, status: "approved" | "rejected") => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("identity_verifications")
      .update({
        status,
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update verification");
      return;
    }

    toast.success(`Verification ${status}`);
    fetchVerifications();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identity Verifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell>{verification.profiles?.full_name}</TableCell>
                <TableCell className="capitalize">
                  {verification.verification_type.replace("_", " ")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      verification.status === "approved"
                        ? "default"
                        : verification.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {verification.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(verification.submitted_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open(verification.document_url, "_blank")}
                  >
                    View Document
                  </Button>
                </TableCell>
                <TableCell>
                  {verification.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleVerification(verification.id, "approved")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerification(verification.id, "rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

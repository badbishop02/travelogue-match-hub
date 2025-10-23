import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Shield, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";

const Verification = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [verificationType, setVerificationType] = useState<string>("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [existingVerification, setExistingVerification] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchExistingVerification = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("identity_verifications")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setExistingVerification(data);
      }
    };

    fetchExistingVerification();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !documentFile || !verificationType) {
      toast.error("Please fill in all fields");
      return;
    }

    setUploading(true);

    try {
      // For demo purposes, we'll use a placeholder URL
      // In production, you would upload to Supabase Storage
      const documentUrl = `https://placeholder.com/documents/${documentFile.name}`;

      const { error } = await supabase.from("identity_verifications").insert({
        user_id: user.id,
        verification_type: verificationType,
        document_url: documentUrl,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Verification submitted successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={user ? { user } as any : null} />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Identity Verification</CardTitle>
            </div>
            <CardDescription>
              Verify your identity to increase trust and unlock premium features
            </CardDescription>
          </CardHeader>
          <CardContent>
            {existingVerification && (
              <div className="mb-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Verification Status</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {existingVerification.verification_type.replace("_", " ")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      existingVerification.status === "approved"
                        ? "default"
                        : existingVerification.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {existingVerification.status}
                  </Badge>
                </div>
                {existingVerification.rejection_reason && (
                  <p className="mt-2 text-sm text-destructive">
                    Reason: {existingVerification.rejection_reason}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verificationType">Document Type</Label>
                <Select value={verificationType} onValueChange={setVerificationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    id="document"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {documentFile && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selected: {documentFile.name}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Verification"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verification;

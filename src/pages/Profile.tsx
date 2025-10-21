import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, MapPin, Languages, Music, Heart } from "lucide-react";

const Profile = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location_name: "",
    languages: "",
    hobbies: "",
    music_tastes: "",
  });

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchRoles();
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        bio: data.bio || "",
        location_name: data.location_name || "",
        languages: data.languages?.join(", ") || "",
        hobbies: data.hobbies?.join(", ") || "",
        music_tastes: data.music_tastes?.join(", ") || "",
      });
    }
  };

  const fetchRoles = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    if (data) {
      setRoles(data.map((r) => r.role));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location_name: formData.location_name,
          languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
          hobbies: formData.hobbies.split(",").map((s) => s.trim()).filter(Boolean),
          music_tastes: formData.music_tastes.split(",").map((s) => s.trim()).filter(Boolean),
        })
        .eq("user_id", session?.user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="text-3xl">
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold mb-2">{profile?.full_name || "Your Profile"}</h1>
            <div className="flex gap-2">
              {roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  <User className="inline mr-2 h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_name">
                  <MapPin className="inline mr-2 h-4 w-4" />
                  Location
                </Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                  placeholder="e.g., Paris, France"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">
                  <Languages className="inline mr-2 h-4 w-4" />
                  Languages
                </Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="e.g., English, French, Spanish (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies">
                  <Heart className="inline mr-2 h-4 w-4" />
                  Hobbies & Interests
                </Label>
                <Input
                  id="hobbies"
                  value={formData.hobbies}
                  onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                  placeholder="e.g., Photography, Hiking, Cooking (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="music_tastes">
                  <Music className="inline mr-2 h-4 w-4" />
                  Music Tastes
                </Label>
                <Input
                  id="music_tastes"
                  value={formData.music_tastes}
                  onChange={(e) => setFormData({ ...formData, music_tastes: e.target.value })}
                  placeholder="e.g., Jazz, Rock, Classical (comma-separated)"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
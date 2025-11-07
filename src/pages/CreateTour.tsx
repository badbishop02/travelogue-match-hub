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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const DRAFT_KEY = "tourly_draft_create_tour";

const CreateTour = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isGuide, setIsGuide] = useState(false);
  
  // Initialize form data from localStorage draft if available
  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch {
        return {
          title: "",
          description: "",
          location_name: "",
          duration_hours: 2,
          max_participants: 10,
          price_per_person: 50,
          difficulty_level: "moderate",
          languages: "",
          included_items: "",
        };
      }
    }
    return {
      title: "",
      description: "",
      location_name: "",
      duration_hours: 2,
      max_participants: 10,
      price_per_person: 50,
      difficulty_level: "moderate",
      languages: "",
      included_items: "",
    };
  });

  // Save draft to localStorage whenever form data changes
  useEffect(() => {
    if (session && isGuide) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }
  }, [formData, session, isGuide]);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    checkIfGuide();
    
    // Show notification if draft was restored
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      toast({
        title: "Draft restored",
        description: "Your previous tour draft has been restored.",
      });
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    setProfile(data);
  };

  const checkIfGuide = async () => {
    if (!session?.user?.id) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "guide")
      .single();

    setIsGuide(!!data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isGuide) {
      toast({
        title: "Access Denied",
        description: "Only tour guides can create tours.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from("tours").insert({
        guide_id: session?.user?.id,
        title: formData.title,
        description: formData.description,
        location_name: formData.location_name,
        location_lat: 0, // TODO: Add geocoding
        location_lng: 0, // TODO: Add geocoding
        duration_hours: formData.duration_hours,
        max_participants: formData.max_participants,
        price_per_person: formData.price_per_person,
        difficulty_level: formData.difficulty_level,
        languages: formData.languages.split(",").map((s) => s.trim()).filter(Boolean),
        included_items: formData.included_items.split(",").map((s) => s.trim()).filter(Boolean),
      }).select().single();

      if (error) throw error;

      // Clear the draft after successful submission
      localStorage.removeItem(DRAFT_KEY);
      
      toast({
        title: "Tour created!",
        description: "Your tour has been successfully created.",
      });

      navigate(`/tours/${data.id}`);
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

  if (!isGuide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar session={session} profile={profile} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Only tour guides can create tours. Your account is registered as a tourist.
          </p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />

      <div className="container mx-auto mobile-padding py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="mobile-heading">Create a New Tour</CardTitle>
            <CardDescription>Share your local expertise with travelers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tour Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Historic Paris Walking Tour"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your tour, what makes it special, and what travelers can expect..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_name">Location *</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    placeholder="e.g., Montmartre, Paris"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_hours">Duration (hours) *</Label>
                  <Input
                    id="duration_hours"
                    type="number"
                    min="1"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants *</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_person">Price per Person ($) *</Label>
                  <Input
                    id="price_per_person"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_person}
                    onChange={(e) => setFormData({ ...formData, price_per_person: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty_level">Difficulty Level *</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger id="difficulty_level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="e.g., English, French, Spanish (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="included_items">What's Included</Label>
                <Input
                  id="included_items"
                  value={formData.included_items}
                  onChange={(e) => setFormData({ ...formData, included_items: e.target.value })}
                  placeholder="e.g., Transportation, Snacks, Museum tickets (comma-separated)"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Tour
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTour;
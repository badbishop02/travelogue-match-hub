import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { sampleTours, sampleVideos } from "@/utils/seedData";

export const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const seedDatabase = async () => {
    setLoading(true);
    try {
      // Check if data already exists
      const { data: existingTours } = await supabase
        .from("tours")
        .select("id")
        .limit(1);

      if (existingTours && existingTours.length > 0) {
        toast({
          title: "Data already exists",
          description: "Sample data has already been added to the database.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to seed the database.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Assign user as guide role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: "guide" });

      // Insert tours (will be associated with current user as guide)
      const toursWithGuide = sampleTours.map(tour => ({
        ...tour,
        guide_id: user.id,
      }));

      const { error: toursError } = await supabase
        .from("tours")
        .insert(toursWithGuide);

      if (toursError) throw toursError;

      // Insert videos (will be associated with current user)
      const videosWithUser = sampleVideos.map(video => ({
        ...video,
        user_id: user.id,
      }));

      const { error: videosError } = await supabase
        .from("videos")
        .insert(videosWithUser);

      if (videosError) throw videosError;

      toast({
        title: "Success!",
        description: "Sample tours and videos have been added to the database.",
      });
    } catch (error: any) {
      console.error("Error seeding database:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={seedDatabase}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? "Adding Sample Data..." : "Add Sample Data"}
    </Button>
  );
};

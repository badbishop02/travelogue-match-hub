import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import TourCard from "@/components/TourCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-tourism.jpg";
import { SeedDataButton } from "@/components/SeedDataButton";

const Index = () => {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Always fetch tours, even for non-authenticated users
    fetchTours();
    
    // Fetch profile only if authenticated
    if (session?.user) {
      fetchProfile();
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

  const fetchTours = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tours")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setTours(data || []);
    setLoading(false);
  };

  const filteredTours = tours.filter((tour) =>
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEngagement = (path: string) => {
    if (!session) {
      navigate("/auth");
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />
      
      {/* Tours Grid Section - Direct Display */}
      <section className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">Discover Adventures</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tours, locations, or experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Tours</h2>
          <div className="flex gap-2">
            {session && <SeedDataButton />}
            <Button variant="outline" onClick={() => handleEngagement("/discover")}>
              View All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tours found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Be the first to create a tour!"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleEngagement("/create-tour")}>
                Create Tour
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;

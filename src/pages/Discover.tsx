import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import TourCard from "@/components/TourCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

const Discover = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchTours();
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
    let query = supabase
      .from("tours")
      .select("*")
      .eq("is_active", true);

    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "price_low") {
      query = query.order("price_per_person", { ascending: true });
    } else if (sortBy === "price_high") {
      query = query.order("price_per_person", { ascending: false });
    }

    const { data } = await query;
    setTours(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTours();
  }, [sortBy]);

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === "all" || tour.difficulty_level === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Discover Tours</h1>

        {/* Filters */}
        <div className="bg-card p-4 rounded-lg shadow-sm mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tours, locations, or experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="challenging">Challenging</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tours match your criteria</p>
            <Button onClick={() => { setSearchQuery(""); setDifficultyFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
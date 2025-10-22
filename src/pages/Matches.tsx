import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Matches = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchMatches();
  }, [session, navigate]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    setProfile(data);
  };

  const fetchMatches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("*, profiles!matches_matched_user_id_fkey(*)")
      .eq("user_id", session?.user?.id)
      .order("similarity_score", { ascending: false });
    
    setMatches(data || []);
    setLoading(false);
  };

  const generateEmbeddings = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-embeddings", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Embeddings generated",
        description: "Your profile has been analyzed for matching",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const findMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("find-matches", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Matches found",
        description: `Found ${data.matches?.length || 0} compatible users`,
      });
      
      await fetchMatches();
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Matches</h1>
            <p className="text-muted-foreground">
              AI-powered connections based on your interests
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateEmbeddings}
              disabled={generating}
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generating ? "Generating..." : "Update Profile"}
            </Button>
            <Button 
              onClick={findMatches}
              disabled={loading}
            >
              <Users className="mr-2 h-4 w-4" />
              Find Matches
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={match.profiles?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {match.profiles?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-xl">{match.profiles?.full_name}</h3>
                  <Badge variant="secondary" className="mx-auto mt-2">
                    {(match.similarity_score * 100).toFixed(0)}% Match
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {match.profiles?.location_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{match.profiles.location_name}</span>
                    </div>
                  )}
                  {match.profiles?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {match.profiles.bio}
                    </p>
                  )}
                  {match.match_reason && (
                    <p className="text-xs text-primary font-medium">
                      {match.match_reason}
                    </p>
                  )}
                  {match.profiles?.hobbies?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {match.profiles.hobbies.slice(0, 3).map((hobby: string) => (
                        <Badge key={hobby} variant="outline" className="text-xs">
                          {hobby}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/profile?user=${match.matched_user_id}`)}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your profile embeddings and find compatible travel companions!
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={generateEmbeddings} disabled={generating}>
                <Sparkles className="mr-2 h-4 w-4" />
                {generating ? "Generating..." : "Generate Profile"}
              </Button>
              <Button onClick={findMatches} variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Find Matches
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TourDetail = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [tour, setTour] = useState<any>(null);
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchTourDetails();
  }, [session, id]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    setProfile(data);
  };

  const fetchTourDetails = async () => {
    setLoading(true);
    const { data: tourData } = await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .single();

    if (tourData) {
      setTour(tourData);

      const { data: guideData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", tourData.guide_id)
        .single();

      setGuide(guideData);
    }
    setLoading(false);
  };

  const handleBookTour = () => {
    if (!tour) return;
    navigate(`/book/${tour.id}`);
  };

  if (!session || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar session={session} profile={profile} />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Tour not found</p>
          <Button onClick={() => navigate("/discover")} className="mt-4">
            Back to Tours
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        {/* Tour Image */}
        <div className="h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
          {tour.images?.[0] ? (
            <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover" />
          ) : (
            <MapPin className="h-32 w-32 text-muted-foreground" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold">{tour.title}</h1>
                <Badge variant="secondary" className="text-lg">
                  {tour.difficulty_level}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{tour.location_name}</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About This Tour</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{tour.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tour Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Duration</p>
                    <p className="text-muted-foreground">{tour.duration_hours} hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Max Participants</p>
                    <p className="text-muted-foreground">Up to {tour.max_participants} people</p>
                  </div>
                </div>
                {tour.languages?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Languages</p>
                    <div className="flex gap-2 flex-wrap">
                      {tour.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {tour.included_items?.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">What's Included</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {tour.included_items.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guide Info */}
            {guide && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={guide.avatar_url} alt={guide.full_name} />
                      <AvatarFallback>{guide.full_name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{guide.full_name}</p>
                      {guide.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{guide.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <DollarSign className="h-8 w-8" />
                  <span>{tour.price_per_person}</span>
                  <span className="text-base text-muted-foreground font-normal">/person</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg" onClick={handleBookTour}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Book This Tour
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, DollarSign, MapPin } from "lucide-react";

const Bookings = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchBookings();
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

  const fetchBookings = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        tours:tour_id (
          title,
          location_name,
          duration_hours
        )
      `)
      .or(`tourist_id.eq.${session.user.id},guide_id.eq.${session.user.id}`)
      .order("created_at", { ascending: false });

    setBookings(data || []);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const myBookings = bookings.filter((b) => b.tourist_id === session?.user?.id);
  const guideBookings = bookings.filter((b) => b.guide_id === session?.user?.id);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        <Tabs defaultValue="as-tourist" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="as-tourist">As Tourist</TabsTrigger>
            <TabsTrigger value="as-guide">As Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="as-tourist">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : myBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{booking.tours?.title}</CardTitle>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.tours?.location_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{booking.booking_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{booking.num_participants} participants</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold pt-2 border-t">
                        <DollarSign className="h-5 w-5" />
                        <span>{booking.total_price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't booked any tours yet</p>
                <Button onClick={() => navigate("/discover")}>Discover Tours</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="as-guide">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : guideBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guideBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{booking.tours?.title}</CardTitle>
                        <Badge variant={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{booking.booking_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{booking.num_participants} participants</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold pt-2 border-t">
                        <DollarSign className="h-5 w-5" />
                        <span>{booking.total_price}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No bookings for your tours yet</p>
                <Button onClick={() => navigate("/create-tour")}>Create a Tour</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;
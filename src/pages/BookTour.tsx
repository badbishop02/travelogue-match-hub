import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import DriverRequest from "@/components/DriverRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BookTour = () => {
  const { id } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [tour, setTour] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "09:00",
    num_participants: 1,
  });

  useEffect(() => {
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchTour();
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

  const fetchTour = async () => {
    const { data } = await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .single();
    setTour(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalPrice = tour.price_per_person * formData.num_participants;

      const { data: booking, error } = await supabase.from("bookings").insert({
        tour_id: tour.id,
        tourist_id: session?.user?.id,
        guide_id: tour.guide_id,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        num_participants: formData.num_participants,
        total_price: totalPrice,
        status: "pending",
      }).select().single();

      if (error) throw error;

      setBookingId(booking.id);

      toast({
        title: "Booking submitted!",
        description: "Your booking request has been sent to the guide.",
      });
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

  if (!session || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalPrice = tour.price_per_person * formData.num_participants;

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Book Your Tour</CardTitle>
            <CardDescription>{tour.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>
                  <Calendar className="inline mr-2 h-4 w-4" />
                  Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setFormData({ ...formData, booking_date: format(date, "yyyy-MM-dd") });
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_time">Time *</Label>
                <Input
                  id="booking_time"
                  type="time"
                  value={formData.booking_time}
                  onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_participants">
                  <Users className="inline mr-2 h-4 w-4" />
                  Number of Participants *
                </Label>
                <Input
                  id="num_participants"
                  type="number"
                  min="1"
                  max={tour.max_participants}
                  value={formData.num_participants}
                  onChange={(e) => setFormData({ ...formData, num_participants: parseInt(e.target.value) })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Maximum {tour.max_participants} participants
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Price per person</span>
                  <span className="font-semibold">${tour.price_per_person}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-semibold">x {formData.num_participants}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-5 w-5" />
                      <span>{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Your booking will be pending until the guide confirms availability
              </p>
            </form>
          </CardContent>
        </Card>

        {bookingId && tour && (
          <div className="mt-6">
            <DriverRequest 
              bookingId={bookingId}
              tourLocation={{
                lat: tour.location_lat,
                lng: tour.location_lng,
                name: tour.location_name
              }}
              onSuccess={() => navigate("/bookings")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTour;
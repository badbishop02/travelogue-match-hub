import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DriverRequestProps {
  bookingId: string;
  tourLocation: { lat: number; lng: number; name: string };
  onSuccess?: () => void;
}

const DriverRequest = ({ bookingId, tourLocation, onSuccess }: DriverRequestProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupLat, setPickupLat] = useState("");
  const [pickupLng, setPickupLng] = useState("");

  const handleRequestDriver = async () => {
    if (!pickupLocation || !pickupLat || !pickupLng) {
      toast({
        title: "Missing information",
        description: "Please provide your pickup location",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create ride request
      const { data: rideRequest, error: rideError } = await supabase
        .from("ride_requests")
        .insert({
          booking_id: bookingId,
          pickup_location_name: pickupLocation,
          pickup_lat: parseFloat(pickupLat),
          pickup_lng: parseFloat(pickupLng),
          dropoff_location_name: tourLocation.name,
          dropoff_lat: tourLocation.lat,
          dropoff_lng: tourLocation.lng,
          status: "pending",
          estimated_fare: 50, // Simple estimate
        })
        .select()
        .single();

      if (rideError) throw rideError;

      // Dispatch driver
      const { data: dispatchData, error: dispatchError } = await supabase.functions.invoke(
        "dispatch-driver",
        {
          body: {
            rideRequestId: rideRequest.id,
            pickupLat: parseFloat(pickupLat),
            pickupLng: parseFloat(pickupLng),
          },
        }
      );

      if (dispatchError) throw dispatchError;

      toast({
        title: "Driver assigned!",
        description: `${dispatchData.driver.vehicle_type} is on the way`,
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error requesting driver",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Request a Driver
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Pickup Location</Label>
          <Input
            placeholder="Enter your location name"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              placeholder="-1.2921"
              value={pickupLat}
              onChange={(e) => setPickupLat(e.target.value)}
              type="number"
              step="any"
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              placeholder="36.8219"
              value={pickupLng}
              onChange={(e) => setPickupLng(e.target.value)}
              type="number"
              step="any"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Dropoff: {tourLocation.name}</span>
        </div>
        <Button 
          onClick={handleRequestDriver} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Requesting..." : "Request Driver"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DriverRequest;
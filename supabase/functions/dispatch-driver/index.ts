import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { rideRequestId, pickupLat, pickupLng } = await req.json();

    console.log('Dispatching driver for ride:', rideRequestId);

    // Find nearby available drivers using simple distance calculation
    const { data: drivers, error: driversError } = await supabaseClient
      .from('drivers')
      .select('*')
      .eq('is_available', true);

    if (driversError) {
      throw driversError;
    }

    if (!drivers || drivers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No available drivers found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate distance to each driver and find the nearest
    const driversWithDistance = drivers
      .map(driver => {
        if (!driver.location_lat || !driver.location_lng) {
          return { ...driver, distance: Infinity };
        }

        const distance = Math.sqrt(
          Math.pow(driver.location_lat - pickupLat, 2) +
          Math.pow(driver.location_lng - pickupLng, 2)
        );

        return { ...driver, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const nearestDriver = driversWithDistance[0];

    if (nearestDriver.distance === Infinity) {
      return new Response(
        JSON.stringify({ error: 'No drivers with valid locations found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Nearest driver found:', nearestDriver.id);

    // Assign driver to ride request
    const { data: updatedRide, error: updateError } = await supabaseClient
      .from('ride_requests')
      .update({
        driver_id: nearestDriver.id,
        status: 'driver_assigned',
      })
      .eq('id', rideRequestId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Mark driver as unavailable
    await supabaseClient
      .from('drivers')
      .update({ is_available: false })
      .eq('id', nearestDriver.id);

    console.log('Driver assigned successfully');

    return new Response(
      JSON.stringify({
        success: true,
        driver: nearestDriver,
        rideRequest: updatedRide,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Driver dispatch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
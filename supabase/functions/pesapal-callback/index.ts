import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const callbackSchema = z.object({
  OrderTrackingId: z.string(),
  OrderMerchantReference: z.string().optional(),
  OrderNotificationType: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse query parameters for GET or body for POST
    let orderTrackingId: string;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      orderTrackingId = url.searchParams.get('OrderTrackingId') || '';
    } else {
      const body = await req.json();
      const validated = callbackSchema.parse(body);
      orderTrackingId = validated.OrderTrackingId;
    }

    if (!orderTrackingId) {
      throw new Error('OrderTrackingId is required');
    }

    console.log('Processing payment callback for order:', orderTrackingId.slice(0, 8) + '...');

    const PESAPAL_CONSUMER_KEY = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const PESAPAL_CONSUMER_SECRET = Deno.env.get('PESAPAL_CONSUMER_SECRET');

    if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
      throw new Error('PesaPal credentials not configured');
    }

    // Get authentication token from PesaPal
    const authResponse = await fetch('https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
      }),
    });

    if (!authResponse.ok) {
      console.error('PesaPal auth failed');
      throw new Error('Failed to authenticate with PesaPal');
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // Get transaction status from PesaPal
    const statusResponse = await fetch(
      `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!statusResponse.ok) {
      console.error('Failed to get transaction status');
      throw new Error('Failed to get transaction status');
    }

    const statusData = await statusResponse.json();
    const paymentStatus = statusData.payment_status_description?.toLowerCase() || 'pending';

    console.log('Payment status:', paymentStatus);

    // Update ride request with payment status
    const { data: rideRequest, error: findError } = await supabaseClient
      .from('ride_requests')
      .select('id, booking_id, status, payment_status')
      .eq('payment_id', orderTrackingId)
      .single();

    if (findError || !rideRequest) {
      console.error('Ride request not found for payment:', orderTrackingId);
      throw new Error('Ride request not found');
    }

    // Only update if current status is pending and new status is completed
    if (rideRequest.payment_status === 'pending' || !rideRequest.payment_status) {
      const newPaymentStatus = paymentStatus === 'completed' ? 'completed' : 'failed';
      
      const { error: updateError } = await supabaseClient
        .from('ride_requests')
        .update({
          payment_status: newPaymentStatus,
        })
        .eq('id', rideRequest.id);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw updateError;
      }

      console.log('Payment status updated to:', newPaymentStatus);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment callback processed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Payment callback error:', error);
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

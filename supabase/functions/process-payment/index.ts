import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const paymentSchema = z.object({
  amount: z.number().positive().max(1000000),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  description: z.string().max(500),
  rideRequestId: z.string().uuid(),
});

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

    const body = await req.json();
    
    // Validate input
    const validated = paymentSchema.parse(body);
    const { amount, currency, description, rideRequestId } = validated;

    console.log('Processing payment for ride:', rideRequestId.slice(0, 8) + '...');

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
      const errorText = await authResponse.text();
      console.error('PesaPal auth error:', errorText);
      throw new Error('Failed to authenticate with PesaPal');
    }

    const authData = await authResponse.json();
    const token = authData.token;

    console.log('PesaPal authentication successful');

    // Register IPN URL
    const ipnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/pesapal-callback`;
    const ipnResponse = await fetch('https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: 'GET',
      }),
    });

    const ipnData = await ipnResponse.json();
    console.log('IPN registration response:', ipnData);

    // Submit order request
    const orderPayload = {
      id: crypto.randomUUID(),
      currency: currency || 'KES',
      amount: amount,
      description: description,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pesapal-callback`,
      notification_id: ipnData.ipn_id,
      billing_address: {
        email_address: 'user@example.com',
        phone_number: '',
        country_code: 'KE',
        first_name: 'User',
        last_name: 'Name',
      },
    };

    const orderResponse = await fetch('https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('PesaPal order error:', errorText);
      throw new Error('Failed to create payment order');
    }

    const orderData = await orderResponse.json();
    console.log('Payment order created:', orderData);

    // Update ride request with payment info
    if (rideRequestId) {
      const { error: updateError } = await supabaseClient
        .from('ride_requests')
        .update({
          payment_id: orderData.order_tracking_id,
          payment_status: 'pending',
        })
        .eq('id', rideRequestId);

      if (updateError) {
        console.error('Error updating ride request:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: orderData.redirect_url,
        order_tracking_id: orderData.order_tracking_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
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
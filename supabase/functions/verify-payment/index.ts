import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  session_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[VERIFY-PAYMENT] Function started");

  try {
    // Get Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[VERIFY-PAYMENT] STRIPE_SECRET_KEY not configured");
      throw new Error("Payment verification not available");
    }

    // Parse request body
    const { session_id }: VerifyRequest = await req.json();
    console.log("[VERIFY-PAYMENT] Verifying session:", session_id);

    if (!session_id) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'customer']
    });

    console.log("[VERIFY-PAYMENT] Session status:", session.payment_status);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update order status in database
    try {
      const updateData: any = {
        status: session.payment_status === "paid" ? "paid" : "failed",
        updated_at: new Date().toISOString(),
      };

      // Add customer details if available
      if (session.customer_details) {
        updateData.customer_details = {
          email: session.customer_details.email,
          name: session.customer_details.name,
          phone: session.customer_details.phone,
        };
      }

      // Add shipping details if available
      if (session.shipping_details) {
        updateData.shipping_address = {
          name: session.shipping_details.name,
          address: session.shipping_details.address,
        };
      }

      const { data: order, error: updateError } = await supabaseClient
        .from("orders")
        .update(updateData)
        .eq("stripe_session_id", session_id)
        .select()
        .single();

      if (updateError) {
        console.error("[VERIFY-PAYMENT] Order update error:", updateError);
      } else {
        console.log("[VERIFY-PAYMENT] Order updated:", order?.id);
      }

      // If payment successful, you could also:
      // - Send confirmation email
      // - Update product stock
      // - Create customer record
      // - Send order to fulfillment system

    } catch (dbError) {
      console.error("[VERIFY-PAYMENT] Database error:", dbError);
    }

    // Return payment verification result
    const result = {
      session_id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_intent: session.payment_intent,
      created: session.created,
    };

    console.log("[VERIFY-PAYMENT] Verification complete:", session.payment_status);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("[VERIFY-PAYMENT] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment verification failed";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
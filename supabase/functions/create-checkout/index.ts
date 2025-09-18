import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  items: Array<{
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>;
  customer_info?: {
    email?: string;
    name?: string;
  };
  shipping_address?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[CREATE-CHECKOUT] Function started");

  try {
    // Get Stripe secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[CREATE-CHECKOUT] STRIPE_SECRET_KEY not configured");
      throw new Error("Payment system not configured. Please contact support.");
    }

    // Parse request body
    const { items, customer_info, shipping_address }: CheckoutRequest =
      await req.json();
    console.log(
      "[CREATE-CHECKOUT] Processing checkout for items:",
      items?.length
    );

    if (!items || items.length === 0) {
      throw new Error("No items provided for checkout");
    }

    // Create Supabase client for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user if authenticated (optional for guest checkout)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        console.log("[CREATE-CHECKOUT] Authenticated user:", user?.email);
      } catch (error) {
        console.log("[CREATE-CHECKOUT] Guest checkout - no auth");
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Determine customer email (user email or provided email or guest)
    const customerEmail =
      user?.email || customer_info?.email || "guest@kbeauty.com";
    console.log("[CREATE-CHECKOUT] Customer email:", customerEmail);

    // Check if Stripe customer exists
    let customerId;
    if (customerEmail !== "guest@kbeauty.com") {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-CHECKOUT] Existing customer found:", customerId);
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    console.log("[CREATE-CHECKOUT] Total amount:", totalAmount);

    // Convert items to Stripe line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr", // Indian Rupees for Consumer Innovations store
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
          metadata: {
            product_id: item.product_id,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to paisa (cents equivalent)
      },
      quantity: item.quantity,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment", // One-off payment
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["IN"], // India only for now
      },
      billing_address_collection: "required",
      success_url: `${req.headers.get(
        "origin"
      )}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart?canceled=true`,
      metadata: {
        user_id: user?.id || "guest",
        total_items: items.length.toString(),
      },
    });

    console.log("[CREATE-CHECKOUT] Checkout session created:", session.id);

    // Store order in database
    try {
      const orderData = {
        user_id: user?.id || null,
        order_number: `ORD-${Date.now()}`,
        order_items: items,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shipping_address || null,
        stripe_session_id: session.id,
      };

      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("[CREATE-CHECKOUT] Order creation error:", orderError);
      } else {
        console.log("[CREATE-CHECKOUT] Order created:", order.id);
      }
    } catch (dbError) {
      console.error(
        "[CREATE-CHECKOUT] Database error (non-blocking):",
        dbError
      );
      // Continue with checkout even if order creation fails
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CREATE-CHECKOUT] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment processing failed";

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

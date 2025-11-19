// supabase/functions/create-razorpay-order/index.ts
import Razorpay from "npm:razorpay";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const { amount } = await req.json();

      if (!amount) {
        return new Response(JSON.stringify({ error: "Amount required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const key_id = Deno.env.get("RAZORPAY_KEY_ID");
      const key_secret = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (!key_id || !key_secret) {
        return new Response(JSON.stringify({ error: "Missing Razorpay credentials" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const razorpay = new Razorpay({ key_id, key_secret });

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      return new Response(
        JSON.stringify({ error: err.message || "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate Razorpay signature hash
async function generateSignature(orderId: string, paymentId: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const generated = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return generated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("📦 Incoming body:", JSON.stringify(body, null, 2));

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = body;

      const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      console.log("🔐 Env check:", {
        hasSecret: !!secret,
        hasURL: !!SUPABASE_URL,
        hasKey: !!SERVICE_ROLE_KEY,
      });

      if (!secret || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
        throw new Error("Missing environment variable(s)");
      }

      const generatedSignature = await generateSignature(
        razorpay_order_id,
        razorpay_payment_id,
        secret
      );

      console.log("🧾 Generated Signature:", generatedSignature);
      console.log("🧾 Received Signature:", razorpay_signature);

      if (generatedSignature !== razorpay_signature) {
        throw new Error("Invalid signature — mismatch detected");
      }

      const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      const { data, error } = await supabase.from("bookings").insert([bookingData]).select();

      if (error) {
        console.error("❌ Database insert error:", error);
        throw new Error(error.message);
      }

      console.log("✅ Booking inserted successfully:", data);

      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("💥 Error in verify-razorpay-payment:", err);
      return new Response(
        JSON.stringify({
          success: false,
          error: err.message || "Unknown error",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});

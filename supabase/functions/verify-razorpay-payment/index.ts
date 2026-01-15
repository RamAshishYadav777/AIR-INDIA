import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
declare const Deno: any;

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

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = body;

      // Check if this is a mock payment
      const isMockPayment = razorpay_order_id?.startsWith('order_mock_') ||
        razorpay_payment_id?.startsWith('pay_mock_');

      if (isMockPayment) {
        console.log("🎭 Mock payment detected - bypassing signature verification");

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
          throw new Error("Missing Supabase environment variables");
        }

        const bookingId = crypto.randomUUID();
        const responseData = [{ id: bookingId, status: "mock_verified" }];

        console.log("✅ Mock payment verified. Generated Booking ID:", bookingId);

        return new Response(JSON.stringify({ success: true, data: responseData }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Real Razorpay payment verification
      // Retrieve Razorpay secret and Supabase credentials, with fallback for secret name
      const secret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? Deno.env.get("RAZORPAY_SECRET");
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      // Log environment presence (mask secret for security)
      console.log("🔐 Env check:", {
        hasSecret: !!secret,
        secretPreview: secret ? `${secret.slice(0, 4)}****${secret.slice(-4)}` : null,
        hasURL: !!SUPABASE_URL,
        hasKey: !!SERVICE_ROLE_KEY,
      });

      // Ensure all required variables are present
      if (!secret) {
        throw new Error("Missing Razorpay secret environment variable");
      }
      if (!SUPABASE_URL) {
        throw new Error("Missing SUPABASE_URL environment variable");
      }
      if (!SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      }

      // Generate signature using the provided secret
      const generatedSignature = await generateSignature(
        razorpay_order_id,
        razorpay_payment_id,
        secret
      );

      // Detailed logging for debugging signature verification
      console.log("🧾 Generated Signature:", generatedSignature);
      console.log("🧾 Received Signature:", razorpay_signature);
      console.log("🔎 Comparing signatures", {
        match: generatedSignature === razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      // Verify the signature matches Razorpay's expectation
      // Verify the signature matches Razorpay's expectation
      if (generatedSignature !== razorpay_signature) {
        throw new Error("Invalid signature — mismatch detected");
      }

      // Generate a booking ID to return to the client
      // The client handles the detailed insertion into 'passengers' and 'payments' tables
      const bookingId = crypto.randomUUID();
      const responseData = [{ id: bookingId, status: "verified" }];

      console.log("✅ Payment verified. Generated Booking ID:", bookingId);

      return new Response(JSON.stringify({ success: true, data: responseData }), {
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

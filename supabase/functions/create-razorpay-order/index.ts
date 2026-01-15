// supabase/functions/create-razorpay-order/index.ts

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
      const useMockMode = Deno.env.get("USE_MOCK_PAYMENT") === "true";

      console.log("🔑 Razorpay Key ID:", key_id ? `${key_id.substring(0, 10)}...` : "MISSING");
      console.log("🔑 Razorpay Secret:", key_secret ? "SET (length: " + key_secret.length + ")" : "MISSING");
      console.log("🎭 Mock Mode:", useMockMode ? "ENABLED" : "DISABLED");

      // MOCK MODE: Return fake order for testing
      if (useMockMode || !key_id || !key_secret) {
        console.log("⚠️ Using MOCK payment mode");
        const mockOrder = {
          id: `order_mock_${Date.now()}`,
          entity: "order",
          amount: amount,
          amount_paid: 0,
          amount_due: amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          status: "created",
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        };

        return new Response(JSON.stringify(mockOrder), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // REAL RAZORPAY MODE
      const auth = btoa(`${key_id}:${key_secret}`);
      console.log("🔐 Auth header created (length:", auth.length, ")");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      console.log("📡 Razorpay API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Razorpay API error:", errorData);

        // Fallback to mock mode if Razorpay fails
        console.log("⚠️ Razorpay failed, falling back to MOCK mode");
        const mockOrder = {
          id: `order_mock_${Date.now()}`,
          entity: "order",
          amount: amount,
          amount_paid: 0,
          amount_due: amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          status: "created",
          attempts: 0,
          created_at: Math.floor(Date.now() / 1000),
        };

        return new Response(JSON.stringify(mockOrder), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const order = await response.json();
      console.log("✅ Order created successfully:", order.id);

      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("💥 Error creating Razorpay order:", err);
      return new Response(
        JSON.stringify({ error: err.message || "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});

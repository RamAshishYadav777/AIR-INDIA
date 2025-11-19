// File: supabase/functions/ai-chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface RateLimit {
  [ip: string]: number;
}

const rateLimitMap: RateLimit = {};

serve(async (req) => {
  // ✅ Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const { message } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const mode = Deno.env.get("MODE") || "prod"; // "dev" for local, "prod" for deployed
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY inside function environment");
      return new Response(
        JSON.stringify({ error: "Missing OpenAI API key inside Supabase function" }),
        {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // ✅ Skip rate limit in local dev mode
    if (mode !== "dev") {
      if (rateLimitMap[ip] && Date.now() - rateLimitMap[ip] < 2000) {
        console.warn(`⚠️ Rate limit hit for ${ip}`);
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please wait a few seconds.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
      rateLimitMap[ip] = Date.now();
    }

    // ✅ Retry logic for OpenAI API (3 attempts with exponential backoff)
    let data = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an AI assistant for Air India flight booking and travel help. Be polite and informative.",
            },
            { role: "user", content: message },
          ],
        }),
      });

      if (openaiRes.status === 429) {
        console.warn(`OpenAI rate limit hit (attempt ${attempt}). Retrying...`);
        await new Promise((r) => setTimeout(r, 2000 * attempt)); // exponential backoff
        continue;
      }

      data = await openaiRes.json();
      break;
    }

    if (!data) {
      throw new Error("OpenAI API did not respond after multiple attempts.");
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "⚠️ Sorry, I couldn’t generate a valid reply.";

    return new Response(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("🔥 Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});

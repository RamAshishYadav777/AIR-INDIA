import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `
You are the official AI Assistant for Air India.
Your goal is to be helpful, polite, and professional.
You explicitly answer questions about Air India flights, baggage allowances, web check-in, and generic travel policies.
If you don't know the specific answer, politely advise the user to contact customer support at 1800-180-1407 or visit airindia.com.
Keep your answers concise (under 3 sentences where possible) and friendly.
Always format your response as plain text. Do not use markdown like bold or italics if possible, just simple text.
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `User Question: ${message}` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 150,
      }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    console.log("📤 Sending request to Gemini...");

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Safety check for response structure
    if (!response.ok) {
      console.error("Gemini Error:", data);
      return new Response(JSON.stringify({
        reply: `I'm having trouble connecting. Error: ${data.error?.message || "Unknown error"}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I didn't understand that.";

    return new Response(JSON.stringify({ reply: reply.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ reply: "Sorry, I encountered an error. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

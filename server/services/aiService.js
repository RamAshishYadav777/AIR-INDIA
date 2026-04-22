import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const detectIntent = async (message) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
        You are a flight assistant for Air India. 
        Extract intent and entity data from the user's airline query.
        
        Possible intents:
        - "search_flight": user asks for flights, planes, tickets between cities.
        - "check_booking": user asks about their booking status, ticket details, or "my bookings".
        - "general_chat": for greetings, small talk, or off-topic queries.

        For "search_flight", extract:
        - "from": origin city (Full city name)
        - "to": destination city (Full city name)
        - "date": date in YYYY-MM-DD format (if mentioned, else null)

        Return JSON format: 
        { "intent": "string", "from": "string|null", "to": "string|null", "date": "string|null" }

        User message: ${message}
        `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Detect Intent Error:", error);
    return { intent: "general_chat" };
  }
};

export const generateConversationalResponse = async (userMessage, dataContext) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
        You are "Air India Assistant", a professional and helpful virtual assistant for Air India airline.
        Given the user's message and the data found in our database, generate a polite and professional conversational reply.
        
        User Message: "${userMessage}"
        Database Context: ${JSON.stringify(dataContext)}

        Instructions:
        - If flights were found, list them clearly with flight number, price, and time.
        - If no flights were found, inform the user politely and suggest checking another date or route.
        - If it's a booking check, summarize their recent bookings.
        - Keep the tone helpful, premium, and welcoming.
        - Use emojis sparingly (e.g., ✈️, 🎫).
        - If the context is empty or general chat, answer the user's question directly.
        - Do not mention that you queried a database.
        `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error.message?.includes('429')) {
      console.error("Gemini Rate Limit Exceeded (429)");
      return "I'm receiving too many requests right now! Please wait a few seconds and try again. 🍵";
    }
    console.error("AI Response Generation Error:", error.message);

    // SMART FALLBACK
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
      const result = await model.generateContent(`You are Air India Assistant. The user said: "${userMessage}". Give a short, helpful, professional reply.`);
      return result.response.text();
    } catch (e) {
      if (e.message?.includes('429')) return "I'm a bit overwhelmed with requests! Please try again in 10-20 seconds. ✈️";
      return "I'm here to help you with flight searches and bookings. How can I assist you today?";
    }
  }
};


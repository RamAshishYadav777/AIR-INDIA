import { detectIntent, generateConversationalResponse } from "../services/aiService.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";

class ChatController {
    
    async chatHandler(req, res) {
        try {
            const { message, userId } = req.body;
            if (!message) return res.status(400).json({ success: false, reply: "Please provide a message." });

            let aiData;
            let isAiDown = false;

            // 1. ATTEMPT AI INTENT DETECTION
            try {
                aiData = await detectIntent(message);
            } catch (error) {
                console.error("Intent Detection Failed, using keywords.");
                isAiDown = true;
            }

            // KEYWORD FALLBACK
            if (!aiData || aiData.intent === "general_chat" || isAiDown) {
                const lowerMsg = message.toLowerCase();
                if (lowerMsg.includes("flight") || lowerMsg.includes("from") || lowerMsg.includes("to")) {
                    aiData = { intent: "search_flight", from: "", to: "" };
                    const fromMatch = lowerMsg.match(/from\s+([a-z]+)/i);
                    const toMatch = lowerMsg.match(/to\s+([a-z]+)/i);
                    if (fromMatch) aiData.from = fromMatch[1];
                    if (toMatch) aiData.to = toMatch[1];
                } else if (lowerMsg.includes("booking") || lowerMsg.includes("ticket") || lowerMsg.includes("status")) {
                    aiData = { intent: "check_booking" };
                } else {
                    aiData = aiData || { intent: "general_chat" };
                }
            }

            // 2. QUERY DATABASE
            let dataContext = { intent: aiData.intent, foundData: [], userAuthenticated: !!userId };
            if (aiData.intent === "search_flight") {
                const query = {};
                if (aiData.from) query.origin = new RegExp(aiData.from, 'i');
                if (aiData.to) query.destination = new RegExp(aiData.to, 'i');

                const flights = await Flight.find(query).lean().limit(5);
                dataContext.foundData = flights;
                dataContext.searchParams = { from: aiData.from, to: aiData.to };
            }
            else if (aiData.intent === "check_booking") {
                if (userId) {
                    const bookings = await Booking.find({ user_id: userId }).populate('flight_id').sort({ createdAt: -1 }).lean().limit(3);
                    dataContext.foundData = bookings;
                }
            }

            // 3. GENERATE RESPONSE
            let finalReply = "";
            try {
                finalReply = await generateConversationalResponse(message, dataContext);
                if (finalReply.includes("Too Many Requests") || finalReply.includes("too many requests")) {
                    throw new Error("AI_RATE_LIMITED");
                }
            } catch (error) {
                console.warn("AI Response failed, using template.");
                if (dataContext.intent === "search_flight") {
                    if (dataContext.foundData.length > 0) {
                        finalReply = `I found some flights for you: \n` +
                            dataContext.foundData.map(f => `✈️ ${f.flight_number}: ${f.origin} to ${f.destination} at ₹${f.price}`).join('\n');
                    } else {
                        finalReply = `I couldn't find any direct flights matching your request right now. Try searching for different cities! ✈️`;
                    }
                } else if (dataContext.intent === "check_booking") {
                    if (!userId) {
                        finalReply = "Please log in to your Air India account to view your bookings! 🎫";
                    } else if (dataContext.foundData.length > 0) {
                        finalReply = `Here are your recent bookings: \n` +
                            dataContext.foundData.map(b => `🎫 ID: ${b.booking_id} | ${b.flight_id?.flight_number} | Status: ${b.payment_status}`).join('\n');
                    } else {
                        finalReply = "You don't have any recent bookings found in our records. 🔍";
                    }
                } else {
                    finalReply = "Namaste! I'm your Air India Assistant. I can help you search for flights or check your bookings. What can I do for you today?";
                }
            }

            res.json({ success: true, reply: finalReply });
        } catch (error) {
            res.status(500).json({ success: false, reply: "I'm having a small technical glitch. Please try again in a moment! 🙏" });
        }
    }
}

const chatController = new ChatController();

export const chatHandler = chatController.chatHandler.bind(chatController);

export default chatController;

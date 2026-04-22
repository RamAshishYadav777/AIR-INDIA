import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const testGemini = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log("Testing with Key:", key ? `${key.substring(0, 5)}...` : "UNDEFINED");

    if (!key || key === "your_gemini_api_key_here") {
        console.error("❌ ERROR: API key is not set correctly in .env");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("✅ SUCCESS! Gemini Response:", result.response.text());
    } catch (error) {
        console.error("❌ GEMINI TEST FAILED:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
    }
}

testGemini();

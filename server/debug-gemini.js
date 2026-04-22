import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        // List models to see what's available
        // But the SDK might not expose listModels easily?

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const prompt = "Write a sonnet about a cat."
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
    } catch (err) {
        console.error(err);
    }
}

run();

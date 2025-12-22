
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req: Request) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { base64, prompt } = await req.json();

        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response("Missing API Key configuration (API_KEY or GEMINI_API_KEY)", { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64,
                    mimeType: "image/jpeg"
                }
            }
        ]);
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ text }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error in analyze function:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
};

export const config = {
    path: "/api/analyze"
};

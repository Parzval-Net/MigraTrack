
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { message } = await req.json();

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response("Missing API Key configuration (API_KEY or GEMINI_API_KEY)", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
      systemInstruction: "Eres 'MigraCare', un asistente experto en migraña. IMPORTANTE: Siempre responde en español."
    });

    const chat = model.startChat();

    // DEBUG MODE: Streaming disabled to identify connection error
    // With @google/generative-ai, sendMessage return result.response.text() function
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in chat function:", error);
    // Return the ACTUAL error to the client for debugging
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      details: error.message || error.toString()
    }), { status: 500 });
  }
};

export const config = {
  path: "/api/chat"
};

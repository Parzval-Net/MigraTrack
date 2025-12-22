
import { GoogleGenAI } from "@google/genai";

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

    const genAI = new GoogleGenAI({ apiKey });

    // Using simple GenerateContent for now as streaming in serverless functions 
    // without edge adapters can be tricky, but let's try to return a simple response first
    // or set up a proper stream. For simplicity in V1 refactor, we might just await the response
    // OR use a ReadableStream if the environment supports it (Node 18+ functions do).

    // Let's stick to the user's existing logic: user wanted streaming.
    // Netlify Functions (standard) support streaming responses now.

    const chat = genAI.chats.create({
      model: 'gemini-1.5-flash',
      config: {
        systemInstruction: "Eres 'MigraCare', un asistente experto en migraña. IMPORTANTE: Siempre responde en español.",
      },
    });

    // DEBUG MODE: Streaming disabled to identify connection error
    const result = await chat.sendMessage({ message });
    const text = result.text;

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

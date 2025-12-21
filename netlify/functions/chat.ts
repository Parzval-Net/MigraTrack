
import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { message } = await req.json();
    
    if (!process.env.API_KEY) {
        return new Response("Missing API Key configuration", { status: 500 });
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using simple GenerateContent for now as streaming in serverless functions 
    // without edge adapters can be tricky, but let's try to return a simple response first
    // or set up a proper stream. For simplicity in V1 refactor, we might just await the response
    // OR use a ReadableStream if the environment supports it (Node 18+ functions do).
    
    // Let's stick to the user's existing logic: user wanted streaming.
    // Netlify Functions (standard) support streaming responses now.
    
    const chat = genAI.chats.create({
      model: 'gemini-1.5-flash', // Fallback to a known stable model if 'preview' is tricky without precise version
      config: {
        systemInstruction: "Eres 'Alivio', un asistente experto en migraña. Tu tono es empático, clínico pero accesible. Ayudas a identificar disparadores y sugieres técnicas de bienestar. IMPORTANTE: Siempre responde en español. Si te piden consejo médico severo, recuerda que deben consultar a un profesional.",
      },
    });

    const result = await chat.sendMessageStream({ message });
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
             controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

export const config = {
  path: "/api/chat"
};

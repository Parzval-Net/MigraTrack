
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
    const KNOWN_MODELS = [
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-3-flash-preview",
      "gemini-2.0-flash-001",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro"
    ];

    let lastError;
    let successfulModel = "";
    let text = "";

    // Iterate through models until one works
    for (const modelName of KNOWN_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: "Eres 'MigraCare', un asistente experto en migraña. IMPORTANTE: Siempre responde en español."
        });

        // We use the startChat + sendMessage pattern
        const chat = model.startChat();
        const result = await chat.sendMessage(message);
        text = result.response.text();

        successfulModel = modelName;
        break; // Success!

      } catch (e: any) {
        lastError = e;
        console.warn(`Failed with model ${modelName}:`, e.message);
        // Continue to next model if it's a 404 or similar
        if (!e.message.includes("404") && !e.message.includes("not found")) {
          // If it's not a "not found" error (e.g. Auth error), maybe we should stop? 
          // But for now, let's keep trying to be safe.
        }
      }
    }

    if (!successfulModel) {
      let availableModels = "Unknown";
      try {
        // Fallback: Fetch available models directly to show the user/debug
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listResp.ok) {
          const listData = await listResp.json();
          // Filter to only generateContent supported models and map to names
          availableModels = (listData.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m: any) => m.name.replace("models/", ""))
            .join(", ");
        }
      } catch (listErr) {
        console.error("Failed to list models", listErr);
      }

      throw new Error(`All known models failed. Available models for your key: [${availableModels}]. Last error: ${lastError?.message}`);
    }

    // Return text AND the model used for debugging visibility
    return new Response(JSON.stringify({
      text: text,
      debug_model: successfulModel
    }), {
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

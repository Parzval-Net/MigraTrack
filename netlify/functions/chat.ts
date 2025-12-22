
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
        const todayStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const todayISO = new Date().toISOString().split('T')[0];

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: `Eres 'MigraCare', la inteligencia artificial integrada en la aplicación de gestión de migraña.
            
            CONTEXTO TEMPORAL:
            - Hoy es: ${todayStr} (${todayISO}).
            - Si el usuario dice "ayer", calcula la fecha basada en hoy.
            
            TUS TAREAS:
            1. Empatizar con el dolor del usuario.
            2. Extraer información clave (hora, síntomas, detonantes) para confirmar que lo entendiste.
            3. EJECUTAR LA ACCIÓN DE REGISTRO usando los comandos ocultos.
            
            COMANDOS DE CONTROL (Tu forma de "usar" la app):
            - Si el usuario indica dolor HOY: Responde confirmando y añade al final: "[[ACTION:LOG_TODAY]]"
            - Si el usuario indica dolor en PASADO (ayer, el lunes, etc): Calcula la fecha formato YYYY-MM-DD y añade: "[[ACTION:LOG_DATE:YYYY-MM-DD]]"
            - Si pide ver registros/calendario: "[[ACTION:CALENDAR]]"
            - Si pide relajación: "[[ACTION:BIOFEEDBACK]]"
            
            REGLA DE ORO:
            NUNCA digas "no tengo app" o "no puedo registrar". ERES la app. Si detectas intención de registro, usa el comando. Tu respuesta debe parecer que tú misma abres el formulario.`
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

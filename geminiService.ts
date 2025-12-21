
export class GeminiService {

  async *chatStream(message: string) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Connection error: ${response.status} ${response.statusText}`);
      }
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        yield text;
      }
    } catch (error) {
      console.error("Chat Error:", error);
      throw error;
    }
  }

  async analyzeImage(base64Image: string, prompt: string) {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: base64Image, prompt }),
      });

      if (!response.ok) throw new Error('Analysis request failed');

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Analysis Error:", error);
      throw error;
    }
  }
}

export const gemini = new GeminiService();

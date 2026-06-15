import { GoogleGenAI } from '@google/genai';

export const config = {
  runtime: 'edge',
};

const ai = new GoogleGenAI({});

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { message, context } = await req.json();
    
    // Combine the extracted PDF text with the user's question
    const fullPrompt = context 
      ? `Context: ${context}\n\nUser Question: ${message}` 
      : message;

    // Call the Gemini model 
    // 'gemini-2.5-flash' is recommended for speed and text processing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return new Response(JSON.stringify({ 
      answer: response.text || "" 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch response from Gemini AI" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

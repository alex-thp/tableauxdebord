import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class GeminiService {
    private genAI: GoogleGenAI; // Utilisez cette instance partout

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Correction du message d'erreur pour correspondre à la variable recherchée
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  // Supprimez cette ligne car elle initialise une nouvelle instance avec une clé invalide
  // ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" }); 

  async askGemini(question: string, instruction: string) {
    // Utilisez l'instance correctement initialisée this.genAI
    const response = await this.genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: question,
      config: {
        systemInstruction: instruction,
      },
    });
    console.log(response.text);
    return { text: response.text };
  }

async askGeminiArray(question: string[], instruction: string) {
  const response = await this.genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: instruction + "\n\n" + question.join("\n") }
        ]
      }
    ]
  });

  console.log(response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text');
  return { text: response.candidates?.[0]?.content?.parts?.[0]?.text };
}
}

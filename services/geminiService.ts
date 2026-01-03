
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartInsight = async (resourceName: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza este recurso llamado "${resourceName}" con la siguiente descripción: "${description}". 
      Proporciona un resumen muy corto (máximo 2 frases) de por qué es útil para un profesional digital y sugiere un caso de uso ideal.
      Responde en español de forma profesional y entusiasta.`,
    });
    return response.text;
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'No se pudo generar un resumen inteligente en este momento.';
  }
};

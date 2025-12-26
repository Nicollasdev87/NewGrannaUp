
import { GoogleGenAI } from "@google/genai";
import { Transaction, Goal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialAdvice = async (transactions: Transaction[], goals: Goal[]) => {
  const prompt = `
    Como um consultor financeiro inteligente, analise os seguintes dados e forneça 3 dicas rápidas e acionáveis para o usuário.
    Transações: ${JSON.stringify(transactions.slice(0, 5))}
    Metas: ${JSON.stringify(goals.slice(0, 3))}
    Responda em Português do Brasil, de forma amigável e motivadora.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Continue focado em suas metas! Você está no caminho certo.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar dicas no momento. Mas continue economizando!";
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { Language, LocalizedContent } from "../types";
import { GLOBAL_TRANSLATIONS } from "../translations";

export const aiTranslator = {
  async translateContent(text: string, sourceLang: Language): Promise<LocalizedContent> {
    if (!text || text.trim().length === 0) return { en: "" } as any;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const targetLangs = Object.keys(GLOBAL_TRANSLATIONS).filter(l => l !== sourceLang);
    
    const prompt = `
      You are a professional luxury hospitality translator.
      Translate the following text from ${sourceLang.toUpperCase()} into these languages: ${targetLangs.map(l => l.toUpperCase()).join(", ")}.
      
      TEXT TO TRANSLATE:
      "${text}"

      Maintain the tone: Professional, welcoming, high-end, and helpful.
      Keep placeholders like {{bakery}} or {{wifi_pass}} exactly as they are.
      Return ONLY a JSON object where keys are the language codes and values are the translations.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: targetLangs.reduce((acc: any, lang) => {
              acc[lang] = { type: Type.STRING };
              return acc;
            }, {})
          }
        }
      });

      const translations = JSON.parse(response.text);
      return {
        [sourceLang]: text,
        ...translations
      } as LocalizedContent;
    } catch (error) {
      console.error("AI Translation Error:", error);
      throw error;
    }
  }
};

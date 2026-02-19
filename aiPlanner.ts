
import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation, AppConfig } from "../types";

export interface Itinerary {
  morning: Recommendation;
  afternoon: Recommendation;
  evening: Recommendation;
  reasoning: string;
}

export const generateSmartItinerary = async (
  config: AppConfig,
  answers: any,
  weather: { temp: number; code: number } | null
): Promise<Itinerary> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Wir geben Gemini nur die IDs und Grunddaten, um Token zu sparen und die Logik zu steuern
  const poiPool = config.recommendations.map(r => ({
    id: r.id,
    title: r.title,
    category: r.category,
    town: r.town,
    tags: r.tags || []
  }));

  const prompt = `
    Du bist ein luxuriöser Concierge für die Unterkunft "${config.propertyName}" in ${config.city}.
    Erstelle den perfekten Tagesplan aus dem folgenden POI-Pool:
    ${JSON.stringify(poiPool)}

    Gäste-Profil:
    - Typ: ${answers.crew}
    - Energie-Level: ${answers.energy}
    - Interessen: ${answers.interests.join(", ")}
    - Mobilität: ${answers.mobility} (WICHTIG: Wenn 'foot', wähle POIs in ${config.city})
    - Fokus: ${answers.focus}
    - Aktuelles Wetter: ${weather ? `${weather.temp}°C, Wettercode ${weather.code}` : 'Unbekannt'}

    Wähle genau 3 POIs (morning, afternoon, evening). 
    Achte auf eine logische Reihenfolge und kurze Wege.
    Gib eine kurze Begründung (reasoning) auf Deutsch, warum dieser Tag perfekt ist.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            morning_id: { type: Type.STRING },
            afternoon_id: { type: Type.STRING },
            evening_id: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["morning_id", "afternoon_id", "evening_id", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text);
    
    const findPoi = (id: string) => config.recommendations.find(r => r.id === id) || config.recommendations[0];

    return {
      morning: findPoi(result.morning_id),
      afternoon: findPoi(result.afternoon_id),
      evening: findPoi(result.evening_id),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error("AI Planner Error:", error);
    // Fallback auf die alte Zufallslogik, falls die API streikt
    return {
      morning: config.recommendations[0],
      afternoon: config.recommendations[1] || config.recommendations[0],
      evening: config.recommendations[2] || config.recommendations[0],
      reasoning: "Ein klassischer Tag in Sibenik, kuratiert für Sie."
    };
  }
};

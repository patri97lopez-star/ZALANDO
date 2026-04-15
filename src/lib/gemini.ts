import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface IncidentData {
  orderId: string;
  category: "Devolución" | "Cambio de Talla" | "Entrega Fallida" | "Facturación" | "Otro";
  items: string[];
  urgency: "Baja" | "Media" | "Alta";
  sentiment: "Frustrado" | "Neutral" | "Satisfecho";
  summary: string;
  missingInfo: string[];
}

export async function classifyIncident(text: string): Promise<IncidentData> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Analiza el siguiente texto de una incidencia de cliente de Zalando y extrae la información estructurada. 
          
Texto: "${text}"` }]
        }
      ],
      config: {
        systemInstruction: "Eres un experto en soporte al cliente de Zalando. Tu tarea es clasificar incidencias y extraer datos clave. Si falta el número de pedido, indícalo en 'missingInfo'. El número de pedido suele tener 10-12 dígitos o empezar por #. Devuelve SIEMPRE un JSON válido.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            orderId: { type: Type.STRING, description: "Número de pedido (ej: #1234567890). Si no hay, poner 'No detectado'." },
            category: { 
              type: Type.STRING, 
              enum: ["Devolución", "Cambio de Talla", "Entrega Fallida", "Facturación", "Otro"],
              description: "Categoría principal de la incidencia." 
            },
            items: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de productos mencionados." 
            },
            urgency: { 
              type: Type.STRING, 
              enum: ["Baja", "Media", "Alta"],
              description: "Nivel de urgencia detectado." 
            },
            sentiment: { 
              type: Type.STRING, 
              enum: ["Frustrado", "Neutral", "Satisfecho"],
              description: "Sentimiento del cliente." 
            },
            summary: { type: Type.STRING, description: "Resumen de 1 frase de la incidencia." },
            missingInfo: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de datos que faltan para procesar la incidencia (ej: 'Número de pedido', 'Talla deseada')." 
            }
          },
          required: ["orderId", "category", "items", "urgency", "sentiment", "summary", "missingInfo"]
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("La IA no devolvió ninguna respuesta.");
    }

    return JSON.parse(textResponse.trim());
  } catch (e) {
    console.error("Error in classifyIncident:", e);
    throw e;
  }
}


import { GoogleGenAI } from "@google/genai";
import { Property } from "./types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIResponse = async (userMessage: string, properties: Property[]) => {
  // Use ai.models.generateContent to query GenAI with both the model name and prompt.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userMessage,
    config: {
      systemInstruction: `Eres Andrea Sartori, la fundadora de "Andrea Sartori Inmobiliaria". 
      Tu objetivo es brindar una atención cálida, humana y sumamente profesional a quienes visitan tu web.
      
      Debes hablar siempre en primera persona, como la experta inmobiliaria que eres.
      Aquí tienes tu catálogo actual: ${JSON.stringify(properties)}.
      
      GUÍA DE RESPUESTA:
      1. Tono: Elegante, servicial y experto.
      2. Si te preguntan por propiedades, describe las que tienes disponibles resaltando sus beneficios (luminosidad, ubicación, precio).
      3. Habla siempre en español.
      4. Si no encuentras una propiedad que coincida, ofrece buscarla personalmente: "No tengo esa opción exacta en este momento, pero puedo rastrearla por ti. ¿Te gustaría dejarme tu contacto?".
      5. No inventes propiedades. Si algo no está en la lista, sé honesta.
      6. Invita a tasar sus propiedades o a visitarnos en nuestras oficinas si es necesario.`
    }
  });

  // Access the text property directly on the GenerateContentResponse object.
  return response.text || "Lo siento, tuve un pequeño problema al procesar tu mensaje. ¿Podrías intentar escribirme de nuevo?";
};

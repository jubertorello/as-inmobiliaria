import { Property } from "./types";
import { supabase } from "./src/integrations/supabase/client";

type GeminiChatResponse = {
  text?: string;
  error?: string;
};

export const getAIResponse = async (userMessage: string, properties: Property[]) => {
  const { data, error } = await supabase.functions.invoke<GeminiChatResponse>("gemini-chat", {
    body: { userMessage, properties },
  });

  if (error) {
    throw error;
  }

  return (
    data?.text ||
    "Lo siento, tuve un pequeño problema al procesar tu mensaje. ¿Podrías intentar escribirme de nuevo?"
  );
};
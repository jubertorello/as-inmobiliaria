import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const functionName = "gemini-chat";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  userMessage?: string;
  properties?: unknown;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error(`[${functionName}] Missing GEMINI_API_KEY secret`);
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional mitigation: restrict who can call this function by Origin.
    // Set ALLOWED_ORIGINS to a comma-separated list (e.g. "https://example.com,http://localhost:3000").
    const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (allowedOrigins.length > 0) {
      const origin = (req.headers.get("origin") || "").trim();
      if (!origin || !allowedOrigins.includes(origin)) {
        console.warn(`[${functionName}] Blocked request due to Origin`, { origin });
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const userMessage = (body.userMessage || "").trim();

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Missing userMessage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemInstruction = `Eres Andrea Sartori, la fundadora de "Andrea Sartori Inmobiliaria".
Tu objetivo es brindar una atención cálida, humana y sumamente profesional a quienes visitan tu web.

Debes hablar siempre en primera persona, como la experta inmobiliaria que eres.
Aquí tienes tu catálogo actual: ${JSON.stringify(body.properties ?? [])}.

GUÍA DE RESPUESTA:
1. Tono: Elegante, servicial y experto.
2. Si te preguntan por propiedades, describe las que tienes disponibles resaltando sus beneficios (luminosidad, ubicación, precio).
3. Habla siempre en español.
4. Si no encuentras una propiedad que coincida, ofrece buscarla personalmente: "No tengo esa opción exacta en este momento, pero puedo rastrearla por ti. ¿Te gustaría dejarme tu contacto?".
5. No inventes propiedades. Si algo no está en la lista, sé honesta.
6. Invita a tasar sus propiedades o a visitarnos en nuestras oficinas si es necesario.`;

    // Google AI Studio / Gemini API
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      GEMINI_API_KEY,
    )}`;

    const geminiResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
      }),
    });

    if (!geminiResp.ok) {
      const text = await geminiResp.text().catch(() => "");
      console.error(`[${functionName}] Gemini error`, { status: geminiResp.status, text });
      return new Response(JSON.stringify({ error: "Upstream provider error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = (await geminiResp.json().catch(() => null)) as any;
    const outputText =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text)
        .filter(Boolean)
        .join("\n") || "";

    return new Response(
      JSON.stringify({
        text:
          outputText ||
          "Lo siento, tuve un pequeño problema al procesar tu mensaje. ¿Podrías intentar escribirme de nuevo?",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(`[${functionName}] Unhandled error`, { error });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
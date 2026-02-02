import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const functionName = "contact-direct";

type Body = {
  name?: string;
  phone?: string;
  message?: string;
  /** Honeypot field (should remain empty). */
  website?: string;
  /** Cloudflare Turnstile token (optional but recommended). */
  turnstileToken?: string;
};

const RATE_LIMIT_MAX_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error(`[${functionName}] Missing RESEND_API_KEY secret`);
      return new Response(JSON.stringify({ error: "Missing email provider configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: restrict browser-based calls to an allowlist.
    const allowList = (Deno.env.get("CONTACT_DIRECT_ALLOWED_ORIGINS") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (allowList.length > 0) {
      if (!origin || !allowList.includes(origin)) {
        console.warn(`[${functionName}] Blocked request from non-allowed origin`, { origin });
        return new Response(JSON.stringify({ error: "Origin not allowed" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = (await req.json().catch(() => ({}))) as Body;

    // Honeypot for bots: pretend success but do nothing.
    if ((body.website || "").trim()) {
      console.warn(`[${functionName}] Honeypot triggered`);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = cleanSingleLine((body.name || "").trim());
    const phone = cleanSingleLine((body.phone || "").trim());
    const message = (body.message || "").trim();

    const validationError = validateInput({ name, phone, message });
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY")?.trim();
    if (turnstileSecret) {
      const token = (body.turnstileToken || "").trim();
      if (!token) {
        return new Response(JSON.stringify({ error: "Missing captcha token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ok = await verifyTurnstile({ token, secret: turnstileSecret, remoteIp: getClientIp(req) });
      if (!ok) {
        console.warn(`[${functionName}] Turnstile verification failed`);
        return new Response(JSON.stringify({ error: "Captcha verification failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const clientIp = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`[${functionName}] Missing Supabase service role configuration`);
      return new Response(JSON.stringify({ error: "Missing server configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const ipHashSalt = Deno.env.get("CONTACT_DIRECT_IP_SALT") || "local-dev-salt";
    const ipHash = await sha256(`${ipHashSalt}:${clientIp || "unknown"}`);

    // Rate-limit by IP hash.
    const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count: recentCount, error: countError } = await admin
      .from("contact_direct_submissions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso);

    if (countError) {
      console.error(`[${functionName}] Failed to check rate limit`, { countError });
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((recentCount ?? 0) >= RATE_LIMIT_MAX_PER_HOUR) {
      // Log blocked attempt (best-effort).
      await admin.from("contact_direct_submissions").insert({
        ip_hash: ipHash,
        origin: origin || null,
        user_agent: userAgent,
        result: "blocked_rate_limit",
      });

      return new Response(
        JSON.stringify({
          error: "Rate limited",
          retryAfterSeconds: 60 * 15,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": "900",
          },
        },
      );
    }

    // You can override these with Supabase Edge Function secrets:
    // - RESEND_TO_EMAIL
    // - RESEND_FROM_EMAIL
    const toEmail = (Deno.env.get("RESEND_TO_EMAIL") || "novedosaoportunidad@gmail.com").trim();
    const fromEmail = (Deno.env.get("RESEND_FROM_EMAIL") || "Andrea Sartori Web <onboarding@resend.dev>").trim();

    const subject = `Consulta directa - ${name} (${phone})`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.6;">
        <h2>Consulta directa desde la web</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Mensaje:</strong></p>
        <pre style="white-space: pre-wrap; background:#f6f7f9; padding:12px; border-radius:8px;">${escapeHtml(message)}</pre>
      </div>
    `;

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!resendResp.ok) {
      const text = await resendResp.text().catch(() => "");
      console.error(`[${functionName}] Resend error`, { status: resendResp.status, text });

      // Log failure (best-effort).
      await admin.from("contact_direct_submissions").insert({
        ip_hash: ipHash,
        origin: origin || null,
        user_agent: userAgent,
        result: "failed_resend",
      });

      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log success (best-effort).
    await admin.from("contact_direct_submissions").insert({
      ip_hash: ipHash,
      origin: origin || null,
      user_agent: userAgent,
      result: "sent",
    });

    console.log(`[${functionName}] Email sent`, { toEmail });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${functionName}] Unhandled error`, { error });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get("origin") ?? ""), "Content-Type": "application/json" },
    });
  }
});

function buildCorsHeaders(origin: string) {
  // Note: CORS is not a security boundary, but restricting origins helps prevent browser-based abuse.
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function validateInput({ name, phone, message }: { name: string; phone: string; message: string }) {
  if (!name || !phone || !message) return "Missing required fields";

  if (name.length < 2 || name.length > 80) return "Invalid name";
  if (phone.length < 6 || phone.length > 30) return "Invalid phone";
  if (message.length < 5 || message.length > 2000) return "Invalid message";

  // Basic pattern checks (keep permissive for real-world inputs).
  if (!/^[\p{L} .,'-]{2,80}$/u.test(name)) return "Invalid name";
  if (!/^[0-9+() .-]{6,30}$/.test(phone)) return "Invalid phone";

  return null;
}

function cleanSingleLine(input: string) {
  // Avoid newline/control characters in headers/subject.
  return input.replace(/[\r\n\t\0\f\v]+/g, " ").trim();
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getClientIp(req: Request) {
  // Supabase edge functions typically include x-forwarded-for.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}

async function sha256(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const arr = Array.from(new Uint8Array(digest));
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTurnstile({
  token,
  secret,
  remoteIp,
}: {
  token: string;
  secret: string;
  remoteIp: string | null;
}) {
  try {
    const form = new FormData();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteIp) form.set("remoteip", remoteIp);

    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });

    if (!resp.ok) {
      console.warn(`[${functionName}] Turnstile verify HTTP error`, { status: resp.status });
      return false;
    }

    const data = (await resp.json().catch(() => null)) as null | { success?: boolean };
    return Boolean(data?.success);
  } catch (error) {
    console.warn(`[${functionName}] Turnstile verify exception`, { error });
    return false;
  }
}
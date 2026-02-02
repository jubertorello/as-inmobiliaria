import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const functionName = "bootstrap-superadmin";

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

type Body = {
  token?: string;
};

const SUPER_ADMIN_EMAIL = "julietabertorello@gmail.com";

function buildCorsHeaders(origin: string, allowedOrigin: string) {
  // Note: CORS is not a security boundary, but restricting origins prevents browser-based abuse.
  // Default: do NOT allow browser origins unless explicitly configured.
  const allow = allowedOrigin && origin === allowedOrigin ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function getInitialSuperAdminPassword() {
  // Never hardcode credentials in source control.
  // Prefer SUPER_ADMIN_PASSWORD; keep SUPER_ADMIN_INITIAL_PASSWORD for backwards compatibility.
  return (
    (Deno.env.get("SUPER_ADMIN_PASSWORD") || "").trim() ||
    (Deno.env.get("SUPER_ADMIN_INITIAL_PASSWORD") || "").trim()
  );
}

function getClientIp(req: Request) {
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

serve(async (req) => {
  const origin = (req.headers.get("Origin") || "").trim();
  const allowedOrigin = (Deno.env.get("BOOTSTRAP_ALLOWED_ORIGIN") || "").trim();
  const corsHeaders = buildCorsHeaders(origin, allowedOrigin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(`[${functionName}] Missing env vars`);
    return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
  }

  // Block browser-origin calls unless explicitly allowlisted.
  // (Server-to-server calls typically have no Origin header.)
  if (origin && (!allowedOrigin || origin !== allowedOrigin)) {
    console.warn(`[${functionName}] Blocked request from non-allowed origin`, { origin });
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const userAgent = req.headers.get("user-agent") ?? null;
  const clientIp = getClientIp(req);

  try {
    // Rate limit (best effort) by IP hash.
    const body = (await req.json().catch(() => ({}))) as Body;
    const token = (body.token || "").trim();

    const expected = (Deno.env.get("BOOTSTRAP_TOKEN") || "").trim();
    // Use an optional dedicated salt, fallback to expected token (secret) to avoid adding a new required secret.
    const ipHashSalt = (Deno.env.get("BOOTSTRAP_IP_SALT") || expected || "local-dev-salt").trim();
    const ipHash = await sha256(`${ipHashSalt}:${clientIp || "unknown"}`);

    const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count: recentCount, error: countErr } = await service
      .from("bootstrap_superadmin_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", sinceIso);

    if (countErr) {
      console.error(`[${functionName}] Failed checking rate limit`, { countErr });
      return new Response("Internal error", { status: 500, headers: corsHeaders });
    }

    if ((recentCount ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
      await service.from("bootstrap_superadmin_attempts").insert({
        ip_hash: ipHash,
        origin: origin || null,
        user_agent: userAgent,
        result: "blocked_rate_limit",
      });

      return new Response("Rate limited", {
        status: 429,
        headers: { ...corsHeaders, "Retry-After": "900" },
      });
    }

    if (!expected || token !== expected) {
      console.warn(`[${functionName}] Invalid bootstrap token`);

      await service.from("bootstrap_superadmin_attempts").insert({
        ip_hash: ipHash,
        origin: origin || null,
        user_agent: userAgent,
        result: "invalid_token",
      });

      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    // One-time-use guard
    const { data: state, error: stateErr } = await service
      .from("bootstrap_state")
      .select("key")
      .eq("key", "superadmin")
      .maybeSingle();

    if (stateErr) {
      console.error(`[${functionName}] Failed reading bootstrap_state`, { stateErr });
      return new Response(JSON.stringify({ error: stateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (state?.key) {
      console.warn(`[${functionName}] Refusing to run: already bootstrapped`);

      await service.from("bootstrap_superadmin_attempts").insert({
        ip_hash: ipHash,
        origin: origin || null,
        user_agent: userAgent,
        result: "already_bootstrapped",
      });

      return new Response(JSON.stringify({ error: "Bootstrap already completed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure allow-list entry exists
    const { error: allowErr } = await service.from("admin_allowlist").upsert({
      email: SUPER_ADMIN_EMAIL,
    });

    if (allowErr) {
      console.error(`[${functionName}] Failed upserting allowlist`, { allowErr });
      return new Response(JSON.stringify({ error: allowErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user exists
    const { data: listed, error: listErr } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listErr) {
      console.error(`[${functionName}] listUsers failed`, { listErr });
      return new Response(JSON.stringify({ error: listErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const existing = (listed.users || []).find(
      (u) => (u.email || "").toLowerCase() === SUPER_ADMIN_EMAIL
    );

    if (!existing) {
      const initialPassword = getInitialSuperAdminPassword();
      if (!initialPassword) {
        console.error(`[${functionName}] Missing SUPER_ADMIN_PASSWORD secret`);
        return new Response(
          JSON.stringify({
            error:
              "Server misconfigured: missing SUPER_ADMIN_PASSWORD secret (do not hardcode credentials in source control).",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const { error: createErr } = await service.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: initialPassword,
        email_confirm: true,
      });

      if (createErr) {
        console.error(`[${functionName}] createUser failed`, { createErr });
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark bootstrap as completed (one-time-use)
      const { error: markErr } = await service.from("bootstrap_state").upsert({
        key: "superadmin",
      });

      if (markErr) {
        console.error(`[${functionName}] Failed marking bootstrap_state`, { markErr });
        return new Response(JSON.stringify({ error: markErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await service.from("bootstrap_superadmin_attempts").insert({
        ip_hash: ipHash,
        origin: origin || null,
        user_agent: userAgent,
        result: "success_created",
      });

      console.log(`[${functionName}] Superadmin created`);
      return new Response(JSON.stringify({ ok: true, created: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Do NOT reset passwords. If the user already exists, treat as done and lock bootstrap.
    const { error: markErr } = await service.from("bootstrap_state").upsert({
      key: "superadmin",
    });

    if (markErr) {
      console.error(`[${functionName}] Failed marking bootstrap_state`, { markErr });
      return new Response(JSON.stringify({ error: markErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await service.from("bootstrap_superadmin_attempts").insert({
      ip_hash: ipHash,
      origin: origin || null,
      user_agent: userAgent,
      result: "success_already_existed",
    });

    console.log(`[${functionName}] Superadmin already exists; bootstrap locked`);
    return new Response(JSON.stringify({ ok: true, created: false, alreadyExisted: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[${functionName}] Unhandled error`, { error });
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
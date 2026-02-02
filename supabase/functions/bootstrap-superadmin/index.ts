import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const functionName = "bootstrap-superadmin";

const defaultCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  token?: string;
};

const SUPER_ADMIN_EMAIL = "julietabertorello@gmail.com";

function getCorsHeaders(req: Request) {
  const allowedOrigin = (Deno.env.get("BOOTSTRAP_ALLOWED_ORIGIN") || "").trim();
  if (!allowedOrigin) return defaultCorsHeaders;

  const origin = (req.headers.get("Origin") || "").trim();
  if (origin && origin === allowedOrigin) {
    return {
      ...defaultCorsHeaders,
      "Access-Control-Allow-Origin": allowedOrigin,
    };
  }

  // Non-browser / no Origin header: allow (bootstrap is intended to be called server-to-server)
  if (!origin) {
    return {
      ...defaultCorsHeaders,
      "Access-Control-Allow-Origin": allowedOrigin,
    };
  }

  return {
    ...defaultCorsHeaders,
    "Access-Control-Allow-Origin": allowedOrigin,
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const token = (body.token || "").trim();

    const expected = (Deno.env.get("BOOTSTRAP_TOKEN") || "").trim();
    if (!expected || token !== expected) {
      console.warn(`[${functionName}] Invalid bootstrap token`);
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${functionName}] Missing env vars`);
      return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
    }

    const allowedOrigin = (Deno.env.get("BOOTSTRAP_ALLOWED_ORIGIN") || "").trim();
    const origin = (req.headers.get("Origin") || "").trim();
    if (allowedOrigin && origin && origin !== allowedOrigin) {
      console.warn(`[${functionName}] Forbidden origin`, { origin });
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
      return new Response(JSON.stringify({ error: "Bootstrap already completed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure allow-list entry exists
    const { error: allowErr } = await service
      .from("admin_allowlist")
      .upsert({ email: SUPER_ADMIN_EMAIL });

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
      // Password must come from a secret (never hardcode credentials)
      const initialPassword = (Deno.env.get("SUPER_ADMIN_INITIAL_PASSWORD") || "").trim();
      if (!initialPassword) {
        console.error(`[${functionName}] Missing SUPER_ADMIN_INITIAL_PASSWORD secret`);
        return new Response(
          JSON.stringify({
            error:
              "Server misconfigured: missing SUPER_ADMIN_INITIAL_PASSWORD secret (do not hardcode credentials in source control).",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
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
      const { error: markErr } = await service
        .from("bootstrap_state")
        .upsert({ key: "superadmin" });

      if (markErr) {
        console.error(`[${functionName}] Failed marking bootstrap_state`, { markErr });
        return new Response(JSON.stringify({ error: markErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[${functionName}] Superadmin created`);
      return new Response(JSON.stringify({ ok: true, created: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Do NOT reset passwords. If the user already exists, treat as done and lock bootstrap.
    const { error: markErr } = await service
      .from("bootstrap_state")
      .upsert({ key: "superadmin" });

    if (markErr) {
      console.error(`[${functionName}] Failed marking bootstrap_state`, { markErr });
      return new Response(JSON.stringify({ error: markErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
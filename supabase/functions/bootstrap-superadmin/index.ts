import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const functionName = "bootstrap-superadmin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  token?: string;
};

const SUPER_ADMIN_EMAIL = "julietabertorello@gmail.com";
const SUPER_ADMIN_PASSWORD = "ASinmobiliaria!";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const token = (body.token || "").trim();

    const expected = Deno.env.get("BOOTSTRAP_TOKEN") || "";
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

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
      const { error: createErr } = await service.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
      });

      if (createErr) {
        console.error(`[${functionName}] createUser failed`, { createErr });
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[${functionName}] Superadmin created`);
      return new Response(JSON.stringify({ ok: true, created: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateErr } = await service.auth.admin.updateUserById(existing.id, {
      password: SUPER_ADMIN_PASSWORD,
    });

    if (updateErr) {
      console.error(`[${functionName}] updateUserById failed`, { updateErr });
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[${functionName}] Superadmin password updated`);
    return new Response(JSON.stringify({ ok: true, created: false }), {
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

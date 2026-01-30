import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const functionName = "invite-admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type InviteAdminBody = {
  email?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error(`[${functionName}] Missing Authorization header`);
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${functionName}] Missing environment variables`);
      return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
    }

    // Validate caller (manual auth)
    const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await authedClient.auth.getUser();
    if (userErr || !userData?.user?.email) {
      console.error(`[${functionName}] auth.getUser() failed`, { userErr });
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const callerEmail = userData.user.email;
    if (callerEmail !== "julietabertorello@gmail.com") {
      console.warn(`[${functionName}] Forbidden (not super admin)`, { callerEmail });
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const body = (await req.json().catch(() => ({}))) as InviteAdminBody;
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Add to allow-list first
    const { error: allowErr } = await service
      .from("admin_allowlist")
      .upsert({ email, created_by: userData.user.id });

    if (allowErr) {
      console.error(`[${functionName}] Failed to upsert allowlist`, { allowErr });
      return new Response(JSON.stringify({ error: allowErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send an invite email (user will set password)
    const { error: inviteErr } = await service.auth.admin.inviteUserByEmail(email);

    if (inviteErr) {
      console.error(`[${functionName}] Failed to invite user`, { inviteErr });
      return new Response(JSON.stringify({ error: inviteErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[${functionName}] Invite sent`, { email });

    return new Response(JSON.stringify({ ok: true }), {
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

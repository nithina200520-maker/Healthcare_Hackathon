import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return respond({ error: "Missing authorization" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user: caller },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !caller) {
      return respond({ error: "Invalid login session" }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: adminRecord, error: adminError } = await adminClient
      .from("authorized_admins")
      .select("admin_id")
      .eq("admin_id", caller.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      return respond({ error: "Admin access required" }, 403);
    }

    const { userId, action } = await req.json();

    if (
      typeof userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ) {
      return respond({ error: "Invalid user ID" }, 400);
    }

    if (action !== "suspend" && action !== "reactivate") {
      return respond({ error: "Invalid action" }, 400);
    }

    if (userId === caller.id) {
      return respond({ error: "You cannot suspend your own account" }, 400);
    }

    const { data: targetAdmin, error: targetAdminError } = await adminClient
      .from("authorized_admins")
      .select("admin_id")
      .eq("admin_id", userId)
      .maybeSingle();

    if (targetAdminError) {
      return respond({ error: "Could not verify target account" }, 500);
    }

    if (targetAdmin) {
      return respond({ error: "Admin accounts cannot be managed here" }, 403);
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      userId,
      {
        ban_duration: action === "suspend" ? "876000h" : "none",
      },
    );

    if (error) {
      console.error("ACCOUNT UPDATE ERROR:", error);
      return respond({ error: error.message }, 400);
    }

    // Record the successful account action
    const { error: logError } = await adminClient
      .from("admin_activity_logs")
      .insert({
        admin_id: caller.id,
        action:
          action === "suspend"
            ? "ACCOUNT_SUSPENDED"
            : "ACCOUNT_REACTIVATED",
        target_user_id: userId,
        target_role: data.user.user_metadata?.role ?? "Unknown",
        details: {
          email: data.user.email,
          banned_until: data.user.banned_until,
        },
      });

    if (logError) {
      console.error("AUDIT LOG ERROR:", logError);
    }

    console.log("ACCOUNT UPDATE:", {
      action,
      userId,
      banned_until: data.user.banned_until,
      auditLogged: !logError,
    });

    return respond({
      success: true,
      message:
        action === "suspend"
          ? "User account suspended"
          : "User reactivated",
      userId: data.user.id,
      banned_until: data.user.banned_until,
      auditLogged: !logError,
    });
  } catch (error) {
    console.error("FUNCTION ERROR:", error);

    return respond(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error",
      },
      500,
    );
  }
});

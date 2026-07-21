import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type";
const CORS_ALLOWED_METHODS = "POST, OPTIONS";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;
const allowedOrigins = (Deno.env.get("CORS_ALLOWED_ORIGINS") || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
const deletionTables = [
  "ic_educate_saved_tutors",
  "ic_educate_marketplace_messages",
  "card_reviews",
  "revision_cards",
  "question_attempts",
  "mistake_events",
  "worksheet_attempts",
  "ic_educate_teacher_profiles",
  "ic_educate_leads",
  "ic_educate_paper_requests",
  "ic_educate_mistakes",
] as const;

const isAllowedOrigin = (origin: string) =>
  allowedOrigins.length > 0 && allowedOrigins.includes(origin);

const buildCorsHeaders = (request: Request) => {
  const origin = request.headers.get("Origin")?.trim() || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": CORS_ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": CORS_ALLOWED_METHODS,
    "Content-Type": "application/json",
    Vary: "Origin",
    ...NO_STORE_HEADERS,
  };

  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
};

const originRejected = (request: Request) => {
  const origin = request.headers.get("Origin")?.trim() || "";
  return origin.length > 0 && !isAllowedOrigin(origin);
};

const json = (
  request: Request,
  status: number,
  payload: Record<string, unknown>,
) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: buildCorsHeaders(request),
  });

const readDeleteReason = async (request: Request) => {
  try {
    const body = await request.json();
    return typeof body?.reason === "string"
      ? body.reason.trim().slice(0, 1000)
      : "";
  } catch (error) {
    if (error instanceof SyntaxError) {
      return "";
    }
    throw error;
  }
};

const options = (request: Request) => {
  if (originRejected(request)) {
    return json(request, 403, { error: "Origin not allowed" });
  }

  return new Response("ok", {
    headers: buildCorsHeaders(request),
  });
};

const deleteUserRows = async (
  adminClient: ReturnType<typeof createClient>,
  userId: string,
) => {
  const deletionCounts: Record<string, number> = {};

  const deleteRows = async (table: string) => {
    const { data, error } = await adminClient
      .from(table)
      .delete()
      .eq("user_id", userId)
      .select("id");
    if (error) throw error;
    deletionCounts[table] = Array.isArray(data) ? data.length : 0;
  };

  for (const table of deletionTables) {
    await deleteRows(table);
  }

  return deletionCounts;
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("PROJECT_URL") ||
  "";
const supabaseAnonKey =
  Deno.env.get("SUPABASE_ANON_KEY") ||
  Deno.env.get("ANON_KEY") ||
  "";
const supabaseServiceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  "";

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return options(request);
  }

  if (request.method !== "POST") {
    return json(request, 405, { error: "Method not allowed" });
  }

  if (originRejected(request)) {
    return json(request, 403, { error: "Origin not allowed" });
  }

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return json(request, 500, {
      error: "Supabase environment variables are not configured",
    });
  }

  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(request, 401, { error: "Missing bearer token" });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user || null;

  if (userError || !user) {
    return json(request, 401, {
      error: userError?.message || "Could not verify the signed-in user",
    });
  }

  try {
    const reason = await readDeleteReason(request);
    const deletionCounts = await deleteUserRows(adminClient, user.id);

    const { error: auditError } = await adminClient
      .from("ic_educate_account_deletions")
      .insert({
      user_id: user.id,
      email: user.email || null,
      reason: reason || null,
      deleted_rows: deletionCounts,
    });
    if (auditError) throw auditError;

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return json(request, 200, { ok: true, deleted: deletionCounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Account deletion failed";
    return json(request, 500, { error: message });
  }
});

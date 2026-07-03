const ALLOWED_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "won",
  "archived",
]);

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.jobs_hunt_fastlane_leads) {
    return json({ ok: false, error: "Database binding is missing." }, 500);
  }

  const expectedKey = env.JOBS_HUNT_ADMIN_KEY || "";
  const providedKey = request.headers.get("x-jobs-hunt-admin-key") || "";
  if (!expectedKey || providedKey !== expectedKey) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const leadId = stringOrEmpty(payload?.leadId).trim();
  const queueStatus = stringOrEmpty(payload?.queueStatus).trim();
  const adminNotes = stringOrEmpty(payload?.adminNotes).trim();

  if (!leadId) {
    return json({ ok: false, error: "leadId is required." }, 400);
  }

  if (!ALLOWED_STATUSES.has(queueStatus)) {
    return json({ ok: false, error: "Invalid queue status." }, 400);
  }

  const updatedAt = new Date().toISOString();
  const result = await env.jobs_hunt_fastlane_leads
    .prepare(
      `UPDATE paid_pilot_leads
       SET queue_status = ?, admin_notes = ?, updated_at = ?
       WHERE id = ?`
    )
    .bind(queueStatus, adminNotes, updatedAt, leadId)
    .run();

  if (!result.meta?.changes) {
    return json({ ok: false, error: "Lead not found." }, 404);
  }

  return json({
    ok: true,
    leadId,
    queueStatus,
    adminNotes,
    updatedAt,
  });
}

function stringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-jobs-hunt-admin-key",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

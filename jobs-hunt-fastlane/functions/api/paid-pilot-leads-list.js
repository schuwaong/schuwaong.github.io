export async function onRequestGet(context) {
  const { request, env } = context;

  if (!env.jobs_hunt_fastlane_leads) {
    return json({ ok: false, error: "Database binding is missing." }, 500);
  }

  const expectedKey = env.JOBS_HUNT_ADMIN_KEY || "";
  const providedKey = request.headers.get("x-jobs-hunt-admin-key") || "";
  if (!expectedKey || providedKey !== expectedKey) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }

  const { results } = await env.jobs_hunt_fastlane_leads
    .prepare(
      `SELECT
        id,
        created_at,
        project,
        offer,
        source_page,
        name,
        contact,
        target_market,
        pilot_package,
        target_roles,
        approval_rule,
        queue_status,
        admin_notes,
        updated_at
      FROM paid_pilot_leads
      ORDER BY created_at DESC
      LIMIT 100`
    )
    .all();

  return json({
    ok: true,
    leads: results || [],
    adminPaymentUrl: env.JOBS_HUNT_ADMIN_PAYMENT_URL || ""
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.jobs_hunt_fastlane_leads) {
    return json(
      { ok: false, error: "Database binding is missing." },
      500
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const fields = sanitizeFields(payload?.fields);
  if (!fields.name || !fields.contact || !fields.target_market || !fields.target_roles) {
    return json(
      {
        ok: false,
        error: "Missing required fields: name, contact, target_market, and target_roles.",
      },
      400
    );
  }

  const leadId = crypto.randomUUID();
  const createdAt = payload?.createdAt || new Date().toISOString();
  const updatedAt = createdAt;
  const sourcePage = stringOrEmpty(payload?.page);
  const approvalRule = stringOrEmpty(fields.approval_rule);
  const pilotPackage = stringOrEmpty(fields.package);

  await env.jobs_hunt_fastlane_leads
    .prepare(
      `INSERT INTO paid_pilot_leads (
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
        fields_json,
        queue_status,
        admin_notes,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      leadId,
      createdAt,
      stringOrEmpty(payload?.project) || "jobs_hunt",
      stringOrEmpty(payload?.offer) || "paid-pilot",
      sourcePage,
      stringOrEmpty(fields.name),
      stringOrEmpty(fields.contact),
      stringOrEmpty(fields.target_market),
      pilotPackage,
      stringOrEmpty(fields.target_roles),
      approvalRule,
      JSON.stringify(fields),
      "new",
      "",
      updatedAt
    )
    .run();

  return json({
    ok: true,
    leadId,
    createdAt,
    message: "Lead saved online.",
  });
}

function sanitizeFields(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, stringOrEmpty(item).trim()])
  );
}

function stringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
  });
}

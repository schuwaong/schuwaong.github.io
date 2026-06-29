const ADMIN_SESSION_KEY = "ic-educate-admin-session";
const LOCAL_STORE_KEYS = {
  leads: "ic-educate-leads",
  teachers: "ic-educate-teacher-leads",
  requests: "ic-educate-requests",
  marketplace: "ic-educate-marketplace",
};

const SUPABASE_URL = window.IC_EDUCATE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";

const adminLoginForm = document.getElementById("adminLoginForm");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminSignOutBtn = document.getElementById("adminSignOutBtn");
const refreshAdminBtn = document.getElementById("refreshAdminBtn");
const adminBackendStatus = document.getElementById("adminBackendStatus");
const adminLeadCount = document.getElementById("adminLeadCount");
const adminUpdatedAt = document.getElementById("adminUpdatedAt");
const adminStats = document.getElementById("adminStats");
const adminMarketFilter = document.getElementById("adminMarketFilter");
const adminTypeFilter = document.getElementById("adminTypeFilter");
const adminStatusFilter = document.getElementById("adminStatusFilter");
const adminSearchFilter = document.getElementById("adminSearchFilter");
const adminLeadList = document.getElementById("adminLeadList");
const adminVisibleCount = document.getElementById("adminVisibleCount");
const adminMatchPanel = document.getElementById("adminMatchPanel");

const routePhone = (market = "malaysia") => (market === "hongkong" ? "85255115251" : "60178265300");
const routeLabel = (market = "malaysia") => (market === "hongkong" ? "Hong Kong" : "Malaysia");
const statusOrder = { new: 0, contacted: 1, matched: 2, closed: 3 };
const statuses = ["new", "contacted", "matched", "closed"];

let adminSession = loadSession();
let allLeads = [];
let selectedLeadId = "";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const normalizePhone = (value = "") => String(value || "").replace(/\D+/g, "");

const isUuid = (value = "") =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function readJson(key, fallback = []) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be unavailable in private windows.
  }
}

function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || "null");
    if (!parsed?.access_token) return null;
    if (parsed.expires_at && Date.now() > parsed.expires_at) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(session) {
  adminSession = session;
  try {
    if (session) localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

function inferMarket(...values) {
  const text = normalizeText(values.filter(Boolean).join(" "));
  if (
    ["hong kong", "hk", "kowloon", "new territories", "central", "causeway bay", "sha tin", "tuen mun"].some((needle) =>
      text.includes(needle)
    )
  ) {
    return "hongkong";
  }
  return "malaysia";
}

function inferType(row, sourceKey) {
  const raw = normalizeText(row.lead_type || row.type || row.queueType || "");
  if (raw.includes("teacher") || sourceKey === LOCAL_STORE_KEYS.teachers) return "teacher";
  if (raw.includes("parent")) return "parent";
  return "student";
}

function normalizeMode(value = "") {
  const text = normalizeText(value);
  if (["both", "either", "any", "online or physical"].includes(text)) return "both";
  if (text.includes("physical") || text.includes("home")) return "physical";
  if (text.includes("online")) return "online";
  return value || "online";
}

function normalizeStatus(value = "") {
  const status = normalizeText(value);
  return statuses.includes(status) ? status : "new";
}

function normalizeLead(row = {}, sourceKey = "local", forcedType = "") {
  const type = forcedType || inferType(row, sourceKey);
  const name = row.name || row.studentName || row.parentName || row.teacherName || "";
  const subject = row.subject || row.subjects || "";
  const topic = row.topic || row.topics || "";
  const level = row.level || row.syllabus || row.grade || "";
  const area = row.area || row.location || row.region || "";
  const market = row.market || inferMarket(area, row.page, row.note, subject);
  const createdAt = row.created_at || row.createdAt || row.created || new Date().toISOString();
  const preferredTime = row.preferred_time || row.preferredTime || row.time || row.schedule || row.availability || "";
  const localId = row.id || `${sourceKey}:${type}:${name}:${row.phone || row.email || ""}:${subject}:${createdAt}`;

  return {
    id: String(localId),
    rawId: row.id || "",
    sourceKey,
    sourceLabel: sourceLabel(row.source || sourceKey),
    name,
    email: row.email || "",
    phone: row.phone || "",
    type,
    subject,
    topic,
    level,
    area,
    market,
    mode: normalizeMode(row.mode || row.lessonType || ""),
    preferredTime,
    budget: row.budget || row.fee || "",
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    status: normalizeStatus(row.status),
    consentWhatsapp: Boolean(row.consent_whatsapp ?? row.consentWhatsapp ?? row.whatsappConsent),
    note: row.note || row.notes || row.intro || row.message || "",
    page: row.page || "",
    createdAt,
    updatedAt: row.updated_at || row.updatedAt || "",
    original: row,
    storageKey: sourceKey,
    isRemote: sourceKey === "supabase",
  };
}

function sourceLabel(source = "") {
  const text = String(source || "");
  const labels = {
    [LOCAL_STORE_KEYS.leads]: "Lead kit",
    [LOCAL_STORE_KEYS.teachers]: "Teacher signup",
    [LOCAL_STORE_KEYS.requests]: "Tutor request",
    [LOCAL_STORE_KEYS.marketplace]: "Marketplace",
    "teacher-signup": "Teacher signup",
    "free-7-day-plan": "7-day plan",
    "personalized-exam-pdf-request": "PDF request",
    "tutor-finder": "Tutor finder",
    supabase: "Supabase",
  };
  return labels[text] || text || "Local";
}

function leadKey(lead) {
  const phone = normalizePhone(lead.phone);
  if (phone) return `${lead.type}:${phone}`;
  const email = normalizeText(lead.email);
  if (email) return `${lead.type}:${email}`;
  return `${lead.type}:${normalizeText(lead.name)}:${normalizeText(lead.subject)}:${lead.createdAt}`;
}

function mergeLeads(leads) {
  const map = new Map();
  leads.forEach((lead) => {
    const key = leadKey(lead);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, lead);
      return;
    }
    map.set(key, {
      ...existing,
      ...Object.fromEntries(Object.entries(lead).filter(([, value]) => value !== "" && value !== null && value !== undefined)),
      id: existing.isRemote ? existing.id : lead.isRemote ? lead.id : existing.id,
      rawId: existing.isRemote ? existing.rawId : lead.isRemote ? lead.rawId : existing.rawId || lead.rawId,
      isRemote: existing.isRemote || lead.isRemote,
      sourceLabel: existing.sourceLabel === lead.sourceLabel ? existing.sourceLabel : `${existing.sourceLabel}, ${lead.sourceLabel}`,
    });
  });
  return Array.from(map.values());
}

function localLeads() {
  const teachers = readJson(LOCAL_STORE_KEYS.teachers).map((row) => normalizeLead(row, LOCAL_STORE_KEYS.teachers, "teacher"));
  const marketplace = readJson(LOCAL_STORE_KEYS.marketplace).map((row) => normalizeLead(row, LOCAL_STORE_KEYS.marketplace));
  const requests = readJson(LOCAL_STORE_KEYS.requests).map((row) => normalizeLead(row, LOCAL_STORE_KEYS.requests, "student"));
  const leads = readJson(LOCAL_STORE_KEYS.leads).map((row) => normalizeLead(row, LOCAL_STORE_KEYS.leads));
  return mergeLeads([...teachers, ...marketplace, ...requests, ...leads]);
}

function authHeaders(extra = {}) {
  const token = adminSession?.access_token || SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured");
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.error || `HTTP ${response.status}`);
  return payload;
}

async function loadRemoteLeads() {
  if (!adminSession?.access_token) return [];
  const rows = await supabaseFetch(
    "/rest/v1/ic_educate_leads?select=*&order=created_at.desc&limit=200",
    { method: "GET" }
  );
  return Array.isArray(rows) ? rows.map((row) => normalizeLead(row, "supabase")) : [];
}

async function signIn(email, password) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured");
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.msg || payload?.message || payload?.error_description || "Sign in failed");
  saveSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    token_type: payload.token_type,
    expires_at: Date.now() + Math.max(0, Number(payload.expires_in || 3600) - 60) * 1000,
    user: payload.user || null,
  });
}

async function updateRemoteStatus(lead, status) {
  if (!lead.isRemote || !isUuid(lead.rawId || lead.id) || !adminSession?.access_token) return;
  await supabaseFetch(`/rest/v1/ic_educate_leads?id=eq.${encodeURIComponent(lead.rawId || lead.id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ status }),
  });
}

function updateLocalStatus(lead, status) {
  Object.values(LOCAL_STORE_KEYS).forEach((key) => {
    const rows = readJson(key);
    let changed = false;
    const next = rows.map((row) => {
      const normalized = normalizeLead(row, key);
      if (normalized.id === lead.id || leadKey(normalized) === leadKey(lead)) {
        changed = true;
        return { ...row, status, updatedAt: new Date().toISOString() };
      }
      return row;
    });
    if (changed) writeJson(key, next);
  });
}

function matchScore(primary, candidate) {
  let score = 0;
  const reasons = [];
  const primarySubject = `${primary.subject} ${primary.topic}`;
  const candidateSubject = `${candidate.subject} ${candidate.topic} ${candidate.note}`;

  if (primary.market === candidate.market) {
    score += 18;
    reasons.push(routeLabel(primary.market));
  }
  if (textOverlap(primary.subject, candidateSubject)) {
    score += 34;
    reasons.push("Subject fit");
  }
  if (primary.topic && textOverlap(primary.topic, candidateSubject)) {
    score += 16;
    reasons.push("Topic fit");
  }
  if (primary.level && textOverlap(primary.level, candidate.level)) {
    score += 16;
    reasons.push("Syllabus/level fit");
  }
  if (primary.area && textOverlap(primary.area, candidate.area)) {
    score += 14;
    reasons.push("Close area");
  }
  if (primary.mode === "both" || candidate.mode === "both" || primary.mode === candidate.mode) {
    score += 12;
    reasons.push("Lesson type fit");
  }
  if (primary.preferredTime && textOverlap(primary.preferredTime, candidate.preferredTime)) {
    score += 8;
    reasons.push("Timing fit");
  }
  if (candidate.rating) score += Math.min(20, Math.round(candidate.rating * 4));
  if (candidate.status === "new" || candidate.status === "contacted") score += 4;
  if (!score && textOverlap(primarySubject, candidateSubject)) score += 12;

  return { score, reasons: reasons.slice(0, 4) };
}

function textOverlap(left = "", right = "") {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const tokens = a.split(/[^a-z0-9]+/).filter((token) => token.length > 2);
  return tokens.some((token) => b.includes(token));
}

function matchingPool(lead) {
  const targetType = lead.type === "teacher" ? "student" : "teacher";
  return allLeads
    .filter((item) => item.id !== lead.id && (targetType === "student" ? item.type !== "teacher" : item.type === "teacher"))
    .map((item) => ({ lead: item, ...matchScore(lead, item) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.lead.createdAt || 0) - new Date(a.lead.createdAt || 0))
    .slice(0, 5);
}

function buildWhatsAppMessage(lead) {
  if (lead.type === "teacher") {
    return [
      `Hi ${lead.name || ""}, thanks for joining IC Educate.`,
      "Please send your photo, syllabus, subjects, free times, area, fee, and whether you prefer online or physical lessons.",
      lead.subject ? `Subjects: ${lead.subject}` : "",
      lead.level ? `Syllabus/level: ${lead.level}` : "",
      lead.area ? `Area: ${lead.area}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `Hi ${lead.name || ""}, I have tutor matches for your ${lead.subject || "request"}.`,
    "Can you confirm syllabus, area, preferred time, and online/physical preference?",
    lead.topic ? `Topic: ${lead.topic}` : "",
    lead.level ? `Level: ${lead.level}` : "",
    lead.area ? `Area: ${lead.area}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildInternalBrief(lead) {
  return [
    `${lead.type === "teacher" ? "Teacher lead" : "Student request"} - ${routeLabel(lead.market)}`,
    `Name: ${lead.name || "-"}`,
    `Phone: ${lead.phone || "-"}`,
    `Subject: ${lead.subject || "-"}`,
    `Topic: ${lead.topic || "-"}`,
    `Level/syllabus: ${lead.level || "-"}`,
    `Area: ${lead.area || "-"}`,
    `Mode: ${lead.mode || "-"}`,
    `Preferred time: ${lead.preferredTime || "-"}`,
    `Budget/fee: ${lead.budget || "-"}`,
    `Status: ${lead.status}`,
    `Source: ${lead.sourceLabel}`,
    `Note: ${lead.note || "-"}`,
  ].join("\n");
}

async function copyText(value) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function filteredLeads() {
  const market = adminMarketFilter?.value || "all";
  const type = adminTypeFilter?.value || "all";
  const status = adminStatusFilter?.value || "all";
  const query = normalizeText(adminSearchFilter?.value || "");

  return allLeads
    .filter((lead) => market === "all" || lead.market === market)
    .filter((lead) => type === "all" || lead.type === type)
    .filter((lead) => status === "all" || lead.status === status)
    .filter((lead) => {
      if (!query) return true;
      return normalizeText(
        [lead.name, lead.email, lead.phone, lead.subject, lead.topic, lead.level, lead.area, lead.note, lead.sourceLabel].join(" ")
      ).includes(query);
    })
    .sort(
      (a, b) =>
        (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99) ||
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
}

function renderStats() {
  const counts = {
    all: allLeads.length,
    teacher: allLeads.filter((lead) => lead.type === "teacher").length,
    student: allLeads.filter((lead) => lead.type !== "teacher").length,
    new: allLeads.filter((lead) => lead.status === "new").length,
    contacted: allLeads.filter((lead) => lead.status === "contacted").length,
    matched: allLeads.filter((lead) => lead.status === "matched").length,
    closed: allLeads.filter((lead) => lead.status === "closed").length,
    malaysia: allLeads.filter((lead) => lead.market === "malaysia").length,
    hongkong: allLeads.filter((lead) => lead.market === "hongkong").length,
  };
  const items = [
    ["All leads", counts.all],
    ["Teachers", counts.teacher],
    ["Students", counts.student],
    ["New", counts.new],
    ["Contacted", counts.contacted],
    ["Matched", counts.matched],
    ["Closed", counts.closed],
    ["Malaysia", counts.malaysia],
    ["Hong Kong", counts.hongkong],
  ];
  adminStats.innerHTML = items
    .map(
      ([label, count]) => `
        <article class="admin-stat-card">
          <strong>${count}</strong>
          <span>${escapeHtml(label)}</span>
        </article>
      `
    )
    .join("");
  adminLeadCount.textContent = `${counts.all} lead${counts.all === 1 ? "" : "s"}`;
}

function renderLeadCard(lead) {
  const phone = normalizePhone(lead.phone) || routePhone(lead.market);
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(lead))}`;
  const selected = selectedLeadId === lead.id;
  const meta = [
    routeLabel(lead.market),
    lead.type === "teacher" ? "Teacher" : "Student",
    lead.subject || "Any subject",
    lead.area || "Any area",
    lead.mode || "Any mode",
  ];

  return `
    <article class="admin-lead-card ${selected ? "selected" : ""}" data-lead-id="${escapeHtml(lead.id)}">
      <div class="admin-card-head">
        <div>
          <span class="tag">${escapeHtml(lead.sourceLabel)}</span>
          <h3>${escapeHtml(lead.name || "Unnamed lead")}</h3>
          <p class="hint">${escapeHtml(lead.phone || lead.email || "No direct contact saved yet")}</p>
        </div>
        <span class="chip status-${escapeHtml(lead.status)}">${escapeHtml(lead.status)}</span>
      </div>
      <div class="result-links">
        ${meta.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
      </div>
      <p class="teacher-note">${escapeHtml(lead.topic || lead.level || lead.preferredTime || lead.note || "No extra note yet.")}</p>
      <div class="admin-card-actions">
        <a class="chip ghost" href="${waUrl}" target="_blank" rel="noreferrer">WhatsApp</a>
        <button type="button" class="secondary-btn" data-copy-brief="${escapeHtml(lead.id)}">Copy brief</button>
        ${statuses
          .map(
            (status) =>
              `<button type="button" class="admin-status-btn ${lead.status === status ? "active" : ""}" data-status="${status}" data-lead-id="${escapeHtml(
                lead.id
              )}">${status}</button>`
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderMatchPanel(lead) {
  if (!lead) {
    adminMatchPanel.innerHTML = `
      <span class="tag">Match view</span>
      <h3>Select a lead</h3>
      <p class="hint">Pick a student request to see teacher matches, or pick a teacher to see relevant student jobs.</p>
    `;
    return;
  }
  const matches = matchingPool(lead);
  const targetLabel = lead.type === "teacher" ? "student jobs" : "teacher matches";
  adminMatchPanel.innerHTML = `
    <span class="tag">${escapeHtml(targetLabel)}</span>
    <h3>${escapeHtml(lead.name || "Selected lead")}</h3>
    <p class="hint">${escapeHtml([lead.subject, lead.level, lead.area].filter(Boolean).join(" - ") || "No lead details yet.")}</p>
    <div class="admin-match-list">
      ${
        matches.length
          ? matches
              .map(
                (match, index) => `
                  <article class="admin-match-card">
                    <div class="admin-match-rank">#${index + 1}</div>
                    <div>
                      <strong>${escapeHtml(match.lead.name || "Unnamed")}</strong>
                      <p class="hint">${escapeHtml([match.lead.subject, match.lead.level, match.lead.area].filter(Boolean).join(" - "))}</p>
                      <div class="result-links">
                        <span class="chip">${Math.round(match.score)} score</span>
                        ${match.reasons.map((reason) => `<span class="chip">${escapeHtml(reason)}</span>`).join("")}
                      </div>
                    </div>
                  </article>
                `
              )
              .join("")
          : `<p class="muted">No matches yet. Recruit more ${lead.type === "teacher" ? "student requests" : "teachers"} in this market.</p>`
      }
    </div>
  `;
}

function renderQueue() {
  const visible = filteredLeads();
  adminVisibleCount.textContent = `${visible.length} visible`;
  adminLeadList.innerHTML = visible.length
    ? visible.map(renderLeadCard).join("")
    : `<article class="admin-empty"><h3>No leads match this filter.</h3><p class="hint">Clear the search or open the teacher/student funnels to create a lead.</p></article>`;
  const selected = visible.find((lead) => lead.id === selectedLeadId) || visible[0] || null;
  selectedLeadId = selected?.id || "";
  renderMatchPanel(selected);
  renderStats();
}

function setBackendStatus(message, mode = "warn") {
  adminBackendStatus.textContent = message;
  adminBackendStatus.classList.remove("online", "offline", "warn");
  adminBackendStatus.classList.add(mode);
}

async function refreshQueue() {
  refreshAdminBtn.disabled = true;
  allLeads = localLeads();
  try {
    const remote = await loadRemoteLeads();
    if (remote.length) {
      allLeads = mergeLeads([...remote, ...allLeads]);
      setBackendStatus(`Shared queue synced (${remote.length})`, "online");
    } else if (adminSession?.access_token) {
      setBackendStatus("Signed in; no shared leads yet", "online");
    } else {
      setBackendStatus("Local queue ready", "warn");
    }
  } catch (error) {
    setBackendStatus(`Local only: ${error.message}`, "offline");
  } finally {
    adminUpdatedAt.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    refreshAdminBtn.disabled = false;
    renderQueue();
  }
}

async function setLeadStatus(leadId, status) {
  const lead = allLeads.find((item) => item.id === leadId);
  if (!lead) return;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  updateLocalStatus(lead, status);
  try {
    await updateRemoteStatus(lead, status);
    setBackendStatus("Status synced", "online");
  } catch (error) {
    setBackendStatus(`Status saved locally: ${error.message}`, "warn");
  }
  renderQueue();
}

adminLoginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = adminEmail.value.trim();
  const password = adminPassword.value;
  if (!email || !password) {
    setBackendStatus("Add admin email and password", "warn");
    return;
  }
  try {
    await signIn(email, password);
    adminPassword.value = "";
    setBackendStatus("Signed in", "online");
    await refreshQueue();
  } catch (error) {
    setBackendStatus(`Sign in failed: ${error.message}`, "offline");
  }
});

adminSignOutBtn?.addEventListener("click", () => {
  saveSession(null);
  setBackendStatus("Signed out; local queue ready", "warn");
  refreshQueue();
});

refreshAdminBtn?.addEventListener("click", refreshQueue);

[adminMarketFilter, adminTypeFilter, adminStatusFilter, adminSearchFilter].forEach((input) => {
  input?.addEventListener("input", renderQueue);
  input?.addEventListener("change", renderQueue);
});

adminLeadList?.addEventListener("click", async (event) => {
  const statusButton = event.target.closest("[data-status]");
  const copyButton = event.target.closest("[data-copy-brief]");
  const card = event.target.closest("[data-lead-id]");

  if (statusButton) {
    await setLeadStatus(statusButton.dataset.leadId, statusButton.dataset.status);
    return;
  }
  if (copyButton) {
    const lead = allLeads.find((item) => item.id === copyButton.dataset.copyBrief);
    if (!lead) return;
    await copyText(buildInternalBrief(lead));
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy brief";
    }, 1200);
    return;
  }
  if (card) {
    selectedLeadId = card.dataset.leadId;
    renderQueue();
  }
});

if (adminSession?.user?.email && adminEmail) adminEmail.value = adminSession.user.email;
refreshQueue();

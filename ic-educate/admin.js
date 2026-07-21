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
const adminTeacherQueueStatus = document.getElementById("adminTeacherQueueStatus");
const adminTeacherVisibleCount = document.getElementById("adminTeacherVisibleCount");
const adminTeacherStats = document.getElementById("adminTeacherStats");
const adminTeacherQueue = document.getElementById("adminTeacherQueue");

const routePhone = (market = "malaysia") => (market === "hongkong" ? "85255115251" : "60178265300");
const routeLabel = (market = "malaysia") => (market === "hongkong" ? "Hong Kong" : "Malaysia");
const statusOrder = { new: 0, contacted: 1, matched: 2, closed: 3 };
const statuses = ["new", "contacted", "matched", "closed"];
const moderationStatuses = ["pending", "published", "hidden"];
const moderationOrder = { pending: 0, published: 1, hidden: 2 };
const lessonModeLabel = (mode = "") => {
  if (mode === "both") return "Online or physical";
  if (mode === "physical") return "Physical";
  return "Online";
};

let adminSession = loadSession();
let allLeads = [];
let allMessages = [];
let teacherProfiles = [];
let adminAccess = {
  signedIn: Boolean(adminSession?.access_token),
  allowlisted: false,
  email: adminSession?.user?.email || "",
};
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
  if (status === "booked") return "matched";
  return statuses.includes(status) ? status : "new";
}

function normalizeModerationStatus(value = "") {
  const status = normalizeText(value);
  return moderationStatuses.includes(status) ? status : "pending";
}

function formatDateTime(value = "") {
  if (!value) return "Not saved yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function moderationStateLabel(status = "pending") {
  if (status === "published") return "Reviewed · Published";
  if (status === "hidden") return "Reviewed · Hidden";
  return "Pending review";
}

function normalizeLead(row = {}, sourceKey = "local", forcedType = "") {
  const type = forcedType || inferType(row, sourceKey);
  const name = row.name || row.studentName || row.parentName || row.teacherName || "";
  const subject = row.subject || row.subjects || "";
  const topic = row.topic || row.topics || "";
  const syllabus = row.syllabus || "";
  const level = [syllabus, row.level || row.grade || ""].filter(Boolean).join(" - ");
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
    selectedTutorName: row.selected_tutor_name || row.selectedTutorName || "",
    bookingDay: row.booking_day || row.bookingDay || "",
    bookingSlot: row.booking_slot || row.bookingSlot || "",
    bookingMode: row.booking_mode || row.bookingMode || "",
    bookingVenue: row.booking_venue || row.bookingVenue || "",
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

function normalizeTeacherProfile(row = {}) {
  return {
    id: String(row.id || row.submission_id || ""),
    rawId: row.id || "",
    submissionId: row.submission_id || "",
    displayName: row.display_name || "Teacher profile",
    market: row.market || "malaysia",
    subjects: Array.isArray(row.subjects) ? row.subjects.filter(Boolean) : [],
    syllabuses: Array.isArray(row.syllabuses) ? row.syllabuses.filter(Boolean) : [],
    levels: Array.isArray(row.levels) ? row.levels.filter(Boolean) : [],
    experienceYears: Number(row.experience_years || 0),
    qualifications: row.qualifications || "",
    languages: Array.isArray(row.languages) ? row.languages.filter(Boolean) : [],
    area: row.area || "",
    lessonModes: Array.isArray(row.lesson_modes) ? row.lesson_modes.filter(Boolean) : [],
    availability: Array.isArray(row.availability) ? row.availability.filter(Boolean) : [],
    feeLabel: row.fee_label || "",
    bio: row.bio || "",
    status: normalizeModerationStatus(row.status),
    reviewNote: row.review_note || "",
    reviewedBy: row.reviewed_by || "",
    reviewedAt: row.reviewed_at || "",
    publishedAt: row.published_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    original: row,
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

async function loadRemoteMessages() {
  if (!adminSession?.access_token) return [];
  const rows = await supabaseFetch(
    "/rest/v1/ic_educate_marketplace_messages?select=*&order=created_at.asc&limit=500",
    { method: "GET" }
  );
  return Array.isArray(rows) ? rows : [];
}

async function loadAdminAccess() {
  if (!adminSession?.access_token) return false;
  const allowed = await supabaseFetch("/rest/v1/rpc/is_ic_educate_admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return Boolean(allowed);
}

async function loadRemoteTeacherProfiles() {
  if (!adminSession?.access_token) return [];
  const columns = [
    "id",
    "submission_id",
    "display_name",
    "market",
    "subjects",
    "syllabuses",
    "levels",
    "experience_years",
    "qualifications",
    "languages",
    "area",
    "lesson_modes",
    "availability",
    "fee_label",
    "bio",
    "status",
    "review_note",
    "reviewed_by",
    "reviewed_at",
    "published_at",
    "created_at",
    "updated_at",
  ].join(",");
  const rows = await supabaseFetch(
    `/rest/v1/ic_educate_teacher_profiles?select=${encodeURIComponent(columns)}&order=updated_at.desc&limit=200`,
    { method: "GET" }
  );
  return Array.isArray(rows) ? rows.map((row) => normalizeTeacherProfile(row)) : [];
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

async function updateTeacherProfileStatus(profileId, status) {
  const profile = teacherProfiles.find((item) => item.id === profileId);
  if (!profile || !profile.rawId || !adminSession?.access_token) return;
  const noteField = Array.from(adminTeacherQueue?.querySelectorAll("[data-teacher-profile-note]") || []).find(
    (field) => field.dataset.teacherProfileNote === profileId
  );
  const reviewNote = noteField?.value.trim() || "";
  const reviewer = adminSession?.user?.email || "IC Educate admin";
  await supabaseFetch(`/rest/v1/ic_educate_teacher_profiles?id=eq.${encodeURIComponent(profile.rawId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status,
      review_note: reviewNote || null,
      reviewed_by: reviewer,
      reviewed_at: new Date().toISOString(),
    }),
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
    `Selected tutor: ${lead.selectedTutorName || "-"}`,
    `Booking: ${[lead.bookingDay, lead.bookingSlot].filter(Boolean).join(" ") || "-"}`,
    `Booking mode: ${lead.bookingMode || "-"}`,
    `Booking venue/link: ${lead.bookingVenue || "-"}`,
    `Status: ${lead.status}`,
    `Source: ${lead.sourceLabel}`,
    `Note: ${lead.note || "-"}`,
  ].join("\n");
}

function buildMatchAlertMessage(sourceLead, targetLead) {
  if (sourceLead.type === "teacher") {
    return [
      `Hi ${targetLead.name || ""}, I have a teacher profile that may fit your request.`,
      `Teacher: ${sourceLead.name || "-"}`,
      sourceLead.subject ? `Subjects: ${sourceLead.subject}` : "",
      sourceLead.level ? `Syllabus/level: ${sourceLead.level}` : "",
      sourceLead.area ? `Area: ${sourceLead.area}` : "",
      sourceLead.mode ? `Lesson type: ${lessonModeLabel(sourceLead.mode)}` : "",
      sourceLead.preferredTime ? `Availability: ${sourceLead.preferredTime}` : "",
      sourceLead.note ? `Teacher note: ${sourceLead.note}` : "",
      "Reply if you want the full intro and next step.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `Hi ${targetLead.name || ""}, IC Educate has a new student request that may fit you.`,
    sourceLead.subject ? `Subject: ${sourceLead.subject}` : "",
    sourceLead.topic ? `Topic: ${sourceLead.topic}` : "",
    sourceLead.level ? `Syllabus/level: ${sourceLead.level}` : "",
    sourceLead.area ? `Area: ${sourceLead.area}` : "",
    sourceLead.mode ? `Lesson type: ${lessonModeLabel(sourceLead.mode)}` : "",
    sourceLead.preferredTime ? `Preferred time: ${sourceLead.preferredTime}` : "",
    sourceLead.budget ? `Budget: ${sourceLead.budget}` : "",
    sourceLead.note ? `Parent note: ${sourceLead.note}` : "",
    "Reply if you want this lead and confirm your latest availability.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMatchPack(lead, matches) {
  if (!matches.length) return "No matches yet.";
  const title = lead.type === "teacher" ? "Student shortlist" : "Teacher alert pack";
  return [
    `${title} - ${lead.name || "Selected lead"}`,
    ...matches.slice(0, 3).flatMap((match, index) => [
      "",
      `Match ${index + 1}: ${match.lead.name || "Unnamed"}`,
      buildMatchAlertMessage(lead, match.lead),
    ]),
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

function renderTeacherModeration() {
  if (!adminTeacherQueue || !adminTeacherStats || !adminTeacherVisibleCount || !adminTeacherQueueStatus) return;

  if (!adminSession?.access_token) {
    adminTeacherQueueStatus.textContent = "Sign in to load shared reviews";
    adminTeacherVisibleCount.textContent = "0 profiles";
    adminTeacherStats.innerHTML = "";
    adminTeacherQueue.innerHTML =
      `<article class="admin-empty"><h3>Shared review queue is locked.</h3><p class="hint">Sign in with an allowlisted admin email to review pending teacher profiles.</p></article>`;
    return;
  }

  if (!adminAccess.allowlisted) {
    adminTeacherQueueStatus.textContent = "Allowlist required";
    adminTeacherVisibleCount.textContent = "0 profiles";
    adminTeacherStats.innerHTML = "";
    adminTeacherQueue.innerHTML = `
      <article class="admin-empty">
        <h3>This login is not on the admin allowlist yet.</h3>
        <p class="hint">Add ${escapeHtml(adminAccess.email || "this email")} to <code>public.ic_educate_admin_allowlist</code>, then refresh the queue.</p>
      </article>
    `;
    return;
  }

  const counts = {
    all: teacherProfiles.length,
    pending: teacherProfiles.filter((profile) => profile.status === "pending").length,
    reviewed: teacherProfiles.filter((profile) => profile.status !== "pending").length,
    published: teacherProfiles.filter((profile) => profile.status === "published").length,
    hidden: teacherProfiles.filter((profile) => profile.status === "hidden").length,
  };

  adminTeacherQueueStatus.textContent = counts.pending ? "Pending reviews first" : "All reviews cleared";
  adminTeacherVisibleCount.textContent = `${counts.all} profile${counts.all === 1 ? "" : "s"}`;
  adminTeacherStats.innerHTML = [
    ["Pending", counts.pending],
    ["Reviewed", counts.reviewed],
    ["Published", counts.published],
    ["Hidden", counts.hidden],
  ]
    .map(([label, count]) => `<span class="chip">${count} ${escapeHtml(label)}</span>`)
    .join("");

  const sortedProfiles = teacherProfiles
    .slice()
    .sort(
      (a, b) =>
        (moderationOrder[a.status] ?? 99) - (moderationOrder[b.status] ?? 99) ||
        new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
    );

  adminTeacherQueue.innerHTML = sortedProfiles.length
    ? sortedProfiles.map(renderTeacherProfileCard).join("")
    : `<article class="admin-empty"><h3>No teacher profiles are waiting.</h3><p class="hint">New public teacher submissions will appear here for moderation.</p></article>`;
}

function buildTeacherProfileBrief(profile) {
  return [
    `Teacher profile review - ${routeLabel(profile.market)}`,
    `Teacher: ${profile.displayName}`,
    `Review state: ${moderationStateLabel(profile.status)}`,
    `Subjects: ${profile.subjects.join(", ") || "-"}`,
    `Syllabuses: ${profile.syllabuses.join(", ") || "-"}`,
    `Levels: ${profile.levels.join(", ") || "-"}`,
    `Experience: ${profile.experienceYears || 0} years`,
    `Area: ${profile.area || "-"}`,
    `Lesson modes: ${profile.lessonModes.map(lessonModeLabel).join(", ") || "-"}`,
    `Availability: ${profile.availability.join(", ") || "-"}`,
    `Fee: ${profile.feeLabel || "-"}`,
    `Qualifications: ${profile.qualifications || "-"}`,
    `Languages: ${profile.languages.join(", ") || "-"}`,
    `Bio: ${profile.bio || "-"}`,
    `Review note: ${profile.reviewNote || "-"}`,
    `Reviewed by: ${profile.reviewedBy || "-"}`,
    `Reviewed at: ${profile.reviewedAt ? formatDateTime(profile.reviewedAt) : "-"}`,
    `Submitted: ${formatDateTime(profile.createdAt)}`,
    `Last reviewed: ${formatDateTime(profile.updatedAt)}`,
    `Published at: ${profile.publishedAt ? formatDateTime(profile.publishedAt) : "-"}`,
    `Submission ID: ${profile.submissionId || "-"}`,
  ].join("\n");
}

function renderTeacherProfileCard(profile) {
  const summaryBits = [
    profile.subjects.join(", "),
    profile.levels.join(", "),
    profile.area,
    profile.lessonModes.map(lessonModeLabel).join(", "),
    profile.feeLabel,
  ].filter(Boolean);

  return `
    <article class="admin-lead-card" data-teacher-profile-id="${escapeHtml(profile.id)}">
      <div class="admin-card-head">
        <div>
          <span class="tag">Teacher moderation · ${escapeHtml(moderationStateLabel(profile.status))}</span>
          <h3>${escapeHtml(profile.displayName)}</h3>
          <p class="hint">Submitted ${escapeHtml(formatDateTime(profile.createdAt))} · ${escapeHtml(routeLabel(profile.market))}</p>
        </div>
        <span class="chip status-${escapeHtml(profile.status)}">${escapeHtml(profile.status)}</span>
      </div>
      <div class="result-links">
        ${summaryBits.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
      </div>
      <p class="teacher-note">${escapeHtml(profile.bio || profile.qualifications || "No extra teacher note yet.")}</p>
      <label class="admin-review-note">
        <span>Review note for teacher</span>
        <textarea
          rows="3"
          maxlength="1200"
          data-teacher-profile-note="${escapeHtml(profile.id)}"
          placeholder="Explain what needs to change before this profile goes live."
        >${escapeHtml(profile.reviewNote || "")}</textarea>
      </label>
      <p class="hint">${
        profile.status === "pending"
          ? "Pending review. The tutor finder stays hidden until an allowlisted admin publishes or hides this profile."
          : `Reviewed ${escapeHtml(formatDateTime(profile.updatedAt))}.`
      }</p>
      ${
        profile.reviewedBy || profile.reviewedAt
          ? `<p class="hint">Last review owner: ${escapeHtml(profile.reviewedBy || "IC Educate admin")}${profile.reviewedAt ? ` · ${escapeHtml(formatDateTime(profile.reviewedAt))}` : ""}</p>`
          : ""
      }
      <div class="admin-card-actions">
        <button type="button" class="secondary-btn" data-copy-teacher-profile="${escapeHtml(profile.id)}">Copy review brief</button>
        <button type="button" class="secondary-btn" data-save-teacher-profile-note="${escapeHtml(profile.id)}">Save note</button>
        <button type="button" class="admin-status-btn ${profile.status === "published" ? "status-btn-published" : ""}" data-teacher-profile-status="published" data-teacher-profile-id="${escapeHtml(profile.id)}">Publish</button>
        <button type="button" class="admin-status-btn ${profile.status === "hidden" ? "status-btn-hidden" : ""}" data-teacher-profile-status="hidden" data-teacher-profile-id="${escapeHtml(profile.id)}">Send back</button>
      </div>
    </article>
  `;
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
    lead.selectedTutorName || "No tutor selected",
    [lead.bookingDay, lead.bookingSlot].filter(Boolean).join(" ") || "No slot yet",
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
      <p class="teacher-note">${escapeHtml(
        [lead.topic, lead.level, lead.preferredTime, lead.bookingVenue, lead.note].filter(Boolean).join(" · ") || "No extra note yet."
      )}</p>
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
  const messages = allMessages.filter((message) => String(message.request_id) === String(lead.rawId || lead.id));
  const targetLabel = lead.type === "teacher" ? "student jobs" : "teacher matches";
  const topMatches = matches.slice(0, 3);
  adminMatchPanel.innerHTML = `
    <span class="tag">${escapeHtml(targetLabel)}</span>
    <h3>${escapeHtml(lead.name || "Selected lead")}</h3>
    <p class="hint">${escapeHtml([lead.subject, lead.level, lead.area].filter(Boolean).join(" - ") || "No lead details yet.")}</p>
    <div class="button-row admin-match-actions">
      <button type="button" class="secondary-btn" data-copy-selected-brief="${escapeHtml(lead.id)}">Copy brief</button>
      <button type="button" class="secondary-btn" data-copy-match-pack="${escapeHtml(lead.id)}">Copy top ${lead.type === "teacher" ? "student" : "teacher"} alerts</button>
      ${lead.status !== "matched" ? `<button type="button" class="secondary-btn" data-mark-selected="matched" data-lead-id="${escapeHtml(lead.id)}">Mark matched</button>` : ""}
    </div>
    ${
      lead.isRemote && lead.type !== "teacher" && lead.original?.user_id
        ? `<section class="admin-message-thread">
            <div class="panel-heading"><div><span class="tag">Inbox</span><h3>Request messages</h3></div></div>
            <div class="admin-message-stack">
              ${
                messages.length
                  ? messages
                      .map(
                        (message) => `<article class="inbox-bubble ${message.sender_role === "operator" ? "operator" : ""}">
                          <strong>${escapeHtml(message.sender_role === "operator" ? "IC Educate" : message.sender_role)}</strong>
                          <p>${escapeHtml(message.body || "")}</p>
                          <span>${escapeHtml(new Date(message.created_at).toLocaleString())}</span>
                        </article>`
                      )
                      .join("")
                  : `<p class="hint">No messages on this request yet.</p>`
              }
            </div>
            <form id="adminMessageReplyForm" class="inbox-compose-form" data-request-id="${escapeHtml(lead.rawId || "")}" data-user-id="${escapeHtml(
              lead.original?.user_id || ""
            )}">
              <input name="message" type="text" maxlength="4000" placeholder="Reply to student or parent" required />
              <button type="submit">Send</button>
            </form>
          </section>`
        : ""
    }
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
                      <div class="admin-card-actions">
                        ${
                          normalizePhone(match.lead.phone)
                            ? `<a class="chip ghost" href="https://wa.me/${normalizePhone(match.lead.phone)}?text=${encodeURIComponent(
                                buildMatchAlertMessage(lead, match.lead)
                              )}" target="_blank" rel="noreferrer">${lead.type === "teacher" ? "Message student" : "Alert teacher"}</a>`
                            : ""
                        }
                        <button type="button" class="secondary-btn" data-copy-match="${escapeHtml(lead.id)}" data-target-lead="${escapeHtml(match.lead.id)}">${lead.type === "teacher" ? "Copy student intro" : "Copy teacher alert"}</button>
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
  allMessages = [];
  teacherProfiles = [];
  adminAccess = {
    signedIn: Boolean(adminSession?.access_token),
    allowlisted: false,
    email: adminSession?.user?.email || "",
  };
  try {
    if (adminSession?.access_token) {
      adminAccess.allowlisted = await loadAdminAccess();
      if (adminAccess.allowlisted) {
        const [remote, messages, profiles] = await Promise.all([
          loadRemoteLeads(),
          loadRemoteMessages(),
          loadRemoteTeacherProfiles(),
        ]);
        allMessages = messages;
        teacherProfiles = profiles;
        if (remote.length) {
          allLeads = mergeLeads([...remote, ...allLeads]);
        }
        setBackendStatus(
          `Shared queue synced (${remote.length} leads, ${profiles.length} teacher profiles)`,
          "online"
        );
      } else {
        setBackendStatus("Signed in, but this email is not on the IC Educate admin allowlist yet", "warn");
      }
    } else {
      setBackendStatus("Local queue ready", "warn");
    }
  } catch (error) {
    setBackendStatus(`Local only: ${error.message}`, "offline");
  } finally {
    adminUpdatedAt.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    refreshAdminBtn.disabled = false;
    renderQueue();
    renderTeacherModeration();
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

async function setTeacherReviewStatus(profileId, status) {
  const profile = teacherProfiles.find((item) => item.id === profileId);
  if (!profile || !moderationStatuses.includes(status)) return;
  const previousStatus = profile.status;
  const previousPublishedAt = profile.publishedAt;
  const previousReviewNote = profile.reviewNote;
  const previousReviewedBy = profile.reviewedBy;
  const previousReviewedAt = profile.reviewedAt;
  const noteField = Array.from(adminTeacherQueue?.querySelectorAll("[data-teacher-profile-note]") || []).find(
    (field) => field.dataset.teacherProfileNote === profileId
  );
  const reviewNote = noteField?.value.trim() || "";
  const reviewer = adminSession?.user?.email || "IC Educate admin";
  profile.status = status;
  profile.reviewNote = reviewNote;
  profile.reviewedBy = reviewer;
  profile.reviewedAt = new Date().toISOString();
  profile.updatedAt = new Date().toISOString();
  if (status !== "published") profile.publishedAt = "";
  try {
    await updateTeacherProfileStatus(profileId, status);
    setBackendStatus(`Teacher profile ${status}`, "online");
    await refreshQueue();
  } catch (error) {
    profile.status = previousStatus;
    profile.publishedAt = previousPublishedAt;
    profile.reviewNote = previousReviewNote;
    profile.reviewedBy = previousReviewedBy;
    profile.reviewedAt = previousReviewedAt;
    setBackendStatus(`Teacher review not saved: ${error.message}`, "offline");
    renderTeacherModeration();
  }
}

async function saveTeacherReviewNote(profileId) {
  const profile = teacherProfiles.find((item) => item.id === profileId);
  if (!profile || !profile.rawId || !adminSession?.access_token) return;

  const noteField = Array.from(adminTeacherQueue?.querySelectorAll("[data-teacher-profile-note]") || []).find(
    (field) => field.dataset.teacherProfileNote === profileId
  );
  const reviewNote = noteField?.value.trim() || "";
  const previousReviewNote = profile.reviewNote;
  const previousReviewedBy = profile.reviewedBy;
  const previousReviewedAt = profile.reviewedAt;
  profile.reviewNote = reviewNote;
  profile.reviewedBy = adminSession?.user?.email || "IC Educate admin";
  profile.reviewedAt = new Date().toISOString();

  try {
    await supabaseFetch(`/rest/v1/ic_educate_teacher_profiles?id=eq.${encodeURIComponent(profile.rawId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        review_note: reviewNote || null,
        reviewed_by: profile.reviewedBy,
        reviewed_at: profile.reviewedAt,
      }),
    });
    setBackendStatus("Teacher review note saved", "online");
    await refreshQueue();
  } catch (error) {
    profile.reviewNote = previousReviewNote;
    profile.reviewedBy = previousReviewedBy;
    profile.reviewedAt = previousReviewedAt;
    setBackendStatus(`Teacher note not saved: ${error.message}`, "offline");
    renderTeacherModeration();
  }
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

adminTeacherQueue?.addEventListener("click", async (event) => {
  const reviewButton = event.target.closest("[data-teacher-profile-status]");
  const copyButton = event.target.closest("[data-copy-teacher-profile]");
  const saveNoteButton = event.target.closest("[data-save-teacher-profile-note]");

  if (reviewButton) {
    await setTeacherReviewStatus(reviewButton.dataset.teacherProfileId, reviewButton.dataset.teacherProfileStatus);
    return;
  }

  if (saveNoteButton) {
    await saveTeacherReviewNote(saveNoteButton.dataset.saveTeacherProfileNote);
    return;
  }

  if (copyButton) {
    const profile = teacherProfiles.find((item) => item.id === copyButton.dataset.copyTeacherProfile);
    if (!profile) return;
    await copyText(buildTeacherProfileBrief(profile));
    setBackendStatus("Teacher review brief copied", "online");
  }
});

adminMatchPanel?.addEventListener("click", async (event) => {
  const copySelectedButton = event.target.closest("[data-copy-selected-brief]");
  const copyMatchButton = event.target.closest("[data-copy-match]");
  const copyPackButton = event.target.closest("[data-copy-match-pack]");
  const markSelectedButton = event.target.closest("[data-mark-selected]");

  if (copySelectedButton) {
    const lead = allLeads.find((item) => item.id === copySelectedButton.dataset.copySelectedBrief);
    if (!lead) return;
    await copyText(buildInternalBrief(lead));
    setBackendStatus("Brief copied", "online");
    return;
  }

  if (copyMatchButton) {
    const lead = allLeads.find((item) => item.id === copyMatchButton.dataset.copyMatch);
    const targetLead = allLeads.find((item) => item.id === copyMatchButton.dataset.targetLead);
    if (!lead || !targetLead) return;
    await copyText(buildMatchAlertMessage(lead, targetLead));
    setBackendStatus("Match alert copied", "online");
    return;
  }

  if (copyPackButton) {
    const lead = allLeads.find((item) => item.id === copyPackButton.dataset.copyMatchPack);
    if (!lead) return;
    await copyText(buildMatchPack(lead, matchingPool(lead)));
    setBackendStatus("Top alerts copied", "online");
    return;
  }

  if (markSelectedButton) {
    await setLeadStatus(markSelectedButton.dataset.leadId, markSelectedButton.dataset.markSelected);
  }
});

adminMatchPanel?.addEventListener("submit", async (event) => {
  const form = event.target.closest("#adminMessageReplyForm");
  if (!form) return;
  event.preventDefault();
  const body = form.elements.message?.value.trim() || "";
  const requestId = form.dataset.requestId || "";
  const userId = form.dataset.userId || "";
  if (!body || !requestId || !userId || !adminSession?.access_token) return;
  try {
    await supabaseFetch("/rest/v1/ic_educate_marketplace_messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify([{ user_id: userId, request_id: requestId, sender_role: "operator", body }]),
    });
    setBackendStatus("Reply sent", "online");
    await refreshQueue();
  } catch (error) {
    setBackendStatus(`Reply failed: ${error.message}`, "offline");
  }
});

if (adminSession?.user?.email && adminEmail) adminEmail.value = adminSession.user.email;
refreshQueue();

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const defaultApiBase = (() => {
  if (window.IC_EDUCATE_API_BASE) return window.IC_EDUCATE_API_BASE;
  if (window.location.protocol.startsWith("http")) return window.location.origin;
  return "";
})();

const API_BASE = defaultApiBase.replace(/\/$/, "");
const LEAD_ENDPOINT = window.IC_EDUCATE_LEAD_ENDPOINT || "";
const PAPER_REQUEST_ENDPOINT = window.IC_EDUCATE_PAPER_REQUEST_ENDPOINT || "";
const SUPABASE_URL = (window.IC_EDUCATE_SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";
const OWNER_EMAILS = new Set(
  (Array.isArray(window.IC_EDUCATE_OWNER_EMAILS) ? window.IC_EDUCATE_OWNER_EMAILS : [])
    .map((email) => String(email || "").trim().toLowerCase())
    .filter(Boolean)
);
const PAPER_PRODUCTS = {
  sample: {
    label: "Sample PDF preview",
    amountCents: 0,
    currency: "MYR",
    checkoutKey: "",
    cadence: "preview",
  },
  single: {
    label: "Single full paper",
    amountCents: 2900,
    currency: "MYR",
    checkoutKey: "ic-educate-single-paper",
    cadence: "one-off",
  },
  bundle: {
    label: "4-paper revision bundle",
    amountCents: 8900,
    currency: "MYR",
    checkoutKey: "ic-educate-revision-bundle",
    cadence: "one-off",
  },
  memory: {
    label: "Monthly mistake-memory plan",
    amountCents: 14900,
    currency: "MYR",
    checkoutKey: "ic-educate-monthly-coach",
    cadence: "monthly",
  },
};
const PAYMENT_STATUS_OPTIONS = ["not_started", "awaiting_payment", "paid", "free", "refunded"];
const GENERATION_STATUS_OPTIONS = ["requested", "brief_ready", "generating", "delivered", "needs_follow_up"];
const SHARED_SYLLABUS_BASE = "../shared-data/syllabuses/";
const STORAGE_KEYS = {
  leads: "icEducateLeads",
  paperRequests: "icEducatePaperRequests",
  mistakes: "icEducateMistakeMemory",
};

const APP_STATE = {
  user: null,
  profile: null,
  worksheets: [],
  questionAttempts: [],
  mistakeEvents: [],
  revisionCards: [],
  cardReviews: [],
  cacheLoaded: false,
  cacheScope: null,
  authenticated: false,
  activeWorksheetRunId: null,
  activeWorksheetClientRunId: null,
  serverOnline: false,
  orders: [],
  ordersLoaded: false,
};

let supabaseClient = null;
let authSession = null;

const studentAppShell = document.getElementById("studentApp");
const authGateEl = document.getElementById("authGate");
const appShellEl = document.getElementById("appShell");
const sessionChipEl = document.getElementById("sessionChip");
const authMessageEl = document.getElementById("authMessage");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const signInEmailInput = document.getElementById("signInEmail");
const signInPasswordInput = document.getElementById("signInPassword");
const signUpNameInput = document.getElementById("signUpName");
const signUpEmailInput = document.getElementById("signUpEmail");
const signUpPasswordInput = document.getElementById("signUpPassword");
const signOutBtn = document.getElementById("signOutBtn");
const refreshStudentDataBtn = document.getElementById("refreshStudentDataBtn");
const generateCardsBtn = document.getElementById("generateCardsBtn");
const clearCacheBtn = document.getElementById("clearCacheBtn");
const profileForm = document.getElementById("profileForm");
const profileDisplayNameInput = document.getElementById("profileDisplayName");
const profileSchoolInput = document.getElementById("profileSchool");
const profileLevelInput = document.getElementById("profileLevel");
const profileTimezoneInput = document.getElementById("profileTimezone");
const profileStatusEl = document.getElementById("profileStatus");
const dashboardDueCountEl = document.getElementById("dashboardDueCount");
const dashboardWeakCountEl = document.getElementById("dashboardWeakCount");
const dashboardErrorCountEl = document.getElementById("dashboardErrorCount");
const dashboardWorksheetCountEl = document.getElementById("dashboardWorksheetCount");
const dashboardWeakTopicsEl = document.getElementById("dashboardWeakTopics");
const dashboardRecentErrorsEl = document.getElementById("dashboardRecentErrors");
const dashboardRecentWorksheetsEl = document.getElementById("dashboardRecentWorksheets");
const reviseDueCardsEl = document.getElementById("reviseDueCards");
const reviseWeakTopicsEl = document.getElementById("reviseWeakTopics");
const reviseRecentErrorsEl = document.getElementById("reviseRecentErrors");
const reviseStatusEl = document.getElementById("reviseStatus");
const reviseSummaryEl = document.getElementById("reviseSummary");
const historyListEl = document.getElementById("historyList");
const historySummaryEl = document.getElementById("historySummary");
const orderSummaryEl = document.getElementById("orderSummary");
const orderListEl = document.getElementById("orderList");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");
const orderAdminStatusEl = document.getElementById("orderAdminStatus");
const appTabButtons = Array.from(document.querySelectorAll("[data-app-tab]"));
const appViews = Array.from(document.querySelectorAll("[data-app-view]"));

const fallbackCatalog = {
  "Cambridge IGCSE": {
    "IGCSE": {
      Physics: ["Motion, Forces and Energy", "Thermal Physics", "Waves", "Electricity", "Chemical Bonding"],
      Chemistry: ["Atomic Structure", "Stoichiometry", "Electrolysis", "Organic Chemistry", "Energy Changes"],
      Biology: ["Cells", "Enzymes", "Ecology", "Genetics", "Photosynthesis"],
      Mathematics: ["Number", "Algebra", "Geometry", "Trigonometry", "Statistics"]
    }
  },
  "HK DSE": {
    "Junior": {
      English: ["Reading", "Writing", "Grammar", "Speaking", "Listening"],
      Chinese: ["Vocabulary", "Reading Comprehension", "Writing", "Classical Chinese", "Grammar"],
      Mathematics: ["Algebra", "Geometry", "Word Problems", "Data Handling", "Trig"]
    }
  }
};

let catalogData = structuredClone(fallbackCatalog);
let backendReachable = false;
let latestLibraryItems = [];

const backendStatus = document.getElementById("backendStatus");
const leadCaptureStatus = document.getElementById("leadCaptureStatus");
const mistakeMemoryStatus = document.getElementById("mistakeMemoryStatus");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
const worksheetForm = document.getElementById("worksheetForm");
const submitBtn = document.getElementById("submitBtn");
const resultEl = document.getElementById("result");
const catalogEl = document.getElementById("catalog");

const syllabusSelect = document.getElementById("syllabus");
const levelSelect = document.getElementById("level");
const topicSelect = document.getElementById("topic");
const subtopicSelect = document.getElementById("subtopic");
const scoreWrap = document.getElementById("scoreWrap");
const markingFields = document.getElementById("markingFields");
const questionCountSelect = document.getElementById("questionCount");
const descriptionInput = document.getElementById("description");
const rubricTextInput = document.getElementById("rubricText");
const tutorImageInput = document.getElementById("tutorImage");
const tutorGoalInput = document.getElementById("tutorGoal");
const tutorLaunchBtn = document.getElementById("tutorLaunchBtn");
const tutorPreviewBtn = document.getElementById("tutorPreviewBtn");
const tutorCopyBtn = document.getElementById("tutorCopyBtn");
const tutorResultEl = document.getElementById("tutorResult");
const leadForm = document.getElementById("leadForm");
const leadEmailInput = document.getElementById("leadEmail");
const leadNameInput = document.getElementById("leadName");
const leadLevelInput = document.getElementById("leadLevel");
const leadSubjectInput = document.getElementById("leadSubject");
const leadStatus = document.getElementById("leadStatus");
const paperRequestForm = document.getElementById("paperRequestForm");
const paperEmailInput = document.getElementById("paperEmail");
const paperLevelInput = document.getElementById("paperLevel");
const paperSubjectInput = document.getElementById("paperSubject");
const paperTopicInput = document.getElementById("paperTopic");
const paperMarksSelect = document.getElementById("paperMarks");
const paperTierSelect = document.getElementById("paperTier");
const paperWeaknessesInput = document.getElementById("paperWeaknesses");
const paperRequestStatus = document.getElementById("paperRequestStatus");
const paperPreviewEl = document.getElementById("paperPreview");
const mistakeForm = document.getElementById("mistakeForm");
const mistakeTopicInput = document.getElementById("mistakeTopic");
const mistakeTypeSelect = document.getElementById("mistakeType");
const mistakeSeveritySelect = document.getElementById("mistakeSeverity");
const mistakeSourceInput = document.getElementById("mistakeSource");
const mistakeNoteInput = document.getElementById("mistakeNote");
const mistakeCountEl = document.getElementById("mistakeCount");
const mistakeSummaryEl = document.getElementById("mistakeSummary");
const mistakeListEl = document.getElementById("mistakeList");
const clearMistakesBtn = document.getElementById("clearMistakesBtn");

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

let currentMode = "create";
let latestTutorPrompt = "";
let latestGeminiUrl = "https://gemini.google.com/app";

const readStorageList = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const writeStorageList = (key, items, limit = 80) => {
  const nextItems = Array.isArray(items) ? items.slice(0, limit) : [];
  localStorage.setItem(key, JSON.stringify(nextItems));
  return nextItems;
};

const postJsonToEndpoint = async (endpoint, payload) => {
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  return body;
};

const supabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const hasLeadCaptureBackend = () => Boolean(supabaseConfigured() || LEAD_ENDPOINT);
const hasPaperRequestBackend = () => Boolean(supabaseConfigured() || PAPER_REQUEST_ENDPOINT);

const getSupabaseClient = () => {
  if (!supabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
  }
  return supabaseClient;
};

const SUPABASE_SESSION_KEY = "icEducateSupabaseSession";
const STUDENT_CACHE_PREFIX = "icEducateStudentCache";

const readJsonStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJsonStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
};

const removeJsonStorage = (key) => {
  localStorage.removeItem(key);
};

const getCachedKey = (suffix = "state") => `${STUDENT_CACHE_PREFIX}:${authSession?.user?.id || "anon"}:${suffix}`;

const getCachedRecords = (suffix, fallback = []) => readJsonStorage(getCachedKey(suffix), fallback);

const setCachedRecords = (suffix, value) => writeJsonStorage(getCachedKey(suffix), value);

const getStoredSession = () => readJsonStorage(SUPABASE_SESSION_KEY, null);

const setStoredSession = (session) => {
  if (!session) {
    removeJsonStorage(SUPABASE_SESSION_KEY);
    return null;
  }
  writeJsonStorage(SUPABASE_SESSION_KEY, session);
  return session;
};

const accessTokenForRequests = () => authSession?.access_token || SUPABASE_ANON_KEY;

const supabaseRequest = async (path, { method = "GET", body, auth = true, prefer, headers = {}, signal } = {}) => {
  if (!supabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    signal,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${auth ? accessTokenForRequests() : SUPABASE_ANON_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");
  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.msg || payload?.message || JSON.stringify(payload);
    throw new Error(message || `Supabase HTTP ${response.status}`);
  }
  return payload;
};

const supabaseAuthRequest = (path, body) => supabaseRequest(path, { method: "POST", body, auth: false });

const supabaseSelect = async (table, { select = "*", filters = [], order = "created_at.desc", limit, auth = true } = {}) => {
  const query = new URLSearchParams();
  query.set("select", select);
  if (order) query.set("order", order);
  if (limit) query.set("limit", String(limit));
  filters.forEach(({ column, op = "eq", value }) => {
    if (value === undefined || value === null || value === "") return;
    query.set(column, `${op}.${value}`);
  });
  return supabaseRequest(`/rest/v1/${table}?${query.toString()}`, { method: "GET", auth });
};

const supabaseInsert = async (table, rows, { auth = true, prefer = "return=representation" } = {}) => {
  const payload = Array.isArray(rows) ? rows : [rows];
  return supabaseRequest(`/rest/v1/${table}`, {
    method: "POST",
    auth,
    body: payload,
    prefer,
  });
};

const supabaseUpsert = async (table, rows, { onConflict, auth = true, prefer = "resolution=merge-duplicates,return=representation" } = {}) => {
  const payload = Array.isArray(rows) ? rows : [rows];
  const conflictPath = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : "";
  return supabaseRequest(`/rest/v1/${table}${conflictPath}`, {
    method: "POST",
    auth,
    body: payload,
    prefer,
  });
};

const insertSupabaseRow = async (table, payload, options = {}) => {
  if (!supabaseConfigured()) return null;
  const nextOptions = { ...options };
  if (nextOptions.auth === false && !nextOptions.prefer) {
    nextOptions.prefer = "return=minimal";
  }
  return supabaseInsert(table, payload, nextOptions);
};

const updateSupabaseRow = async (table, payload, filters, { auth = true } = {}) => {
  if (!supabaseConfigured()) return null;
  const query = new URLSearchParams();
  filters.forEach(({ column, op = "eq", value }) => {
    if (value === undefined || value === null || value === "") return;
    query.set(column, `${op}.${value}`);
  });
  return supabaseRequest(`/rest/v1/${table}?${query.toString()}`, {
    method: "PATCH",
    auth,
    body: payload,
    prefer: "return=representation",
  });
};

const authHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${authSession?.access_token || SUPABASE_ANON_KEY}`,
});

const normalizeArray = (items, fallback = []) => (Array.isArray(items) ? items : fallback);

const cleanText = (value = "") => String(value || "").trim();

const titleCase = (value = "") =>
  cleanText(value)
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const slugify = (value = "") =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";

const makeRevisionCardKey = ({ topic = "", subtopic = "", error_type = "", card_type = "" } = {}) =>
  slugify([topic, subtopic, error_type, card_type].filter(Boolean).join("-"));

const currentStudentId = () => authSession?.user?.id || null;

const currentStudentEmail = () => authSession?.user?.email || leadEmailInput?.value.trim() || "";

const currentProfileName = () =>
  profileDisplayNameInput?.value.trim() ||
  authSession?.user?.user_metadata?.full_name ||
  authSession?.user?.user_metadata?.name ||
  currentStudentEmail().split("@")[0] ||
  "Student";

const normalizeWorkspaceDate = (value) => (value ? new Date(value).toISOString() : new Date().toISOString());

const toLocalDateTime = (value) =>
  new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const productForTier = (tier = "sample") => PAPER_PRODUCTS[tier] || PAPER_PRODUCTS.sample;

const checkoutUrlForProduct = (product = {}) => {
  const links = window.IC_REVENUE_CHECKOUT_LINKS || {};
  return product.checkoutKey ? links[product.checkoutKey] || "" : "";
};

const formatMoney = (amountCents = 0, currency = "MYR", cadence = "") => {
  const amount = Number(amountCents || 0) / 100;
  if (!amount) return "Free";
  try {
    const formatted = new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currency || "MYR",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    return cadence === "monthly" ? `${formatted}/mo` : formatted;
  } catch {
    return `${currency || "MYR"} ${amount.toFixed(amount % 1 === 0 ? 0 : 2)}${cadence === "monthly" ? "/mo" : ""}`;
  }
};

const formatStatusLabel = (value = "") =>
  cleanText(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const isOwnerAccount = () => {
  const email = String(APP_STATE.user?.email || "").trim().toLowerCase();
  return OWNER_EMAILS.has(email);
};

const normalizePaperOrder = (row = {}, source = "local") => {
  const tier = row.tier || "sample";
  const product = productForTier(tier);
  const amountCents = Number(row.amount_cents ?? row.amountCents ?? product.amountCents ?? 0);
  const currency = row.currency || product.currency || "MYR";
  const createdAt = row.created_at || row.createdAt || new Date().toISOString();
  return {
    ...row,
    source,
    id: row.id || row.client_request_id || row.clientRequestId || `local-${createdAt}-${row.email || "order"}`,
    client_request_id: row.client_request_id || row.clientRequestId || "",
    email: row.email || "",
    level: row.level || "",
    subject: row.subject || "",
    topic: row.topic || "",
    target_marks: Number(row.target_marks ?? row.targetMarks ?? 20),
    targetMarks: Number(row.targetMarks ?? row.target_marks ?? 20),
    tier,
    productLabel: row.productLabel || product.label,
    amount_cents: amountCents,
    amountCents,
    currency,
    cadence: row.cadence || product.cadence,
    payment_status: row.payment_status || row.paymentStatus || (amountCents > 0 ? "awaiting_payment" : "free"),
    paymentStatus: row.paymentStatus || row.payment_status || (amountCents > 0 ? "awaiting_payment" : "free"),
    generation_status: row.generation_status || row.generationStatus || "brief_ready",
    generationStatus: row.generationStatus || row.generation_status || "brief_ready",
    pdf_url: row.pdf_url || row.pdfUrl || "",
    checkout_reference: row.checkout_reference || row.checkoutKey || product.checkoutKey || "",
    weaknesses: row.weaknesses || "",
    mistakeMemory: row.mistakeMemory || row.mistake_memory_snapshot || {},
    created_at: createdAt,
    createdAt,
    page: row.page || "",
  };
};

const mergePaperOrders = (orders = []) => {
  const seen = new Map();
  orders.map((order) => normalizePaperOrder(order, order.source || "local")).forEach((order) => {
    const key = order.id || order.client_request_id || `${order.email}-${order.created_at}`;
    if (!seen.has(key) || order.source === "supabase") seen.set(key, order);
  });
  return [...seen.values()].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
};

const normalizeWorksheetAttempt = (row = {}) => ({
  ...row,
  id: row.id || row.client_run_id,
  client_run_id: row.client_run_id || row.id || "",
  question_count: Number(row.question_count || 0),
  score: row.score === null || row.score === undefined ? null : Number(row.score),
  max_score: row.max_score === null || row.max_score === undefined ? null : Number(row.max_score),
  mistake_count: Number(row.mistake_count || 0),
  submitted_at: row.submitted_at || row.submittedAt || row.updated_at || row.created_at || new Date().toISOString(),
  created_at: row.created_at || row.createdAt || new Date().toISOString(),
  updated_at: row.updated_at || row.updatedAt || row.created_at || new Date().toISOString(),
});

const normalizeQuestionAttempt = (row = {}) => ({
  ...row,
  id: row.id || `${row.worksheet_attempt_id || "qa"}-${row.question_number || Date.now()}`,
  score: row.score === null || row.score === undefined ? null : Number(row.score),
  max_score: row.max_score === null || row.max_score === undefined ? null : Number(row.max_score),
  severity: Number(row.severity || 1),
  is_correct: Boolean(row.is_correct),
  created_at: row.created_at || row.createdAt || new Date().toISOString(),
});

const normalizeMistakeEvent = (row = {}) => ({
  ...row,
  id: row.id || `mistake-${Date.now()}`,
  topic: row.topic || "Unsorted",
  subtopic: row.subtopic || row.topic_subtopic || "",
  error_type: row.error_type || row.type || "Concept gap",
  type: row.type || row.error_type || "Concept gap",
  severity: Number(row.severity || 2),
  source_question: row.source_question || row.source || "",
  next_review_at: row.next_review_at || row.nextReviewAt || null,
  created_at: row.created_at || row.createdAt || new Date().toISOString(),
  updated_at: row.updated_at || row.updatedAt || row.created_at || new Date().toISOString(),
});

const normalizeRevisionCard = (row = {}) => ({
  ...row,
  id: row.id || row.card_key || `card-${Date.now()}`,
  card_key: row.card_key || row.id || makeRevisionCardKey(row),
  topic: row.topic || "Unsorted",
  subtopic: row.subtopic || "",
  error_type: row.error_type || row.type || "Concept gap",
  severity: Number(row.severity || 2),
  review_count: Number(row.review_count || 0),
  ease_factor: Number(row.ease_factor || 2.5),
  next_review_at: row.next_review_at || row.nextReviewAt || new Date().toISOString(),
  created_at: row.created_at || row.createdAt || new Date().toISOString(),
  updated_at: row.updated_at || row.updatedAt || row.created_at || new Date().toISOString(),
});

const normalizeCardReview = (row = {}) => ({
  ...row,
  id: row.id || `review-${Date.now()}`,
  rating: Number(row.rating || 0),
  reviewed_at: row.reviewed_at || row.reviewedAt || new Date().toISOString(),
  created_at: row.created_at || row.createdAt || new Date().toISOString(),
});

const getMistakeMemory = () => {
  if (APP_STATE.authenticated && APP_STATE.mistakeEvents.length) {
    return APP_STATE.mistakeEvents.map((item) => ({
      ...item,
      type: item.type || item.error_type,
      source: item.source_question || item.source || "",
    }));
  }
  return readStorageList(STORAGE_KEYS.mistakes);
};

const mistakeLabel = (mistake = {}) =>
  [mistake.topic, mistake.subtopic, mistake.error_type || mistake.type, mistake.source_question || mistake.source]
    .filter(Boolean)
    .join(" - ");

const getCurrentMemorySnapshot = () => ({
  profile: APP_STATE.profile || {},
  worksheets: APP_STATE.worksheets.map(normalizeWorksheetAttempt),
  questionAttempts: APP_STATE.questionAttempts.map(normalizeQuestionAttempt),
  mistakeEvents: APP_STATE.mistakeEvents.map(normalizeMistakeEvent),
  revisionCards: APP_STATE.revisionCards.map(normalizeRevisionCard),
  cardReviews: APP_STATE.cardReviews.map(normalizeCardReview),
  recentMistakes: getMistakeMemory().slice(0, 12),
});

const rankByKey = (items = [], selector = () => "Unsorted") => {
  const map = new Map();
  items.forEach((item) => {
    const key = selector(item) || "Unsorted";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const scoreTopicLoad = (topic = "", subtopic = "") => {
  const cards = APP_STATE.revisionCards.filter((card) => {
    const matchesTopic = !topic || card.topic === topic;
    const matchesSubtopic = !subtopic || card.subtopic === subtopic;
    return matchesTopic && matchesSubtopic;
  });
  const events = APP_STATE.mistakeEvents.filter((event) => {
    const matchesTopic = !topic || event.topic === topic;
    const matchesSubtopic = !subtopic || event.subtopic === subtopic;
    return matchesTopic && matchesSubtopic;
  });
  const attempts = APP_STATE.questionAttempts.filter((attempt) => {
    const matchesTopic = !topic || attempt.topic === topic;
    const matchesSubtopic = !subtopic || attempt.subtopic === subtopic;
    return matchesTopic && matchesSubtopic;
  });
  const recentReviews = APP_STATE.cardReviews.filter((review) => cards.some((card) => card.id === review.card_id));
  const cardScore = cards.reduce((sum, card) => sum + Number(card.severity || 1), 0);
  const eventScore = events.reduce((sum, event) => sum + Number(event.severity || 1), 0);
  const missScore = attempts.reduce((sum, attempt) => sum + (attempt.is_correct ? 0 : Number(attempt.severity || 1)), 0);
  const reviewBonus = recentReviews.length ? -0.5 * recentReviews.length : 0;
  return {
    topic: topic || "Unsorted",
    subtopic,
    cards,
    events,
    attempts,
    reviewCount: recentReviews.length,
    score: cardScore + eventScore + missScore + reviewBonus,
    lastSeen:
      [...events, ...attempts]
        .map((row) => row.created_at || row.reviewed_at)
        .sort()
        .at(-1) || null,
  };
};

const computeWeakTopics = () => {
  const candidates = new Map();
  APP_STATE.mistakeEvents.forEach((event) => {
    const key = `${event.topic}::${event.subtopic || ""}`;
    candidates.set(key, scoreTopicLoad(event.topic, event.subtopic));
  });
  APP_STATE.questionAttempts.forEach((attempt) => {
    if (attempt.is_correct) return;
    const key = `${attempt.topic || "Unsorted"}::${attempt.subtopic || ""}`;
    if (!candidates.has(key)) {
      candidates.set(key, scoreTopicLoad(attempt.topic || "Unsorted", attempt.subtopic || ""));
    }
  });
  return [...candidates.values()]
    .sort((a, b) => b.score - a.score || (new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime()))
    .slice(0, 8);
};

const computeDueCards = () => {
  const now = Date.now();
  return [...APP_STATE.revisionCards]
    .filter((card) => !card.archived_at && new Date(card.next_review_at || 0).getTime() <= now)
    .sort((a, b) => new Date(a.next_review_at || 0) - new Date(b.next_review_at || 0));
};

const computeRecentErrors = (limit = 6) => [...APP_STATE.mistakeEvents]
  .slice()
  .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  .slice(0, limit);

const computeWorksheetHistory = (limit = 12) =>
  [...APP_STATE.worksheets]
    .slice()
    .sort((a, b) => new Date(b.submitted_at || b.updated_at || b.created_at || 0) - new Date(a.submitted_at || a.updated_at || a.created_at || 0))
    .slice(0, limit);

const computeDashboardStats = () => {
  const worksheets = computeWorksheetHistory(200);
  const dueCards = computeDueCards();
  const weakTopics = computeWeakTopics();
  const recentErrors = computeRecentErrors(8);
  return {
    worksheets,
    dueCards,
    weakTopics,
    recentErrors,
    dueCount: dueCards.length,
    weakCount: weakTopics.length,
    errorCount: recentErrors.length,
    worksheetCount: worksheets.length,
  };
};

const isMarkedWorksheet = (row = {}) => Boolean(
  row.status === "marked" ||
  row.mistake_count > 0 ||
  Number(row.score || 0) > 0
);

const formatRelativeDays = (value) => {
  if (!value) return "No review date";
  const diff = new Date(value).getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "Due yesterday";
  if (days > 0) return `Due in ${days} days`;
  return `${Math.abs(days)} days overdue`;
};

const computeNextReviewAt = (severity = 2, reviewResult = "again", current = new Date()) => {
  const baseDays = reviewResult === "got_it" ? 7 : reviewResult === "unsure" ? 2 : 1;
  const severityBoost = Math.max(1, Number(severity || 1));
  const next = new Date(current);
  next.setDate(next.getDate() + baseDays * severityBoost);
  return next.toISOString();
};

const simulateMemoryFromWeakness = (payload = {}) => {
  const request = payload.request || asPayload();
  const topic = request.topic || request.subject || "Selected topic";
  const subtopic = request.subtopic || request.description || "";
  const sourceQuestion = request.description || request.topic || "Worksheet";
  const severity = Math.max(1, Math.min(3, Number(request.score ? Math.ceil((20 - request.score) / 7) : 2)));
  const baseNote = request.description || `Study ${topic} with more revision cards and examples.`;
  const errorType = payload.fixPoints?.[0] || "Concept gap";
  return {
    topic,
    subtopic,
    error_type: errorType,
    severity,
    source_question: sourceQuestion,
    note: baseNote,
    next_review_at: computeNextReviewAt(severity, severity >= 3 ? "again" : "unsure"),
  };
};

const buildRevisionCardFromMemory = (memory = {}, index = 0) => {
  const topic = memory.topic || "Unsorted";
  const subtopic = memory.subtopic || memory.source_question || "";
  const errorType = memory.error_type || memory.type || "Concept gap";
  const severity = Number(memory.severity || 2);
  const frontParts = [
    topic,
    subtopic,
    errorType,
  ].filter(Boolean);
  const key = memory.card_key || makeRevisionCardKey({
    topic,
    subtopic,
    error_type: errorType,
    card_type: memory.card_type || (memory.note ? "notes" : "quiz"),
  });
  const difficultyText = severity >= 3 ? "High" : severity === 2 ? "Medium" : "Low";
  return {
    card_key: key,
    topic,
    subtopic,
    error_type: errorType,
    severity,
    source_question: memory.source_question || memory.source || "",
    card_type: memory.card_type || (memory.note ? "notes" : "quiz"),
    front: memory.front || frontParts.join(" - "),
    back: memory.back || memory.note || "Review the method, then retest with a new question.",
    memory_snapshot: memory.memory_snapshot || getCurrentMemorySnapshot(),
    review_count: Number(memory.review_count || 0),
    ease_factor: Number(memory.ease_factor || 2.5),
    last_reviewed_at: memory.last_reviewed_at || null,
    next_review_at: memory.next_review_at || computeNextReviewAt(severity, severity >= 3 ? "again" : "unsure"),
    severity_label: difficultyText,
  };
};

const deriveRevisionCards = (limit = 12) => {
  const byTopic = new Map(
    APP_STATE.revisionCards.map((card) => {
      const normalized = normalizeRevisionCard(card);
      return [normalized.card_key, normalized];
    })
  );
  const weakTopics = computeWeakTopics();
  const recentErrors = computeRecentErrors(limit);
  [...weakTopics, ...recentErrors].forEach((item, index) => {
    const key = makeRevisionCardKey({
      topic: item.topic || "Unsorted",
      subtopic: item.subtopic || item.source_question || "",
      error_type: item.error_type || item.type || "Concept gap",
      card_type: item.card_type || (item.note ? "notes" : "quiz"),
    });
    if (byTopic.has(key)) return;
    const card = buildRevisionCardFromMemory({
      topic: item.topic,
      subtopic: item.subtopic,
      error_type: item.error_type || item.type || "Concept gap",
      severity: item.severity || 2,
      source_question: item.source_question || item.source || "",
      note: item.note || item.feedback || "Try the same topic again with a fresh question.",
      memory_snapshot: getCurrentMemorySnapshot(),
      next_review_at: item.next_review_at || computeNextReviewAt(item.severity || 2, "again"),
    }, index);
    byTopic.set(card.card_key, card);
  });
  const cards = [...byTopic.values()].slice(0, limit);
  APP_STATE.revisionCards = cards.map((card) => normalizeRevisionCard(card));
  setCachedRecords("revisionCards", APP_STATE.revisionCards);
  return APP_STATE.revisionCards;
};

const getSupabaseSession = async () => {
  if (!supabaseConfigured()) return null;
  const client = getSupabaseClient();
  if (!client) return null;
  const session = getStoredSession();
  if (session?.access_token) {
    const { data, error } = await client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token || "",
    });
    if (error) {
      console.warn("Stored Supabase session is invalid", error);
      setStoredSession(null);
      authSession = null;
      APP_STATE.user = null;
      APP_STATE.authenticated = false;
      return null;
    }
    authSession = data.session || session;
    APP_STATE.user = data.user || data.session?.user || null;
    APP_STATE.authenticated = Boolean(authSession?.access_token);
    setStoredSession(authSession);
    return authSession;
  }
  const { data, error } = await client.auth.getSession();
  if (error) {
    console.warn("Could not load Supabase session", error);
    return null;
  }
  authSession = data.session || null;
  APP_STATE.user = data.session?.user || null;
  APP_STATE.authenticated = Boolean(authSession?.access_token);
  if (authSession) setStoredSession(authSession);
  return authSession;
};

const setAppModeVisibility = (authenticated) => {
  if (authGateEl) authGateEl.hidden = authenticated;
  if (appShellEl) appShellEl.hidden = !authenticated;
  if (studentAppShell) studentAppShell.classList.toggle("is-authenticated", authenticated);
};

const syncSessionChip = () => {
  if (!sessionChipEl) return;
  if (APP_STATE.authenticated) {
    const label = currentProfileName();
    sessionChipEl.textContent = label ? `Signed in as ${label}` : "Signed in";
    sessionChipEl.classList.add("online");
    sessionChipEl.classList.remove("offline");
    return;
  }
  sessionChipEl.textContent = "Signed out";
  sessionChipEl.classList.remove("online");
  sessionChipEl.classList.add("offline");
};

const setAuthMessage = (message, tone = "neutral") => {
  if (!authMessageEl) return;
  authMessageEl.textContent = message;
  authMessageEl.dataset.tone = tone;
};

const syncProfileFromAuth = async (user = APP_STATE.user) => {
  if (!user) return null;
  const profile = {
    id: user.id,
    email: user.email || "",
    display_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student",
    school_name: "",
    level: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    preferences: {},
  };
  const existing = await supabaseSelect("profiles", { filters: [{ column: "id", value: user.id }], limit: 1, auth: true }).catch(() => []);
  if (existing?.[0]) {
    APP_STATE.profile = existing[0];
    hydrateProfileForm(existing[0]);
    return existing[0];
  }
  if (!authSession?.access_token) {
    APP_STATE.profile = profile;
    hydrateProfileForm(profile);
    return profile;
  }
  const inserted = await saveStudentRow("profiles", profile, { auth: true }).catch(() => null);
  const nextProfile = Array.isArray(inserted) ? inserted[0] : inserted;
  APP_STATE.profile = nextProfile || profile;
  hydrateProfileForm(APP_STATE.profile);
  return APP_STATE.profile;
};

const upsertProfilePayload = () => ({
  id: currentStudentId(),
  email: currentStudentEmail(),
  display_name: cleanText(profileDisplayNameInput?.value || currentProfileName()) || currentProfileName(),
  school_name: cleanText(profileSchoolInput?.value || ""),
  level: cleanText(profileLevelInput?.value || ""),
  timezone: cleanText(profileTimezoneInput?.value || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"),
  updated_at: new Date().toISOString(),
});

const hydrateProfileForm = (profile = {}) => {
  if (profileDisplayNameInput) profileDisplayNameInput.value = profile.display_name || currentProfileName();
  if (profileSchoolInput) profileSchoolInput.value = profile.school_name || "";
  if (profileLevelInput) profileLevelInput.value = profile.level || "";
  if (profileTimezoneInput) profileTimezoneInput.value = profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

const loadOfflineCache = ({ force = false } = {}) => {
  const scope = authSession?.user?.id || "anon";
  if (!force && APP_STATE.cacheLoaded && APP_STATE.cacheScope === scope) return;
  APP_STATE.worksheets = readJsonStorage(`${STUDENT_CACHE_PREFIX}:${scope}:worksheets`, []).map(normalizeWorksheetAttempt);
  APP_STATE.questionAttempts = readJsonStorage(`${STUDENT_CACHE_PREFIX}:${scope}:questionAttempts`, []).map(normalizeQuestionAttempt);
  APP_STATE.mistakeEvents = readJsonStorage(`${STUDENT_CACHE_PREFIX}:${scope}:mistakeEvents`, []).map(normalizeMistakeEvent);
  APP_STATE.revisionCards = readJsonStorage(`${STUDENT_CACHE_PREFIX}:${scope}:revisionCards`, []).map(normalizeRevisionCard);
  APP_STATE.cardReviews = readJsonStorage(`${STUDENT_CACHE_PREFIX}:${scope}:cardReviews`, []).map(normalizeCardReview);
  APP_STATE.cacheLoaded = true;
  APP_STATE.cacheScope = scope;
};

const applyStudentCache = (data = {}) => {
  APP_STATE.worksheets = normalizeArray(data.worksheets).map(normalizeWorksheetAttempt);
  APP_STATE.questionAttempts = normalizeArray(data.questionAttempts).map(normalizeQuestionAttempt);
  APP_STATE.mistakeEvents = normalizeArray(data.mistakeEvents).map(normalizeMistakeEvent);
  APP_STATE.revisionCards = normalizeArray(data.revisionCards).map(normalizeRevisionCard);
  APP_STATE.cardReviews = normalizeArray(data.cardReviews).map(normalizeCardReview);
  setCachedRecords("worksheets", APP_STATE.worksheets);
  setCachedRecords("questionAttempts", APP_STATE.questionAttempts);
  setCachedRecords("mistakeEvents", APP_STATE.mistakeEvents);
  setCachedRecords("revisionCards", APP_STATE.revisionCards);
  setCachedRecords("cardReviews", APP_STATE.cardReviews);
};

const loadStudentData = async () => {
  if (!APP_STATE.authenticated || !currentStudentId()) {
    loadOfflineCache();
    return {
      profile: null,
      worksheets: [],
      questionAttempts: [],
      mistakeEvents: [],
      revisionCards: [],
      cardReviews: [],
    };
  }

  const userId = currentStudentId();
  const [profileRows, worksheetRows, questionRows, mistakeRows, cardRows, reviewRows] = await Promise.all([
    supabaseSelect("profiles", { filters: [{ column: "id", value: userId }], limit: 1, auth: true }).catch(() => []),
    supabaseSelect("worksheet_attempts", { filters: [{ column: "user_id", value: userId }], order: "created_at.desc", limit: 100 }).catch(() => []),
    supabaseSelect("question_attempts", { filters: [{ column: "user_id", value: userId }], order: "created_at.desc", limit: 200 }).catch(() => []),
    supabaseSelect("mistake_events", { filters: [{ column: "user_id", value: userId }], order: "created_at.desc", limit: 100 }).catch(() => []),
    supabaseSelect("revision_cards", { filters: [{ column: "user_id", value: userId }], order: "next_review_at.asc", limit: 100 }).catch(() => []),
    supabaseSelect("card_reviews", { filters: [{ column: "user_id", value: userId }], order: "reviewed_at.desc", limit: 200 }).catch(() => []),
  ]);

  const loaded = {
    profile: profileRows?.[0] || null,
    worksheets: normalizeArray(worksheetRows).map(normalizeWorksheetAttempt),
    questionAttempts: normalizeArray(questionRows).map(normalizeQuestionAttempt),
    mistakeEvents: normalizeArray(mistakeRows).map(normalizeMistakeEvent),
    revisionCards: normalizeArray(cardRows).map(normalizeRevisionCard),
    cardReviews: normalizeArray(reviewRows).map(normalizeCardReview),
  };

  APP_STATE.profile = loaded.profile || APP_STATE.profile;
  applyStudentCache(loaded);
  hydrateProfileForm(APP_STATE.profile || {});
  return loaded;
};

const loadOrderData = async () => {
  const localOrders = readStorageList(STORAGE_KEYS.paperRequests).map((order) => normalizePaperOrder(order, "local"));
  if (!supabaseConfigured() || !APP_STATE.authenticated) {
    APP_STATE.orders = mergePaperOrders(localOrders);
    APP_STATE.ordersLoaded = true;
    return APP_STATE.orders;
  }

  const remoteOrders = await supabaseSelect("ic_educate_paper_requests", {
    select: "*",
    order: "created_at.desc",
    limit: 100,
    auth: true,
  })
    .then((rows) => normalizeArray(rows).map((order) => normalizePaperOrder(order, "supabase")))
    .catch((error) => {
      console.warn("Could not load paper orders", error);
      return [];
    });

  APP_STATE.orders = mergePaperOrders([...remoteOrders, ...localOrders]);
  APP_STATE.ordersLoaded = true;
  return APP_STATE.orders;
};

const updateLocalPaperOrder = (orderId, patch = {}) => {
  const orders = readStorageList(STORAGE_KEYS.paperRequests);
  const nextOrders = orders.map((order) => {
    const normalized = normalizePaperOrder(order, "local");
    const matches =
      normalized.id === orderId ||
      normalized.client_request_id === orderId ||
      order.id === orderId ||
      order.clientRequestId === orderId;
    return matches ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order;
  });
  writeStorageList(STORAGE_KEYS.paperRequests, nextOrders, 100);
  APP_STATE.orders = mergePaperOrders(APP_STATE.orders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)));
};

const refreshStudentState = async ({ quiet = false } = {}) => {
  if (!supabaseConfigured()) {
    loadOfflineCache();
    await loadOrderData();
    renderStudentApp();
    setAuthMessage("Supabase is not configured yet. You are viewing the offline cache.", "warn");
    return;
  }
  if (!APP_STATE.authenticated) {
    loadOfflineCache();
    await loadOrderData();
    renderStudentApp();
    return;
  }

  if (!quiet) setAuthMessage("Loading your history and revision memory...", "info");
  await syncProfileFromAuth(APP_STATE.user);
  const loaded = await loadStudentData();
  await loadOrderData();
  if (loaded.profile) APP_STATE.profile = loaded.profile;
  if (!APP_STATE.revisionCards.length) deriveRevisionCards();
  renderStudentApp();
  syncSessionChip();
  setAuthMessage("Your signed-in memory is up to date.", "success");
};

const switchAppTab = (tabName = "dashboard") => {
  appTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.appTab === tabName);
  });
  appViews.forEach((view) => {
    view.hidden = view.dataset.appView !== tabName;
  });
};

const renderStat = (el, value, suffix = "") => {
  if (!el) return;
  el.textContent = suffix ? `${value}${suffix}` : `${value}`;
};

const renderEmptyState = (title, body) => `
  <article class="empty-panel">
    <strong>${escapeHtml(title)}</strong>
    <p>${escapeHtml(body)}</p>
  </article>
`;

const renderDashboardPanel = () => {
  if (!dashboardDueCountEl) return;
  const stats = computeDashboardStats();
  renderStat(dashboardDueCountEl, stats.dueCount);
  renderStat(dashboardWeakCountEl, stats.weakCount);
  renderStat(dashboardErrorCountEl, stats.errorCount);
  renderStat(dashboardWorksheetCountEl, stats.worksheetCount);

  if (dashboardWeakTopicsEl) {
    dashboardWeakTopicsEl.innerHTML = stats.weakTopics.length
      ? stats.weakTopics
          .map(
            (topic) => `
              <article class="stack-row">
                <strong>${escapeHtml(topic.topic)}${topic.subtopic ? ` / ${escapeHtml(topic.subtopic)}` : ""}</strong>
                <p>${escapeHtml(formatRelativeDays(topic.lastSeen))}</p>
              </article>
            `
          )
          .join("")
      : renderEmptyState("No weak topics yet", "Once worksheets and reviews are saved, the weakest topics will appear here.");
  }

  if (dashboardRecentErrorsEl) {
    dashboardRecentErrorsEl.innerHTML = stats.recentErrors.length
      ? stats.recentErrors
          .map(
            (error) => `
              <article class="stack-row">
                <strong>${escapeHtml(mistakeLabel(error))}</strong>
                <p>${escapeHtml(error.note || "Recent error captured from a worksheet.")}</p>
              </article>
            `
          )
          .join("")
      : renderEmptyState("No recent errors", "Mark a worksheet or save a mistake to see the recent error stream.");
  }

  if (dashboardRecentWorksheetsEl) {
    dashboardRecentWorksheetsEl.innerHTML = stats.worksheets.length
      ? stats.worksheets
          .slice(0, 4)
          .map(
            (worksheet) => `
              <article class="stack-row">
                <strong>${escapeHtml(worksheet.topic || worksheet.subject || "Worksheet")}</strong>
                <p>${escapeHtml(toLocalDateTime(worksheet.created_at))} · ${escapeHtml(worksheet.status || "generated")}</p>
              </article>
            `
          )
          .join("")
      : renderEmptyState("No worksheets yet", "Generated worksheets and marked attempts will build this history list.");
  }
};

const renderRevisePanel = () => {
  const dueCards = computeDueCards();
  const weakTopics = computeWeakTopics();
  const recentErrors = computeRecentErrors(6);
  const dueLabel = dueCards.length ? `${dueCards.length} due` : "Nothing due";
  if (reviseSummaryEl) {
    reviseSummaryEl.innerHTML = `
      <div class="result-links">
        <span class="chip">${escapeHtml(dueLabel)}</span>
        <span class="chip">${escapeHtml(`${weakTopics.length} weak topics`)}</span>
        <span class="chip">${escapeHtml(`${recentErrors.length} recent errors`)}</span>
      </div>
    `;
  }
  if (reviseStatusEl) {
    reviseStatusEl.textContent = dueCards.length
      ? "Work the due cards first. The hardest topics float to the top automatically."
      : "Nothing is due right now. Generate cards or mark a worksheet to refresh revision memory.";
  }

  if (reviseDueCardsEl) {
    reviseDueCardsEl.innerHTML = dueCards.length
      ? dueCards
          .map(
            (card) => `
              <article class="revise-card">
                <div class="revise-card-head">
                  <strong>${escapeHtml(card.front || card.topic)}</strong>
                  <span class="chip">${escapeHtml(formatRelativeDays(card.next_review_at))}</span>
                </div>
                <p>${escapeHtml(card.back || "")}</p>
                <div class="button-row">
                  <button type="button" class="secondary-btn" data-card-action="again" data-card-id="${escapeHtml(card.id)}">Again</button>
                  <button type="button" class="secondary-btn" data-card-action="unsure" data-card-id="${escapeHtml(card.id)}">Unsure</button>
                  <button type="button" class="primary-btn" data-card-action="got_it" data-card-id="${escapeHtml(card.id)}">Got it</button>
                </div>
              </article>
            `
          )
          .join("")
      : renderEmptyState("No cards due today", "Generate a new revision snapshot to seed the deck.");
  }

  if (reviseWeakTopicsEl) {
    reviseWeakTopicsEl.innerHTML = weakTopics.length
      ? weakTopics
          .map(
            (topic) => `
              <article class="stack-row">
                <strong>${escapeHtml(topic.topic)}${topic.subtopic ? ` / ${escapeHtml(topic.subtopic)}` : ""}</strong>
                <p>Weakness score ${escapeHtml(topic.score.toFixed(1))} · ${escapeHtml(topic.reviewCount)} recent reviews</p>
              </article>
            `
          )
          .join("")
      : renderEmptyState("No weak topics", "Once the system sees mistakes, it will start ranking weak areas here.");
  }

  if (reviseRecentErrorsEl) {
    reviseRecentErrorsEl.innerHTML = recentErrors.length
      ? recentErrors
          .map(
            (error) => `
              <article class="stack-row">
                <strong>${escapeHtml(mistakeLabel(error))}</strong>
                <p>${escapeHtml(error.error_type || error.type || "Concept gap")} · ${escapeHtml(error.note || "")}</p>
              </article>
            `
          )
          .join("")
      : renderEmptyState("No recent errors", "The latest worksheet mistakes will appear here.");
  }
};

const renderHistoryPanel = () => {
  const rows = computeWorksheetHistory();
  if (historySummaryEl) {
    historySummaryEl.innerHTML = `
      <div class="result-links">
        <span class="chip">${escapeHtml(`${rows.length} worksheet${rows.length === 1 ? "" : "s"}`)}</span>
        <span class="chip">${escapeHtml(`${computeRecentErrors().length} recent mistakes`)}</span>
      </div>
    `;
  }
  if (!historyListEl) return;
  if (!rows.length) {
    historyListEl.innerHTML = renderEmptyState("No worksheet history yet", "Completed worksheets will show the syllabus, score, mistakes, and file links here.");
    return;
  }
  historyListEl.innerHTML = `
    <div class="history-table">
      <div class="history-head">
        <span>Date</span>
        <span>Syllabus</span>
        <span>Score</span>
        <span>Mistakes</span>
        <span>Links</span>
      </div>
      ${rows
        .map((row) => {
          const links = [
            row.paper_url && row.paper_url !== "#" ? `<a href="${escapeHtml(row.paper_url)}" target="_blank" rel="noreferrer">Paper</a>` : "",
            row.answer_key_url && row.answer_key_url !== "#" ? `<a href="${escapeHtml(row.answer_key_url)}" target="_blank" rel="noreferrer">Answer key</a>` : "",
          ]
            .filter(Boolean)
            .join(" ");
          return `
            <article class="history-row">
              <span>${escapeHtml(toLocalDateTime(row.submitted_at || row.updated_at || row.created_at))}</span>
              <span>${escapeHtml([row.syllabus, row.level, row.topic].filter(Boolean).join(" - "))}</span>
              <span>${escapeHtml(row.score ?? "—")}${row.max_score ? ` / ${escapeHtml(row.max_score)}` : ""}${isMarkedWorksheet(row) ? " · marked" : ""}</span>
              <span>${escapeHtml(row.mistake_count ?? 0)}</span>
              <span class="result-links">${links || '<span class="muted">No files yet</span>'}</span>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
};

const renderStatusSelect = (type, order, options) => {
  const value = type === "payment" ? order.payment_status : order.generation_status;
  return `
    <select
      class="order-status-select"
      aria-label="${escapeHtml(type)} status"
      data-order-status="${escapeHtml(type)}"
      data-order-id="${escapeHtml(order.id)}"
    >
      ${options
        .map(
          (option) => `
            <option value="${escapeHtml(option)}"${option === value ? " selected" : ""}>${escapeHtml(formatStatusLabel(option))}</option>
          `
        )
        .join("")}
    </select>
  `;
};

const renderOrdersPanel = () => {
  if (!orderSummaryEl || !orderListEl) return;
  const orders = APP_STATE.ordersLoaded
    ? APP_STATE.orders
    : readStorageList(STORAGE_KEYS.paperRequests).map((order) => normalizePaperOrder(order, "local"));
  const summary = {
    total: orders.length,
    awaiting: orders.filter((order) => ["not_started", "awaiting_payment"].includes(order.payment_status)).length,
    paid: orders.filter((order) => order.payment_status === "paid").length,
    delivered: orders.filter((order) => order.generation_status === "delivered").length,
    valueCents: orders
      .filter((order) => order.payment_status === "paid")
      .reduce((sum, order) => sum + Number(order.amount_cents || 0), 0),
  };

  if (orderAdminStatusEl) {
    const accountLabel = isOwnerAccount() ? "Owner mode" : "Student/account mode";
    orderAdminStatusEl.textContent = APP_STATE.authenticated
      ? `${accountLabel}. Showing ${orders.length} accessible order${orders.length === 1 ? "" : "s"}.`
      : "Sign in to review saved orders and live Supabase requests.";
  }

  orderSummaryEl.innerHTML = `
    <article class="stat-card">
      <span>Total requests</span>
      <strong>${escapeHtml(summary.total)}</strong>
    </article>
    <article class="stat-card">
      <span>Awaiting payment</span>
      <strong>${escapeHtml(summary.awaiting)}</strong>
    </article>
    <article class="stat-card">
      <span>Paid</span>
      <strong>${escapeHtml(summary.paid)}</strong>
    </article>
    <article class="stat-card">
      <span>Paid value</span>
      <strong>${escapeHtml(formatMoney(summary.valueCents, "MYR"))}</strong>
    </article>
  `;

  if (!orders.length) {
    orderListEl.innerHTML = renderEmptyState(
      "No paper orders yet",
      "Requests from the paper builder will appear here with payment and PDF delivery status."
    );
    return;
  }

  orderListEl.innerHTML = `
    <div class="order-table">
      <div class="order-head">
        <span>Request</span>
        <span>Product</span>
        <span>Payment</span>
        <span>Production</span>
        <span>Actions</span>
      </div>
      ${orders
        .map((order) => {
          const topicLine = [order.level, order.subject, order.topic].filter(Boolean).join(" - ");
          const amount = formatMoney(order.amount_cents, order.currency, order.cadence);
          return `
            <article class="order-row" data-order-row="${escapeHtml(order.id)}">
              <span>
                <strong>${escapeHtml(order.email || "No email")}</strong>
                <small>${escapeHtml(topicLine || "Paper request")} · ${escapeHtml(toLocalDateTime(order.created_at))}</small>
              </span>
              <span>
                <strong>${escapeHtml(order.productLabel || formatStatusLabel(order.tier))}</strong>
                <small>${escapeHtml(amount)} · ${escapeHtml(order.target_marks)} marks · ${escapeHtml(order.source)}</small>
              </span>
              <span>${renderStatusSelect("payment", order, PAYMENT_STATUS_OPTIONS)}</span>
              <span>${renderStatusSelect("generation", order, GENERATION_STATUS_OPTIONS)}</span>
              <span class="order-actions">
                <button type="button" class="secondary-btn" data-order-action="pdf" data-order-id="${escapeHtml(order.id)}">PDF</button>
                <button type="button" class="secondary-btn" data-order-action="copy" data-order-id="${escapeHtml(order.id)}">Copy</button>
              </span>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
};

const renderSettingsPanel = () => {
  if (!profileStatusEl) return;
  const profile = APP_STATE.profile || {};
  profileStatusEl.textContent = APP_STATE.authenticated
    ? `Connected as ${profile.display_name || currentProfileName()}.`
    : "Sign in to sync profile, history, and revision memory.";
  hydrateProfileForm(profile);
};

const renderStudentApp = () => {
  if (!appShellEl && !studentAppShell) return;
  setAppModeVisibility(APP_STATE.authenticated);
  syncSessionChip();
  renderDashboardPanel();
  renderRevisePanel();
  renderHistoryPanel();
  renderOrdersPanel();
  renderSettingsPanel();
  renderMistakeMemory();
  renderPaperPreview();
};

const signInWithPassword = async ({ email, password }) => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase auth is not configured.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  authSession = data.session || null;
  APP_STATE.user = data.user || data.session?.user || null;
  APP_STATE.authenticated = Boolean(authSession?.access_token);
  setStoredSession(authSession);
  await syncProfileFromAuth(APP_STATE.user);
  return authSession;
};

const signUpWithPassword = async ({ email, password, name }) => {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase auth is not configured.");
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name || "",
        name: name || "",
      },
    },
  });
  if (error) throw error;
  authSession = data.session || null;
  APP_STATE.user = data.user || data.session?.user || null;
  APP_STATE.authenticated = Boolean(data.session?.access_token);
  if (authSession) setStoredSession(authSession);
  if (APP_STATE.authenticated && APP_STATE.user) {
    await syncProfileFromAuth(APP_STATE.user);
  }
  return data;
};

const signOut = async () => {
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut().catch((error) => console.warn("Supabase sign-out failed", error));
  }
  authSession = null;
  APP_STATE.user = null;
  APP_STATE.profile = null;
  APP_STATE.authenticated = false;
  setStoredSession(null);
  setAppModeVisibility(false);
  syncSessionChip();
  setAuthMessage("You signed out. Offline cache is still available in the browser.", "neutral");
  APP_STATE.cacheLoaded = false;
  APP_STATE.cacheScope = null;
  loadOfflineCache({ force: true });
  await loadOrderData();
  renderStudentApp();
};

const onSessionChange = async (session) => {
  authSession = session || null;
  APP_STATE.user = session?.user || null;
  APP_STATE.authenticated = Boolean(session?.access_token);
  setStoredSession(session);
  if (APP_STATE.authenticated) {
    await syncProfileFromAuth(APP_STATE.user);
    await refreshStudentState({ quiet: true });
    setAuthMessage("Signed in. Loading your live memory...", "success");
  } else {
    APP_STATE.profile = null;
    APP_STATE.cacheLoaded = false;
    APP_STATE.cacheScope = null;
    loadOfflineCache({ force: true });
    renderStudentApp();
    setAuthMessage("Signed out. You are back on the offline cache.", "neutral");
  }
};

const handleCardAction = async (event) => {
  const button = event.target.closest("[data-card-action]");
  if (!button) return;
  const cardId = button.dataset.cardId;
  const action = button.dataset.cardAction;
  button.disabled = true;
  try {
    await saveCardReview(cardId, action, action === "again" ? "Repeat this card with the related worksheet." : "");
    renderStudentApp();
  } finally {
    button.disabled = false;
  }
};

const saveStudentRow = async (table, payload, { useUpsert = false, onConflict, auth = true } = {}) => {
  if (!supabaseConfigured()) return null;
  if (useUpsert) {
    return supabaseUpsert(table, payload, { onConflict, auth });
  }
  return supabaseInsert(table, payload, { auth });
};

const recordWorksheetAttempt = async (payload, result = {}) => {
  const userId = currentStudentId();
  const output = result.result?.output || result.output || {};
  const worksheetAttempt = {
    user_id: userId,
    client_run_id: payload.clientRunId,
    syllabus: payload.syllabus || null,
    level: payload.level || null,
    subject: payload.topic || payload.subject || null,
    topic: payload.topic || null,
    subtopic: payload.subtopic || null,
    question_count: Number(payload.questionCount || result.questionScores?.length || result.question_scores?.length || output.questionCount || 0),
    score: result.score ?? result.awardedMarks ?? payload.score ?? null,
    max_score: result.maxScore ?? result.totalMarks ?? payload.maxScore ?? null,
    mistake_count: result.mistakeCount ?? payload.mistakeCount ?? 0,
    status: result.status || "generated",
    paper_url: output.pdfPathLocalUrl || output.htmlUrl || output.pdfUrlAbsolute || output.htmlUrlAbsolute || null,
    answer_key_url: output.answerKeyLocalUrl || output.answerKeyPdfUrlAbsolute || output.answerKey || output.answer_key || null,
    source_kind: payload.sourceType || "ic-educate-standalone",
    memory_snapshot: getCurrentMemorySnapshot(),
    notes: payload.description || null,
    submitted_at: payload.createdAt || new Date().toISOString(),
  };
  let persisted = worksheetAttempt;
  if (userId) {
    const inserted = await saveStudentRow("worksheet_attempts", worksheetAttempt, { useUpsert: true, onConflict: "client_run_id", auth: true }).catch((error) => {
      console.warn("Could not save worksheet attempt", error);
      return null;
    });
    if (Array.isArray(inserted) && inserted[0]) {
      persisted = { ...worksheetAttempt, ...inserted[0] };
    }
  }
  if (!persisted.id) persisted.id = persisted.client_run_id;
  APP_STATE.activeWorksheetRunId = persisted.id;
  APP_STATE.activeWorksheetClientRunId = persisted.client_run_id;
  APP_STATE.worksheets = [normalizeWorksheetAttempt(persisted), ...APP_STATE.worksheets.filter((row) => row.client_run_id !== persisted.client_run_id)];
  setCachedRecords("worksheets", APP_STATE.worksheets);
  return normalizeWorksheetAttempt(persisted);
};

const recordQuestionAttempts = async (worksheetAttemptId, payload, response = {}) => {
  const userId = currentStudentId();
  if (!worksheetAttemptId) return [];
  const questions = normalizeArray(response.questionScores || response.question_scores || payload.questionAttempts || []);
  if (!questions.length) return [];
  const rows = questions.map((item, index) => {
    const score = Number(item.score ?? item.awardedMarks ?? 0);
    const maxScore = Number(item.max_score ?? item.maxScore ?? payload.maxScore ?? 0);
    const errorType = score >= maxScore ? "Mastered" : item.uncertain ? "Method missing" : "Concept gap";
    return {
      user_id: userId,
      worksheet_attempt_id: worksheetAttemptId,
      question_number: _safeQuestionNumber(item, index),
      prompt: cleanText(item.question || item.question_label || item.prompt || `Question ${index + 1}`),
      student_answer: cleanText(item.student_answer || item.answer || payload.studentAnswer || ""),
      correct_answer: cleanText(item.correct_answer || item.correctAnswer || payload.correctAnswer || ""),
      score: maxScore ? score : null,
      max_score: maxScore || null,
      is_correct: maxScore ? score >= maxScore : Boolean(item.is_correct),
      topic: payload.topic || payload.subject || null,
      subtopic: payload.subtopic || null,
      error_type: errorType,
      severity: score >= maxScore ? 1 : item.uncertain ? 3 : 2,
      source_question: item.question || item.question_label || payload.description || null,
      metadata: { lane: item.lane || null, comment: item.comment || item.feedback || null },
    };
  });
  let normalized = rows.map((row, index) => ({ ...row, id: row.id || `qa-${Date.now()}-${index}` }));
  if (userId) {
    const inserted = await saveStudentRow("question_attempts", rows, { auth: true }).catch((error) => {
      console.warn("Could not save question attempts", error);
      return [];
    });
    normalized = normalizeArray(inserted).map(normalizeQuestionAttempt);
  }
  APP_STATE.questionAttempts = [...normalized, ...APP_STATE.questionAttempts.filter((row) => row.worksheet_attempt_id !== worksheetAttemptId)];
  setCachedRecords("questionAttempts", APP_STATE.questionAttempts);
  return normalized;
};

const recordMistakeEvents = async (worksheetAttemptId, questionRows = [], payload = {}, response = {}) => {
  const userId = currentStudentId();
  const generated = [];
  if (questionRows.length) {
    questionRows.forEach((row) => {
      if (row.is_correct) return;
      generated.push({
        user_id: userId,
        worksheet_attempt_id: worksheetAttemptId,
        question_attempt_id: row.id || null,
        topic: row.topic || payload.topic || payload.subject || "Unsorted",
        subtopic: row.subtopic || payload.subtopic || "",
        error_type: row.error_type || "Concept gap",
        severity: Number(row.severity || 2),
        source_question: row.source_question || row.prompt || payload.description || "Worksheet",
        student_answer: row.student_answer || null,
        correct_answer: row.correct_answer || null,
        note: row.metadata?.comment || response.feedback || payload.description || "",
        memory_snapshot: getCurrentMemorySnapshot(),
        next_review_at: computeNextReviewAt(Number(row.severity || 2), Number(row.severity || 2) >= 3 ? "again" : "unsure"),
      });
    });
  }
  if (!generated.length && response.fixPoints?.length) {
    response.fixPoints.slice(0, 3).forEach((point, index) => {
      generated.push({
        user_id: userId,
        worksheet_attempt_id: worksheetAttemptId,
        question_attempt_id: null,
        topic: payload.topic || payload.subject || "Unsorted",
        subtopic: payload.subtopic || "",
        error_type: /careless|precision|unit/i.test(point) ? "Careless error" : "Concept gap",
        severity: index === 0 ? 3 : 2,
        source_question: payload.description || "Feedback summary",
        student_answer: null,
        correct_answer: null,
        note: point,
        memory_snapshot: getCurrentMemorySnapshot(),
        next_review_at: computeNextReviewAt(index === 0 ? 3 : 2, index === 0 ? "again" : "unsure"),
      });
    });
  }
  if (!generated.length) return [];
  let normalized = generated.map((row, index) => normalizeMistakeEvent({ ...row, id: row.id || `mistake-${Date.now()}-${index}` }));
  if (userId) {
    const inserted = await saveStudentRow("mistake_events", generated, { auth: true }).catch((error) => {
      console.warn("Could not save mistake events", error);
      return [];
    });
    normalized = normalizeArray(inserted).map(normalizeMistakeEvent);
  }
  APP_STATE.mistakeEvents = [...normalized, ...APP_STATE.mistakeEvents];
  setCachedRecords("mistakeEvents", APP_STATE.mistakeEvents);
  return normalized;
};

const upsertRevisionCards = async (cards = []) => {
  const userId = currentStudentId();
  if (!cards.length) return [];
  const rows = cards.map((card) => ({
    user_id: userId,
    card_key: card.card_key,
    topic: card.topic,
    subtopic: card.subtopic || null,
    error_type: card.error_type || card.type || "Concept gap",
    severity: Number(card.severity || 2),
    source_question: card.source_question || null,
    card_type: card.card_type || "notes",
    front: card.front,
    back: card.back,
    memory_snapshot: card.memory_snapshot || getCurrentMemorySnapshot(),
    review_count: Number(card.review_count || 0),
    ease_factor: Number(card.ease_factor || 2.5),
    last_reviewed_at: card.last_reviewed_at || null,
    next_review_at: card.next_review_at || computeNextReviewAt(Number(card.severity || 2), "unsure"),
  }));
  let normalized = cards.map((card, index) => normalizeRevisionCard({ ...card, id: card.id || `card-${Date.now()}-${index}` }));
  if (userId) {
    const inserted = await saveStudentRow("revision_cards", rows, { useUpsert: true, onConflict: "user_id,card_key", auth: true }).catch((error) => {
      console.warn("Could not save revision cards", error);
      return [];
    });
    const saved = normalizeArray(inserted).map(normalizeRevisionCard);
    const merged = new Map(APP_STATE.revisionCards.map((card) => [card.card_key, normalizeRevisionCard(card)]));
    [...saved, ...normalized].forEach((card) => merged.set(card.card_key, normalizeRevisionCard(card)));
    normalized = [...merged.values()];
  }
  APP_STATE.revisionCards = normalized.length ? normalized : cards.map(normalizeRevisionCard);
  setCachedRecords("revisionCards", APP_STATE.revisionCards);
  return APP_STATE.revisionCards;
};

const saveCardReview = async (cardId, reviewResult, note = "") => {
  const userId = currentStudentId();
  if (!cardId) return null;
  const card = APP_STATE.revisionCards.find((item) => item.id === cardId || item.card_key === cardId);
  if (!card) return null;
  const ratingMap = { got_it: 3, unsure: 2, again: 1 };
  const nextReviewAt = computeNextReviewAt(card.severity || 2, reviewResult);
  const reviewRow = {
    user_id: userId,
    card_id: card.id,
    review_result: reviewResult,
    rating: ratingMap[reviewResult] || 2,
    reviewed_at: new Date().toISOString(),
    next_review_at: nextReviewAt,
    note: note || null,
    metadata: { card_key: card.card_key, topic: card.topic },
  };
  if (userId) {
    await saveStudentRow("card_reviews", reviewRow, { auth: true }).catch((error) => {
      console.warn("Could not save card review", error);
      return null;
    });
  }
  const updatedCard = {
    ...card,
    review_count: Number(card.review_count || 0) + 1,
    last_reviewed_at: reviewRow.reviewed_at,
    next_review_at: nextReviewAt,
    archived_at: reviewResult === "got_it" ? card.archived_at || reviewRow.reviewed_at : card.archived_at || null,
  };
  let persistedCard = normalizeRevisionCard(updatedCard);
  if (userId) {
    const savedCard = await saveStudentRow(
      "revision_cards",
      {
        user_id: userId,
        card_key: persistedCard.card_key,
        topic: persistedCard.topic,
        subtopic: persistedCard.subtopic || null,
        error_type: persistedCard.error_type || null,
        severity: Number(persistedCard.severity || 2),
        source_question: persistedCard.source_question || null,
        card_type: persistedCard.card_type || "notes",
        front: persistedCard.front,
        back: persistedCard.back,
        memory_snapshot: persistedCard.memory_snapshot || getCurrentMemorySnapshot(),
        review_count: Number(persistedCard.review_count || 0),
        ease_factor: Number(persistedCard.ease_factor || 2.5),
        last_reviewed_at: persistedCard.last_reviewed_at || null,
        next_review_at: persistedCard.next_review_at,
        archived_at: persistedCard.archived_at || null,
      },
      { useUpsert: true, onConflict: "user_id,card_key", auth: true }
    ).catch((error) => {
      console.warn("Could not save revision card", error);
      return null;
    });
    if (Array.isArray(savedCard) && savedCard[0]) {
      persistedCard = normalizeRevisionCard(savedCard[0]);
    }
  }
  APP_STATE.revisionCards = APP_STATE.revisionCards.map((item) => (item.card_key === card.card_key ? persistedCard : item));
  APP_STATE.cardReviews = [
    normalizeCardReview({
      ...reviewRow,
      id: `review-${Date.now()}`,
      card_id: card.id,
    }),
    ...APP_STATE.cardReviews,
  ];
  setCachedRecords("revisionCards", APP_STATE.revisionCards);
  setCachedRecords("cardReviews", APP_STATE.cardReviews);
  return reviewRow;
};

const _safeQuestionNumber = (item, index) => {
  const value = item?.question_number ?? item?.number ?? item?.question ?? index + 1;
  const parsed = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : String(index + 1);
};

const summarizeMistakeMemory = (mistakes = getMistakeMemory()) => {
  const byTopic = new Map();
  const byType = new Map();
  mistakes.forEach((mistake) => {
    const severity = Number(mistake.severity || 1);
    const topic = mistake.topic || "Unsorted";
    const type = mistake.type || "Mistake";
    byTopic.set(topic, (byTopic.get(topic) || 0) + severity);
    byType.set(type, (byType.get(type) || 0) + severity);
  });
  const rank = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]);
  return {
    count: mistakes.length,
    topics: rank(byTopic),
    types: rank(byType),
    topTopics: rank(byTopic).slice(0, 3).map(([topic]) => topic),
  };
};

const renderMistakeMemory = () => {
  if (!mistakeCountEl || !mistakeSummaryEl || !mistakeListEl) return;
  const mistakes = getMistakeMemory();
  const summary = summarizeMistakeMemory(mistakes);
  mistakeCountEl.textContent = `${summary.count} saved`;

  if (!mistakes.length) {
    mistakeSummaryEl.innerHTML = `
      <p class="muted">No mistakes saved yet. Add one from a marked paper to see the revision memory build up.</p>
    `;
    mistakeListEl.innerHTML = "";
    return;
  }

  const topicChips = summary.topics
    .slice(0, 5)
    .map(([topic, score]) => `<span class="chip">${escapeHtml(topic)}: ${escapeHtml(score)}</span>`)
    .join("");
  mistakeSummaryEl.innerHTML = `
    <div class="result-links">${topicChips}</div>
    <p class="hint">Next paper should prioritize ${escapeHtml(summary.topTopics.join(", ") || "the latest mistakes")}.</p>
  `;
  mistakeListEl.innerHTML = mistakes
    .slice(0, 8)
    .map(
      (mistake) => `
        <article class="mistake-item">
          <strong>${escapeHtml(mistakeLabel(mistake) || "Saved mistake")}</strong>
          <p>${escapeHtml(mistake.note || "No note added.")}</p>
        </article>
      `
    )
    .join("");
};

const mergeCatalogs = (base, extra) => {
  const merged = structuredClone(base);
  Object.entries(extra || {}).forEach(([syllabus, levels]) => {
    merged[syllabus] = merged[syllabus] || {};
    Object.entries(levels || {}).forEach(([level, topics]) => {
      merged[syllabus][level] = {
        ...(merged[syllabus][level] || {}),
        ...(topics || {}),
      };
    });
  });
  return merged;
};

const psleBaseSubject = (title = "") =>
  title.replace(/^Foundation\s+/i, "").replace(/^Higher\s+/i, "");

const optionFromSubject = (subject, prefix = "") => ({
  value: subject.title,
  label: prefix ? `${prefix} ${subject.title}` : subject.title,
  content: [
    subject.code ? `Code ${subject.code}` : "",
    subject.medium ? `Medium: ${subject.medium}` : "",
    subject.category ? `Category: ${subject.category}` : "",
  ]
    .filter(Boolean)
    .join(". "),
  dataset: { topicId: subject.id || subject.title },
});

const catalogFromSharedSyllabus = (data) => {
  if (data.id === "sg-psle-2026") {
    const topics = Object.fromEntries((data.curriculumSubjects || []).map((subject) => [subject, []]));
    (data.examSubjects || []).forEach((subject) => {
      const topicTitle = psleBaseSubject(subject.title);
      topics[topicTitle] = topics[topicTitle] || [];
      topics[topicTitle].push(optionFromSubject(subject, subject.levels?.[0] || ""));
    });
    return { [data.name]: { [data.level]: topics } };
  }

  if (data.id === "my-spm-kssm-form-4-5") {
    const academic = Object.fromEntries(
      (data.subjects || []).map((subject) => [
        subject.title,
        [
          {
            value: `${subject.title} DSKP`,
            label: `${subject.title} DSKP`,
            content: `KSSM Form 4/5 syllabus content. Category: ${subject.category || "subject"}.`,
            dataset: { topicId: subject.id },
          },
        ],
      ])
    );
    const vocational = Object.fromEntries(
      (data.vocationalSubjects || []).map((title) => [
        title,
        [{ value: `${title} DSKP`, label: `${title} DSKP`, content: "KSSM MPV Form 4/5 vocational syllabus content." }],
      ])
    );
    const specialEducation = Object.fromEntries(
      (data.specialEducationSubjects || []).map((title) => [
        title,
        [{ value: `${title} DSKP`, label: `${title} DSKP`, content: "KSSMPK Form 4/5 special education syllabus content." }],
      ])
    );
    return {
      [data.name]: {
        [data.level]: academic,
        "SPM Vocational MPV": vocational,
        "KSSMPK Form 4 and 5": specialEducation,
      },
    };
  }

  return {};
};

const optionFromSubtopic = (item, prefix = "") => ({
  value: item.title,
  label: prefix ? `${prefix}: ${item.title}` : item.title,
  content: item.content || item.children?.join(", ") || `Syllabus focus: ${item.title}.`,
  dataset: { topicId: item.id || item.title },
});

const catalogFromSubjectDetail = (data) => {
  if (data.curriculumId === "sg-psle-2026") {
    return {
      "Singapore PSLE": {
        [data.level || "Primary 6"]: {
          [data.subject]: (data.topics || []).flatMap((topic) =>
            (topic.subtopics || []).map((subtopic) => optionFromSubtopic(subtopic, topic.title))
          ),
        },
      },
    };
  }

  if (data.curriculumId === "my-spm-kssm-form-4-5" && data.subject) {
    return {
      "Malaysia SPM KSSM": {
        [data.level || "Form 4 and Form 5"]: {
          [data.subject]: (data.topics || []).flatMap((topic) =>
            (topic.subtopics || []).map((subtopic) => optionFromSubtopic(subtopic, topic.title))
          ),
        },
      },
    };
  }

  if (data.id === "my-spm-kssm-stem-and-sejarah-index") {
    const topics = Object.fromEntries(
      (data.subjects || []).map((subject) => [
        subject.title,
        (subject.topics || []).flatMap((topic) =>
          (topic.items || []).map((title) =>
            optionFromSubtopic(
              {
                id: `${subject.id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
                title,
                content: `${subject.title} ${topic.level} syllabus topic.`,
              },
              topic.level
            )
          )
        ),
      ])
    );
    return { "Malaysia SPM KSSM": { [data.level || "Form 4 and Form 5"]: topics } };
  }

  return {};
};

const loadSharedSyllabusCatalog = async () => {
  const registryResponse = await fetch(`${SHARED_SYLLABUS_BASE}registry.json`);
  if (!registryResponse.ok) throw new Error("Shared syllabus registry not available.");
  const registry = await registryResponse.json();
  const files = (registry.curricula || []).map((item) => item.dataFile).filter(Boolean);
  const dataFiles = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(`${SHARED_SYLLABUS_BASE}${file}`);
      if (!response.ok) throw new Error(`Could not load ${file}.`);
      return response.json();
    })
  );
  const subjectFiles = dataFiles.flatMap((data) => data.subjectFiles || []);
  const subjectDataFiles = await Promise.all(
    subjectFiles.map(async (file) => {
      const response = await fetch(`${SHARED_SYLLABUS_BASE}${file}`);
      if (!response.ok) throw new Error(`Could not load ${file}.`);
      return response.json();
    })
  );
  return [...dataFiles, ...subjectDataFiles].reduce((catalog, data) => {
    const indexed = catalogFromSharedSyllabus(data);
    const detailed = catalogFromSubjectDetail(data);
    return mergeCatalogs(mergeCatalogs(catalog, indexed), detailed);
  }, {});
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      reject(new Error(`${file.name} is too large. Keep uploads under 12 MB.`));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result,
      });
    });
    reader.addEventListener("error", () => reject(new Error(`Could not read ${file.name}.`)));
    reader.readAsDataURL(file);
  });

const copyTextToClipboard = async (text) => {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  const success = document.execCommand("copy");
  helper.remove();
  if (!success) {
    throw new Error("Clipboard copy is not available in this browser.");
  }
  return true;
};

const fillSelect = (select, items, placeholder = "Select") => {
  select.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  first.disabled = true;
  first.selected = true;
  select.appendChild(first);

  items.forEach((item) => {
    const option = document.createElement("option");
    if (typeof item === "string") {
      option.value = item;
      option.textContent = item;
    } else {
      option.value = item.value;
      option.textContent = item.label;
      if (item.dataset) {
        Object.entries(item.dataset).forEach(([key, value]) => {
          option.dataset[key] = value;
        });
      }
    }
    select.appendChild(option);
  });
};

const getOptionLabel = (item) => (typeof item === "string" ? item : item?.label || item?.value || "");

const getOptionContent = (item) => {
  if (typeof item === "string") return `Syllabus focus: ${item}.`;
  return item?.content || item?.description || item?.summary || `Syllabus focus: ${getOptionLabel(item)}.`;
};

const buildSyllabusOutline = (payload = asPayload()) => {
  const syllabus = catalogData[payload.syllabus] || {};
  const levelMap = syllabus[payload.level] || {};
  const subtopicItems = levelMap[payload.topic] || [];
  const selectedTitle = payload.subtopic || payload.topic || "Selected topic";
  const normalizedSelected = selectedTitle.toLowerCase();
  const mappedItems = subtopicItems
    .map((item) => ({
      title: getOptionLabel(item),
      content: getOptionContent(item),
      topicId: typeof item === "object" ? item.dataset?.topicId || item.value || "" : "",
    }))
    .filter((item) => item.title);
  const selectedItem =
    mappedItems.find((item) => item.title.toLowerCase() === normalizedSelected) || {
      title: selectedTitle,
      content: `Syllabus focus: ${selectedTitle}.`,
      topicId: payload.topicId || "",
    };
  const relatedItems = mappedItems.filter((item) => item.title !== selectedItem.title);

  return {
    syllabus: payload.syllabus,
    level: payload.level,
    subject: payload.topic,
    selectedSubtopic: selectedItem,
    items: [selectedItem, ...relatedItems].slice(0, 12),
  };
};

const estimateSubtopicMinutes = (item = {}) => {
  const text = `${item.title || ""} ${item.content || ""}`;
  const signals = (text.match(/,|;| and | serta | dengan |\/|\(|\)/gi) || []).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 34 || signals >= 4) return 70;
  if (wordCount > 18 || signals >= 2) return 55;
  return 40;
};

const categorizeSubtopic = (item = {}) => {
  const minutes = estimateSubtopicMinutes(item);
  return {
    title: item.title || "Selected subtopic",
    content: item.content || "Review this syllabus point.",
    category: minutes >= 70 ? "heavy" : minutes >= 55 ? "medium" : "light",
    learnMinutes: minutes,
    quizMinutes: minutes >= 70 ? 18 : 12,
    worksheetMinutes: minutes >= 70 ? 30 : 22,
    examMinutes: minutes >= 70 ? 30 : 20,
  };
};

const expandHeavySubtopics = (items = []) =>
  items.flatMap((item) => {
    const categorized = categorizeSubtopic(item);
    if (categorized.category !== "heavy") return [categorized];
    return [
      { ...categorized, title: `${categorized.title}: core ideas`, category: "heavy-part", learnMinutes: 35, quizMinutes: 10, worksheetMinutes: 15, examMinutes: 10 },
      { ...categorized, title: `${categorized.title}: worked methods`, category: "heavy-part", learnMinutes: 30, quizMinutes: 12, worksheetMinutes: 25, examMinutes: 15 },
      { ...categorized, title: `${categorized.title}: exam application`, category: "heavy-part", learnMinutes: 25, quizMinutes: 15, worksheetMinutes: 25, examMinutes: 30 },
    ];
  });

const buildDailyMaterials = (subtopics, day, phase) => {
  const count = Math.max(2, subtopics.length);
  return {
    notes: `${count} reusable note cards: definition/rule, method, common mistake${count > 2 ? ", comparison" : ""}.`,
    quiz: `${Math.max(8, count * 4)} quiz/flash cards: recall, method choice, misconception, exam trap.`,
    worksheet: `${Math.max(10, count * 5)} worksheet questions: 40% recall, 40% application, 20% challenge.`,
    examPaper: day < 6 ? "1 short timed exam-paper extract or KMJ-style question." : "1 timed mixed exam-paper section with marking and corrections.",
    phase,
  };
};

const normalizeChecklistTitle = (title = "") => {
  const cleaned = String(title)
    .replace(/^\s*(diversity|cycles|systems|interactions|energy|form\s*\d+|primary\s*\d+)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/living and non-living things/i.test(cleaned)) return "Characteristics of Living Things";
  return cleaned || "Selected Topic";
};

const buildDayOneChecklistItems = (payload = asPayload(), plan = []) => {
  const outline = payload.syllabusOutline || buildSyllabusOutline(payload);
  const selected = outline.selectedSubtopic || outline.items?.[0] || {};
  const related = (outline.items || []).filter((item) => item.title && item.title !== selected.title);
  const firstTitle = normalizeChecklistTitle(selected.title || payload.subtopic || payload.topic);
  const secondTitle = "End of Chapter Practice";
  const extraTitles = related
    .slice(0, 4)
    .map((item) => normalizeChecklistTitle(item.title))
    .filter((title) => title && title !== firstTitle && title !== secondTitle);
  const titles = [firstTitle, secondTitle, ...extraTitles];
  return titles.map((title, index) => ({
    number: `1.${index + 1}`,
    title,
    note:
      index === 0
        ? selected.content || plan[0]?.focus || "Read the core notes and make sure you can explain the main idea."
        : index === 1
          ? "Finish the end-of-chapter practice and tick it off after marking corrections."
          : related[index - 2]?.content || "Complete this checklist item before moving on.",
  }));
};

const buildSevenDayStudyPlan = (payload = asPayload()) => {
  const outline = payload.syllabusOutline || buildSyllabusOutline(payload);
  const baseItems = outline.items?.length
    ? outline.items
    : [{ title: payload.subtopic || payload.topic || "Selected topic", content: "Review the selected syllabus area." }];
  const items = expandHeavySubtopics(baseItems).slice(0, 18);
  const pick = (index) => items[index % items.length];
  const selected = outline.selectedSubtopic || pick(0);
  const dayGroups = [
    { title: `Map syllabus and start ${selected.title}`, indexes: [0, 1], phase: "diagnose + notes" },
    { title: "Build core understanding", indexes: [0, 2, 3], phase: "learn + recall" },
    { title: "Connect nearby subtopics", indexes: [1, 4, 5], phase: "compare + explain" },
    { title: "Worked examples and methods", indexes: [2, 6, 7], phase: "worked examples" },
    { title: `Mixed practice across ${outline.subject}`, indexes: [0, 3, 8, 9], phase: "mixed worksheet" },
    { title: "Exam application and timing", indexes: [4, 5, 10, 11], phase: "exam paper" },
    { title: "Review, correct, and close gaps", indexes: [0, 1, 2, 3, 4], phase: "correction loop" },
  ];
  return dayGroups.map((group, index) => {
    const subtopics = group.indexes.map(pick);
    const uniqueSubtopics = subtopics.filter((item, itemIndex, list) => list.findIndex((other) => other.title === item.title) === itemIndex);
    const minutes = uniqueSubtopics.reduce((sum, item) => sum + item.learnMinutes + item.quizMinutes + item.worksheetMinutes, 0) + (index >= 4 ? 35 : 20);
    return {
      day: index + 1,
      title: group.title,
      focus: uniqueSubtopics.map((item) => `${item.title} (${item.category}, ${item.learnMinutes}m learn)`).join("; "),
      task: `Cover at least ${uniqueSubtopics.length} syllabus subtopics/sections. Start with notes, do quiz recall, complete worksheet practice, then mark mistakes against the syllabus wording.`,
      subtopics: uniqueSubtopics,
      estimatedMinutes: minutes,
      materials: buildDailyMaterials(uniqueSubtopics, index + 1, group.phase),
    };
  });
};

const setBackendStatus = (online) => {
  backendReachable = online;
  if (online) {
    backendStatus.textContent = "Generation bridge online";
    backendStatus.classList.add("online");
    backendStatus.classList.remove("offline");
  } else {
    backendStatus.classList.add("offline");
    backendStatus.textContent = "Generation bridge offline";
    backendStatus.classList.remove("online");
  }
};

const setLeadCaptureStatus = (online) => {
  if (!leadCaptureStatus) return;
  leadCaptureStatus.textContent = online ? "Lead capture online" : "Lead capture demo";
  leadCaptureStatus.classList.toggle("online", Boolean(online));
  leadCaptureStatus.classList.toggle("offline", !online);
};

const setMistakeMemoryStatus = (online) => {
  if (!mistakeMemoryStatus) return;
  mistakeMemoryStatus.textContent = online ? "Mistake memory online" : "Mistake memory demo";
  mistakeMemoryStatus.classList.toggle("online", Boolean(online));
  mistakeMemoryStatus.classList.toggle("offline", !online);
};

const buildCatalogFromOptions = (payload) => {
  const next = structuredClone(fallbackCatalog);
  const facets = payload?.library?.facets || {};
  if (Array.isArray(payload?.topical?.subjects) && payload.topical.subjects.length) {
    next["Cambridge IGCSE"] = {
      IGCSE: Object.fromEntries(
        payload.topical.subjects.map((subject) => [
          subject.label,
          (subject.topicPacks || []).map((pack) => ({
            value: pack.title,
            label: pack.title,
            dataset: { topicId: pack.id || "" },
          })),
        ])
      ),
    };
  }

  Object.keys(facets).forEach((syllabus) => {
    const levelList = facets[syllabus];
    if (Array.isArray(levelList) && !next[syllabus]) {
      next[syllabus] = { "Library": Object.fromEntries(levelList.map((lv) => [lv, []])) };
    }
  });

  return next;
};

const fillCascade = () => {
  fillSelect(syllabusSelect, Object.keys(catalogData), "Select syllabus");
  fillSelect(levelSelect, []);
  fillSelect(topicSelect, []);
  fillSelect(subtopicSelect, []);
};

const updateLevelOptions = () => {
  const levels = syllabusSelect.value ? Object.keys(catalogData[syllabusSelect.value] || {}) : [];
  fillSelect(levelSelect, levels, "Select level");
  fillSelect(topicSelect, []);
  fillSelect(subtopicSelect, []);
};

const updateTopicOptions = () => {
  const levelMap = catalogData[syllabusSelect.value] || {};
  const topics = levelSelect.value ? Object.keys(levelMap[levelSelect.value] || {}) : [];
  fillSelect(topicSelect, topics, "Select topic");
  fillSelect(subtopicSelect, []);
};

const updateSubtopicOptions = () => {
  const levels = catalogData[syllabusSelect.value] || {};
  const topics = levels[levelSelect.value] || {};
  const subtopics = topicSelect.value ? topics[topicSelect.value] || [] : [];
  fillSelect(subtopicSelect, subtopics, "Select subtopic");
};

const renderCatalog = () => {
  const nodes = [];
  Object.entries(catalogData).forEach(([syllabus, levels]) => {
    const node = document.createElement("div");
    node.className = "catalog-item";
    node.innerHTML = `<strong>${syllabus}</strong>`;
    Object.entries(levels).forEach(([level, topics]) => {
      const row = document.createElement("div");
      row.style.marginTop = "0.35rem";
      row.innerHTML = `<span class="hint">${level}</span>`;
      const list = document.createElement("ul");
      list.style.margin = "0.3rem 0 0 1rem";
      Object.entries(topics).forEach(([topic, subtopics]) => {
        const item = document.createElement("li");
        const listText = Array.isArray(subtopics)
          ? `${topic} (${subtopics.slice(0, 6).join(", ")})`
          : String(topic);
        item.textContent = listText;
        list.appendChild(item);
      });
      row.appendChild(list);
      node.appendChild(row);
    });
    nodes.push(node);
  });

  if (latestLibraryItems.length) {
    const resNode = document.createElement("div");
    resNode.className = "catalog-item";
    resNode.innerHTML = `<strong>Recent library matches</strong>`;
    const list = document.createElement("ul");
    list.style.margin = "0.3rem 0 0 1rem";
    latestLibraryItems.slice(0, 10).forEach((item) => {
      const row = document.createElement("li");
      row.textContent = `${item.title} (${item.kind || "resource"})`;
      list.appendChild(row);
    });
    resNode.appendChild(list);
    nodes.push(resNode);
  }

  catalogEl.replaceChildren(...nodes);
};

const setMode = (mode) => {
  currentMode = mode;
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  scoreWrap.hidden = mode !== "mark";
  markingFields.hidden = mode !== "mark";
  if (mode === "create") {
    submitBtn.textContent = "Generate worksheet";
  }
  if (mode === "learn") {
    submitBtn.textContent = "Start Day 1";
  }
  if (mode === "mark") {
    submitBtn.textContent = "Get mark feedback";
  }
  resultEl.innerHTML = `<p class="muted">Mode: ${mode}</p>`;
  if (mode === "create" || mode === "learn" || mode === "mark") {
    renderPaperPreview();
  }
};

const asPayload = () => {
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  const selectedSubtopic = subtopicSelect.options[subtopicSelect.selectedIndex];
  const mistakes = getMistakeMemory();
  const mistakeSummary = summarizeMistakeMemory(mistakes);
  const payload = {
    sourceType: "ic-educate-standalone",
    syllabus: syllabusSelect.value,
    curriculum: syllabusSelect.value,
    level: levelSelect.value,
    subject: topicSelect.value,
    topic: topicSelect.value,
    subtopic: subtopicSelect.value,
    topicId: selectedSubtopic && selectedSubtopic.dataset ? selectedSubtopic.dataset.topicId : "",
    description: descriptionInput.value.trim(),
    questionCount: Number(questionCountSelect.value),
    answerFormat: document.getElementById("format").value,
    score: Number(document.getElementById("score").value || 0),
    rubric: rubricTextInput.value.trim(),
    deadline: null,
    uploadedAsset: file ? { name: file.name, type: file.type || "application/octet-stream", size: file.size } : null,
    mistakeMemory: {
      count: mistakeSummary.count,
      topTopics: mistakeSummary.topTopics,
      recent: mistakes.slice(0, 8),
    },
  };
  payload.syllabusOutline = buildSyllabusOutline(payload);
  return payload;
};

const asMarkingPayload = async (payload) => {
  const paperFile = document.getElementById("uploadFile").files[0];
  const rubricFile = document.getElementById("rubricFile").files[0];
  if (!paperFile) {
    throw new Error("Upload a completed paper before requesting feedback.");
  }
  const [uploadedFile, rubricFilePayload] = await Promise.all([
    readFileAsDataUrl(paperFile),
    readFileAsDataUrl(rubricFile),
  ]);
  return {
    ...payload,
    title: payload.description || "IC Educate marking request",
    createdAt: new Date().toISOString(),
    uploadedFile,
    rubricFile: rubricFilePayload,
    markScheme: payload.rubric,
  };
};

const renderLinks = (output = {}) => {
  const isRealUrl = (url) => Boolean(url && url !== "#");
  const candidates = [
    ["Worksheet", output.pdfPathLocalUrl || output.htmlUrl || output.pdfUrlAbsolute || output.htmlUrlAbsolute],
    ["Answer key", output.answerKeyLocalUrl || output.answerKey || output.answer_key],
    ["Sources", output.sourcesMdPathLocalUrl || output.sourcesCsvPathLocalUrl],
  ].filter(([, url]) => isRealUrl(url));
  if (!candidates.length) {
    return '<span class="muted">No output link returned.</span>';
  }
  return candidates
    .map(([title, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${title}</a>`)
    .join(" ");
};

const renderGeneratedWorksheet = (payload) => {
  const output = payload.result || payload.output || {};
  const mistakes = payload.request?.mistakeMemory?.recent || asPayload().mistakeMemory.recent;
  const mistakeHtml = mistakes.length
    ? `<h3>Mistake memory used</h3><ul>${mistakes
        .slice(0, 5)
        .map((item) => `<li>${escapeHtml(mistakeLabel(item))}</li>`)
        .join("")}</ul>`
    : "";
  resultEl.innerHTML = `
    <p><strong>${payload.title || "Worksheet generated"}</strong></p>
    <p class="hint">Mode: ${payload.mode || "create"}</p>
    <div class="result-links">${renderLinks(output)}</div>
    <div class="result-links">
      <span class="chip">Syllabus: ${payload.request?.syllabus || asPayload().syllabus}</span>
      <span class="chip">Topic: ${payload.request?.topic || asPayload().topic}</span>
      <span class="chip">Questions: ${payload.request?.questionCount || asPayload().questionCount}</span>
    </div>
    <h3>Matched library</h3>
    <ul>
      ${(payload.libraryMatches || []).slice(0, 6).map((item) => `<li>${item.title}</li>`).join("") || "<li class='muted'>No matches found.</li>"}
    </ul>
    ${mistakeHtml}
  `;
};

const renderDayOneChecklist = ({ payload, plan, title = "Day 1" }) => {
  const checklistItems = buildDayOneChecklistItems(payload, plan);
  return `
    <h3>${escapeHtml(title)}</h3>
    <ol class="day-checklist">
      ${checklistItems
        .map(
          (item) => `
            <li>
              <label class="check-row">
                <input type="checkbox" />
                <span>
                  <strong>${escapeHtml(item.number)} ${escapeHtml(item.title)}</strong>
                  <small>${escapeHtml(item.note)}</small>
                </span>
              </label>
            </li>
          `
        )
        .join("")}
    </ol>
  `;
};

const renderStudyPack = (payload) => {
  const notes = payload.notes || {};
  const lanes = payload.quiz?.lanes || {};
  const worksheetQuestions = payload.worksheet?.questions || [];
  const requestPayload = payload.request || asPayload();
  const sevenDayPlan = payload.sevenDayPlan || payload.studyPlan || buildSevenDayStudyPlan(requestPayload);

  const noteCards = (notes.noteCards || [])
    .map(
      (card) => `
        <article class="lesson-card">
          <h3>${escapeHtml(card.title || "Note")}</h3>
          <p>${escapeHtml(card.body || card.summary || "")}</p>
        </article>
      `
    )
    .join("");

  const importantPoints = (notes.importantPoints || [])
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");

  const quizHtml = Object.entries(lanes)
    .map(([lane, items]) => {
      const questions = (items || [])
        .map((item, index) => `<article class="quiz-card"><h3>${escapeHtml(lane)} Q${index + 1}. ${escapeHtml(item.prompt || "")}</h3><p>${escapeHtml(item.explanation || item.answer || "")}</p></article>`)
        .join("");
      return questions;
    })
    .join("");

  const worksheetHtml = worksheetQuestions
    .map((item, index) => `<li><strong>Q${index + 1}.</strong> ${escapeHtml(item.prompt || item.question || item)}</li>`)
    .join("");

  resultEl.innerHTML = `
    ${renderDayOneChecklist({ payload: requestPayload, plan: sevenDayPlan })}
    <h3>Notes</h3>
    <div class="lesson-grid">${noteCards || "<p class='muted'>No notes returned.</p>"}</div>
    <h3>Important points</h3>
    <ul>${importantPoints || "<li class='muted'>No points returned.</li>"}</ul>
    <h3>Flashcard / quiz bank</h3>
    <div class="quiz-grid">${quizHtml || "<p class='muted'>No quiz questions returned.</p>"}</div>
    <h3>Practice</h3>
    <p>${escapeHtml(payload.worksheet?.intro || "")}</p>
    <ol>${worksheetHtml || "<li class='muted'>No worksheet questions returned.</li>"}</ol>
  `;
};

const renderLearningJourney = (payload) => {
  const sections = payload.lesson?.sections || [];
  const quiz = payload.quiz?.questions || payload.quiz || [];
  const worksheetResult = payload.worksheet?.result || {};
  const requestPayload = payload.request || asPayload();
  const sevenDayPlan = payload.sevenDayPlan || payload.studyPlan || buildSevenDayStudyPlan(requestPayload);

  const lessonHtml = sections
    .map((sec) => `<article class="lesson-card"><h3>${sec.title}</h3><p>${sec.body || sec}</p></article>`)
    .join("");

  const questionList = (quiz?.questions || quiz)
    .map((q, i) => `<article class="quiz-card"><h3>Q${i + 1}. ${q.prompt || q}</h3><p>${q.explanation || ""}</p></article>`)
    .join("");

  resultEl.innerHTML = `
    ${renderDayOneChecklist({ payload: requestPayload, plan: sevenDayPlan })}
    <h3>Lesson</h3>
    <div class="lesson-grid">${lessonHtml}</div>
    <h3>Practice</h3>
    <div class="result-links">${renderLinks(worksheetResult.output || {})}</div>
    <h3>Quiz</h3>
    <div class="quiz-grid">${questionList}</div>
  `;
};

const renderMarkFeedback = (payload) => {
  const maxScore = Number(payload.maxScore || payload.max_score || 20);
  const score = Number(payload.score || payload.totalScore || payload.total_score || 0);
  const questionScores = payload.questionScores || payload.question_scores || [];
  const warnings = payload.warnings || [];
  const provider = payload.provider ? `<span class="chip">Provider: ${escapeHtml(payload.provider)}</span>` : "";
  const reviewChip = payload.needsReview ? `<span class="chip warn">Needs review</span>` : "";
  const questionHtml = questionScores
    .map((item) => {
      const question = escapeHtml(item.question || item.question_label || "Question");
      const itemScore = escapeHtml(item.score ?? 0);
      const itemMax = escapeHtml(item.max_score ?? item.maxScore ?? 0);
      const comment = escapeHtml(item.comment || item.feedback || "");
      const uncertain = item.uncertain ? `<span class="mini-chip warn">uncertain</span>` : "";
      return `
        <li class="question-row">
          <span><strong>${question}</strong>${uncertain}</span>
          <span class="question-score">${itemScore}/${itemMax}</span>
          <p>${comment || "No comment returned."}</p>
        </li>
      `;
    })
    .join("");
  const warningHtml = warnings.length
    ? `<h3>Warnings</h3><ul>${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";

  resultEl.innerHTML = `
    <p><strong>Marking and feedback</strong></p>
    <div class="result-links">
      <span class="chip">Status: ${escapeHtml(payload.status || "Generated")}</span>
      <span class="chip">Score: ${escapeHtml(score)}/${escapeHtml(maxScore)}</span>
      ${provider}
      ${reviewChip}
    </div>
    <h3>Teacher-style notes</h3>
    <pre>${escapeHtml(payload.feedback || payload.notes || "")}</pre>
    <h3>Question marks</h3>
    <ul class="question-list">
      ${questionHtml || "<li class='muted'>No question-level marks returned.</li>"}
    </ul>
    <h3>What to fix next</h3>
    <ul>
      ${(payload.fixPoints || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li class='muted'>No specific weakness found.</li>"}
    </ul>
    <h3>Follow-up action</h3>
    <p>${escapeHtml(payload.followUp || "Upload a corrected version for another review.")}</p>
    ${warningHtml}
  `;
};

const saveMistakesFromFeedback = (payload = {}) => {
  const request = payload.request || asPayload();
  const points = Array.isArray(payload.fixPoints) ? payload.fixPoints : [];
  const questionScores = payload.questionScores || payload.question_scores || [];
  const generated = [];

  questionScores.forEach((item) => {
    const score = Number(item.score ?? 0);
    const maxScore = Number(item.max_score ?? item.maxScore ?? 0);
    if (maxScore > 0 && score >= maxScore) return;
    generated.push({
      id: `mistake-${Date.now()}-${generated.length}`,
      topic: request.subtopic || request.topic || "Marked paper",
      subtopic: request.subtopic || "",
      type: item.uncertain ? "Method missing" : "Concept gap",
      error_type: item.uncertain ? "Method missing" : "Concept gap",
      severity: maxScore && score / maxScore < 0.5 ? 3 : 2,
      source: item.question || item.question_label || "Marked question",
      source_question: item.question || item.question_label || "Marked question",
      note: item.comment || item.feedback || payload.feedback || "Marked as a weak area.",
      next_review_at: computeNextReviewAt(maxScore && score / maxScore < 0.5 ? 3 : 2, maxScore && score / maxScore < 0.5 ? "again" : "unsure"),
      createdAt: new Date().toISOString(),
      origin: "mark-feedback",
    });
  });

  if (!generated.length) {
    points.slice(0, 3).forEach((point, index) => {
      generated.push({
        id: `mistake-${Date.now()}-${index}`,
        topic: request.subtopic || request.topic || "Marked paper",
        subtopic: request.subtopic || "",
        type: /careless|unit|precision/i.test(point) ? "Careless error" : "Concept gap",
        error_type: /careless|unit|precision/i.test(point) ? "Careless error" : "Concept gap",
        severity: index === 0 ? 3 : 2,
        source: "Feedback",
        source_question: "Feedback",
        note: point,
        next_review_at: computeNextReviewAt(index === 0 ? 3 : 2, index === 0 ? "again" : "unsure"),
        createdAt: new Date().toISOString(),
        origin: "mark-feedback",
      });
    });
  }

  if (!generated.length) return [];
  if (!APP_STATE.authenticated) {
    const existing = getMistakeMemory();
    writeStorageList(STORAGE_KEYS.mistakes, [...generated, ...existing], 80);
    APP_STATE.mistakeEvents = [...generated.map(normalizeMistakeEvent), ...APP_STATE.mistakeEvents];
    setCachedRecords("mistakeEvents", APP_STATE.mistakeEvents);
    renderMistakeMemory();
  }
  return generated;
};

const simulateWorksheet = (payload, mode) => {
  const safeTopic = payload.subtopic || payload.topic || "topic";
  const sevenDayPlan = buildSevenDayStudyPlan(payload);
  const id = `${mode}-${Date.now()}`;
  const title = `${payload.level} ${payload.syllabus}: ${safeTopic}`;
  const output = {
    pdfUrlAbsolute: "#",
    htmlUrlAbsolute: "#",
    answerKeyPdfUrlAbsolute: "#",
  };
  if (mode === "learn") {
    return {
      id,
      title: `${title} learning path`,
      lesson: {
        objective: `Understand ${safeTopic} quickly and apply to exam-style questions.`,
        sections: [
          { title: "Learn", body: `Core ideas and key formulas for ${safeTopic}.` },
          { title: "Practice", body: "Try recall, application, and method-check exercises." },
          { title: "Consolidate", body: "Use a self-check loop for errors and gaps." },
        ],
      },
      checklist: [
        { title: "Watch intro", xp: 10, status: "done", type: "lesson" },
        { title: "Read examples", xp: 20, status: "done", type: "lesson" },
        { title: "Take quiz", xp: 30, status: "ready", type: "quiz" },
      ],
      quiz: {
        title: `Quick ${safeTopic} Quiz`,
        questions: [
          { prompt: `What is the most important rule for ${safeTopic}?`, explanation: "Use the exact formula and units." },
          { prompt: `When does ${safeTopic} commonly appear in exam questions?`, explanation: "Context determines method." },
          { prompt: `Choose the best revision approach for ${safeTopic}.`, explanation: "Use examples + mixed questions." },
        ],
      },
      sevenDayPlan,
      worksheet: {
        result: {
          output,
        },
      },
      request: payload,
      libraryMatches: [],
      mode: "learn",
    };
  }

  return {
    id,
    title,
    mode: "create",
    request: payload,
    libraryMatches: [],
    result: { output },
  };
};

const simulateMarking = (payload) => {
  const score = Number(payload.score || 0);
  const weak = [];
  if (score < 12) weak.push("Work through one example for every question.");
  if (score < 15) weak.push("Show one method line for all calculations.");
  if (score < 18) weak.push("Check units and final answer precision.");
  return {
    id: `feedback-${Date.now()}`,
    status: "simulated_feedback",
    score,
    feedback: `Good attempt on ${payload.topic || "this topic"}. Strength is shown in planning; focus on method explanation and review of weak steps.`,
    fixPoints: weak.length ? weak : ["Keep practicing one mixed-topic worksheet this week."],
    followUp: "Try the generated practice worksheet and take the next quiz to lock this topic.",
    request: payload,
  };
};

const buildLeadPayload = () => ({
  email: leadEmailInput?.value.trim() || "",
  name: leadNameInput?.value.trim() || "",
  level: leadLevelInput?.value.trim() || "",
  subject: leadSubjectInput?.value.trim() || "",
  source: "free-7-day-plan",
  createdAt: new Date().toISOString(),
  page: window.location.href,
});

const leadToSupabaseRow = (payload) => ({
  user_id: currentStudentId(),
  email: payload.email,
  name: payload.name || null,
  level: payload.level || null,
  subject: payload.subject || null,
  source: payload.source,
  page: payload.page,
  status: "new",
});

const buildPaperRequestPayload = () => {
  const tier = paperTierSelect?.value || "sample";
  const product = productForTier(tier);
  const amountCents = Number(product.amountCents || 0);
  return {
    clientRequestId: window.crypto?.randomUUID?.() || `paper-${Date.now()}`,
    email: paperEmailInput?.value.trim() || "",
    level: paperLevelInput?.value.trim() || "",
    subject: paperSubjectInput?.value.trim() || "",
    topic: paperTopicInput?.value.trim() || "",
    targetMarks: Number(paperMarksSelect?.value || 20),
    tier,
    productLabel: product.label,
    amountCents,
    currency: product.currency || "MYR",
    cadence: product.cadence || "",
    checkoutKey: product.checkoutKey || "",
    checkoutUrl: checkoutUrlForProduct(product),
    paymentStatus: amountCents > 0 ? "awaiting_payment" : "free",
    generationStatus: "brief_ready",
    weaknesses: paperWeaknessesInput?.value.trim() || "",
    mistakeMemory: {
      summary: summarizeMistakeMemory(),
      recent: getMistakeMemory().slice(0, 12),
    },
    source: "personalized-exam-pdf-request",
    createdAt: new Date().toISOString(),
    page: window.location.href,
  };
};

const buildPaperQuestions = (payload = {}) => {
  const targetMarks = Number(payload.targetMarks || payload.target_marks || 20);
  const topic = payload.topic || payload.subject || "the selected topic";
  const subject = String(payload.subject || "").toLowerCase();
  const weakness = payload.weaknesses || payload.mistakeMemory?.summary?.topTopics?.[0] || topic;
  const count = targetMarks >= 100 ? 12 : targetMarks >= 60 ? 10 : targetMarks >= 40 ? 8 : 6;
  const baseMarks = Math.max(2, Math.floor(targetMarks / count));
  const remainder = Math.max(0, targetMarks - baseMarks * count);
  const isMath = /math|add|fraction|ratio|algebra|geometry|trig|number/i.test(`${subject} ${topic}`);
  const isScience = /science|physics|chemistry|biology|force|energy|matter|cell|heat|light/i.test(`${subject} ${topic}`);

  return Array.from({ length: count }, (_, index) => {
    const marks = baseMarks + (index < remainder ? 1 : 0);
    const number = index + 1;
    if (isMath) {
      const a = 4 + number * 3;
      const b = 2 + number;
      return {
        number,
        marks,
        prompt:
          number % 3 === 0
            ? `A student solves a ${topic} question but makes this weak step: "${weakness}". Correct the method and finish the question.`
            : `Solve this ${topic} problem: ${a} groups each contain ${b} parts. ${number % 2 === 0 ? "Express the answer in simplest form and show the method." : "Find the total and explain one checking step."}`,
        answer:
          number % 3 === 0
            ? "Identify the wrong step, rewrite the correct method, then complete the calculation with a clear final answer."
            : `Expected method uses ${a} x ${b} = ${a * b}, with units or simplified form where relevant.`,
        scheme: `${Math.max(1, marks - 1)} marks for method, 1 mark for accurate final answer.`,
      };
    }
    if (isScience) {
      return {
        number,
        marks,
        prompt:
          number % 2 === 0
            ? `Explain how ${topic} works in a real exam situation. Include the key variable, observation, and conclusion.`
            : `A learner is weak in "${weakness}". Design a short answer that fixes the misconception using ${topic}.`,
        answer: `A complete answer names the concept, links cause to effect, and uses accurate scientific vocabulary for ${topic}.`,
        scheme: `${Math.max(1, marks - 2)} marks for science idea, 1 mark for evidence, 1 mark for conclusion.`,
      };
    }
    return {
      number,
      marks,
      prompt:
        number % 2 === 0
          ? `Write an exam-style response about ${topic}. Use one example and one correction for this weak area: ${weakness}.`
          : `Answer a structured question on ${topic}. Show the key idea, supporting detail, and final conclusion.`,
      answer: `The response should stay focused on ${topic}, address the weak area, and include a clear final point.`,
      scheme: `${Math.max(1, marks - 1)} marks for relevant content, 1 mark for clarity and structure.`,
    };
  });
};

const buildPrintablePaperHtml = (payload = {}) => {
  const normalized = normalizePaperOrder(payload, "preview");
  const questions = buildPaperQuestions({
    ...payload,
    targetMarks: normalized.target_marks,
  });
  const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
  const focus = normalized.weaknesses || normalized.mistakeMemory?.summary?.topTopics?.join(", ") || normalized.topic || "mixed revision";
  const title = `${normalized.level || "Student"} ${normalized.subject || "Practice"} Paper`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color: #132033; font-family: Arial, sans-serif; }
      body { margin: 0; background: #f3f6fb; }
      main { width: min(840px, calc(100% - 32px)); margin: 24px auto; background: white; padding: 36px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); }
      header { border-bottom: 2px solid #132033; padding-bottom: 16px; margin-bottom: 24px; }
      h1, h2, h3, p { margin-top: 0; }
      h1 { font-size: 28px; margin-bottom: 8px; }
      h2 { font-size: 20px; margin: 28px 0 12px; }
      .meta, .marks { display: flex; flex-wrap: wrap; gap: 8px; }
      .pill { border: 1px solid #c9d4e3; border-radius: 999px; padding: 6px 10px; font-size: 13px; font-weight: 700; }
      .question { border-top: 1px solid #dbe4ef; padding: 16px 0; break-inside: avoid; }
      .question h3 { display: flex; justify-content: space-between; gap: 16px; font-size: 16px; }
      .answer-space { min-height: 76px; border: 1px dashed #c9d4e3; margin-top: 12px; }
      .key { background: #f7f9fc; border: 1px solid #dbe4ef; padding: 12px; margin: 10px 0; break-inside: avoid; }
      .print-actions { margin: 0 auto 16px; width: min(840px, calc(100% - 32px)); padding-top: 18px; text-align: right; }
      button { border: 0; border-radius: 8px; background: #0f766e; color: white; padding: 10px 14px; font-weight: 700; }
      @media print {
        body { background: white; }
        main { width: auto; margin: 0; box-shadow: none; padding: 0; }
        .print-actions { display: none; }
        .answer-key { break-before: page; }
      }
    </style>
  </head>
  <body>
    <div class="print-actions"><button type="button" onclick="window.print()">Print / save PDF</button></div>
    <main>
      <header>
        <p><strong>IC Educate</strong></p>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">
          <span class="pill">${escapeHtml(normalized.subject || "Subject")}</span>
          <span class="pill">${escapeHtml(normalized.level || "Level")}</span>
          <span class="pill">${escapeHtml(normalized.topic || "Mixed topic")}</span>
          <span class="pill">${escapeHtml(`${totalMarks} marks`)}</span>
        </div>
      </header>
      <section>
        <h2>Student Paper</h2>
        <p><strong>Focus:</strong> ${escapeHtml(focus)}</p>
        ${questions
          .map(
            (question) => `
              <article class="question">
                <h3><span>Question ${escapeHtml(question.number)}</span><span>${escapeHtml(question.marks)} marks</span></h3>
                <p>${escapeHtml(question.prompt)}</p>
                <div class="answer-space"></div>
              </article>
            `
          )
          .join("")}
      </section>
      <section class="answer-key">
        <h2>Answer Key And Mark Scheme</h2>
        ${questions
          .map(
            (question) => `
              <article class="key">
                <h3>Question ${escapeHtml(question.number)} · ${escapeHtml(question.marks)} marks</h3>
                <p><strong>Answer:</strong> ${escapeHtml(question.answer)}</p>
                <p><strong>Mark scheme:</strong> ${escapeHtml(question.scheme)}</p>
              </article>
            `
          )
          .join("")}
      </section>
    </main>
  </body>
</html>`;
};

const openPrintablePaper = (payload = buildPaperRequestPayload()) => {
  const html = buildPrintablePaperHtml(payload);
  const paperWindow = window.open("", "_blank");
  if (paperWindow) {
    paperWindow.document.open();
    paperWindow.document.write(html);
    paperWindow.document.close();
    paperWindow.focus();
    return;
  }
  const blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
};

const renderPaperPreview = () => {
  if (!paperPreviewEl) return;
  const payload = buildPaperRequestPayload();
  const price = formatMoney(payload.amountCents, payload.currency, payload.cadence);
  const briefBits = [
    payload.level ? `Level: ${escapeHtml(payload.level)}` : "Level: add one",
    payload.subject ? `Subject: ${escapeHtml(payload.subject)}` : "Subject: add one",
    payload.topic ? `Topic: ${escapeHtml(payload.topic)}` : "Topic: optional",
    `Target: ${escapeHtml(payload.targetMarks)} marks`,
    `Product: ${escapeHtml(payload.productLabel)}`,
    `Price: ${escapeHtml(price)}`,
  ];
  const weaknessText = payload.weaknesses
    ? escapeHtml(payload.weaknesses)
    : "Add weak topics or recent mistakes to push the next paper harder in the right places.";
  const topTopics = payload.mistakeMemory?.summary?.topTopics || [];
  const topTopicLine = topTopics.length
    ? `<p class="hint">Mistake memory leaning toward ${escapeHtml(topTopics.join(", "))}.</p>`
    : `<p class="hint">Mistake memory will appear here after a few marked papers.</p>`;

  paperPreviewEl.innerHTML = `
    <div class="paper-preview-head">
      <span class="tag">Live brief</span>
      <h3>${escapeHtml(payload.subject || "Personalized paper")}</h3>
    </div>
    <div class="result-links">
      ${briefBits.map((bit) => `<span class="chip">${bit}</span>`).join("")}
    </div>
    <p>${weaknessText}</p>
    ${topTopicLine}
    <ul class="paper-preview-list">
      <li>PDF paper tailored to the selected topic mix</li>
      <li>Answer key and marking guidance included</li>
      <li>Uses mistake memory to bias the next set of questions</li>
    </ul>
    <div class="button-row">
      <button type="button" class="secondary-btn" data-paper-action="print-preview">Open printable PDF</button>
      ${payload.checkoutUrl ? `<a class="button primary" href="${escapeHtml(payload.checkoutUrl)}">Pay ${escapeHtml(price)}</a>` : ""}
    </div>
  `;
};

const paperRequestToSupabaseRow = (payload) => ({
  user_id: currentStudentId(),
  client_request_id: payload.clientRequestId,
  email: payload.email,
  level: payload.level,
  subject: payload.subject,
  topic: payload.topic || null,
  target_marks: payload.targetMarks,
  tier: payload.tier,
  weaknesses: payload.weaknesses || null,
  mistake_memory_snapshot: payload.mistakeMemory || {},
  amount_cents: payload.amountCents || 0,
  currency: payload.currency || "MYR",
  checkout_reference: payload.checkoutKey || null,
  payment_status: payload.paymentStatus || "not_started",
  generation_status: payload.generationStatus || "brief_ready",
  pdf_url: payload.pdfUrl || null,
  source: payload.source,
  page: payload.page,
});

const mistakeToSupabaseRow = (mistake, email = "") => ({
  user_id: currentStudentId(),
  email: email || null,
  topic: mistake.topic,
  subtopic: mistake.subtopic || null,
  error_type: mistake.error_type || mistake.type || null,
  type: mistake.type,
  severity: Number(mistake.severity || 2),
  source: mistake.source || null,
  source_question: mistake.source_question || mistake.source || null,
  note: mistake.note || null,
  next_review_at: mistake.next_review_at || computeNextReviewAt(Number(mistake.severity || 2), "unsure"),
  origin: mistake.origin || "manual",
});

const saveLead = async (payload) => {
  const savedLeads = readStorageList(STORAGE_KEYS.leads);
  writeStorageList(
    STORAGE_KEYS.leads,
    [payload, ...savedLeads.filter((lead) => lead.email !== payload.email)],
    100
  );
  const tasks = [];
  if (supabaseConfigured()) {
    tasks.push(insertSupabaseRow("ic_educate_leads", leadToSupabaseRow(payload), { auth: Boolean(currentStudentId()) }));
  }
  if (LEAD_ENDPOINT) {
    tasks.push(postJsonToEndpoint(LEAD_ENDPOINT, payload));
  }
  setLeadCaptureStatus(hasLeadCaptureBackend());
  if (!tasks.length) return null;

  const results = await Promise.allSettled(tasks);
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length === results.length) {
    throw failures[0]?.reason || new Error("Lead capture backend failed.");
  }
  return results;
};

const savePaperRequest = async (payload) => {
  const savedRequests = readStorageList(STORAGE_KEYS.paperRequests);
  writeStorageList(STORAGE_KEYS.paperRequests, [payload, ...savedRequests], 100);
  const tasks = [];
  if (supabaseConfigured()) {
    tasks.push(insertSupabaseRow("ic_educate_paper_requests", paperRequestToSupabaseRow(payload), { auth: Boolean(currentStudentId()) }));
  }
  if (PAPER_REQUEST_ENDPOINT) {
    tasks.push(postJsonToEndpoint(PAPER_REQUEST_ENDPOINT, payload));
  }
  setLeadCaptureStatus(hasLeadCaptureBackend());
  if (!tasks.length) return null;

  const results = await Promise.allSettled(tasks);
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length === results.length) {
    throw failures[0]?.reason || new Error("Paper request backend failed.");
  }
  return results;
};

const orderBriefText = (order = {}) => {
  const normalized = normalizePaperOrder(order, order.source || "local");
  return [
    "IC Educate paper order",
    `Email: ${normalized.email || "-"}`,
    `Level: ${normalized.level || "-"}`,
    `Subject: ${normalized.subject || "-"}`,
    `Topic: ${normalized.topic || "-"}`,
    `Marks: ${normalized.target_marks}`,
    `Product: ${normalized.productLabel || normalized.tier}`,
    `Price: ${formatMoney(normalized.amount_cents, normalized.currency, normalized.cadence)}`,
    `Payment: ${formatStatusLabel(normalized.payment_status)}`,
    `Production: ${formatStatusLabel(normalized.generation_status)}`,
    normalized.weaknesses ? `Weak areas: ${normalized.weaknesses}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const updatePaperOrderStatus = async (orderId, patch = {}) => {
  const order = APP_STATE.orders.find((item) => item.id === orderId || item.client_request_id === orderId);
  if (!order) return;
  const normalizedPatch = {
    ...patch,
    paymentStatus: patch.payment_status || patch.paymentStatus || order.payment_status,
    generationStatus: patch.generation_status || patch.generationStatus || order.generation_status,
  };
  updateLocalPaperOrder(orderId, normalizedPatch);

  if (order.source === "supabase" && supabaseConfigured() && APP_STATE.authenticated && order.id) {
    await updateSupabaseRow("ic_educate_paper_requests", {
      ...(patch.payment_status ? { payment_status: patch.payment_status } : {}),
      ...(patch.generation_status ? { generation_status: patch.generation_status } : {}),
      ...(patch.payment_status === "paid" ? { paid_at: new Date().toISOString() } : {}),
    }, [{ column: "id", value: order.id }], { auth: true });
  }

  await loadOrderData();
  renderOrdersPanel();
};

const handleOrderStatusChange = async (event) => {
  const select = event.target.closest("[data-order-status]");
  if (!select) return;
  const orderId = select.dataset.orderId;
  const type = select.dataset.orderStatus;
  const value = select.value;
  select.disabled = true;
  try {
    await updatePaperOrderStatus(orderId, type === "payment" ? { payment_status: value } : { generation_status: value });
    if (orderAdminStatusEl) orderAdminStatusEl.textContent = `${formatStatusLabel(type)} status updated.`;
  } catch (error) {
    console.warn("Could not update order status", error);
    if (orderAdminStatusEl) {
      orderAdminStatusEl.textContent = `Status saved locally, but Supabase update failed: ${error.message}`;
    }
  } finally {
    select.disabled = false;
  }
};

const handleOrderAction = async (event) => {
  const button = event.target.closest("[data-order-action]");
  if (!button) return;
  const order = APP_STATE.orders.find((item) => item.id === button.dataset.orderId || item.client_request_id === button.dataset.orderId);
  if (!order) return;
  const action = button.dataset.orderAction;
  if (action === "pdf") {
    openPrintablePaper(order);
    return;
  }
  if (action === "copy") {
    await navigator.clipboard?.writeText(orderBriefText(order)).catch(() => null);
    if (orderAdminStatusEl) orderAdminStatusEl.textContent = "Order brief copied.";
  }
};

const callBackend = async (endpoint, payload) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `HTTP ${response.status}`);
  }
  return body;
};

const loadBackendCatalog = async () => {
  try {
    const [optionsResponse, libraryResponse] = await Promise.all([
      fetch(`${API_BASE}/api/worksheets/options`),
      fetch(`${API_BASE}/api/worksheets/library?limit=20`),
    ]);
    if (!optionsResponse.ok || !libraryResponse.ok) throw new Error("API status error");

    const optionsPayload = await optionsResponse.json();
    const libraryPayload = await libraryResponse.json();
    catalogData = buildCatalogFromOptions(optionsPayload);
    latestLibraryItems = libraryPayload.items || [];
    setBackendStatus(true);
  } catch {
    catalogData = structuredClone(fallbackCatalog);
    latestLibraryItems = [];
    setBackendStatus(false);
  }
  try {
    catalogData = mergeCatalogs(catalogData, await loadSharedSyllabusCatalog());
  } catch (error) {
    console.warn("Shared syllabus catalog unavailable", error);
  }
  fillCascade();
  renderCatalog();
};

const asTutorPayload = async ({ launchGemini }) => {
  const imageFile = tutorImageInput.files[0];
  if (!imageFile) {
    throw new Error("Snap or upload a question image first.");
  }

  return {
    ...asPayload(),
    title: descriptionInput.value.trim() || "IC Educate tutor request",
    description: descriptionInput.value.trim(),
    extraInstructions: tutorGoalInput.value.trim(),
    uploadedImage: await readFileAsDataUrl(imageFile),
    copyToClipboard: launchGemini,
    launchGemini,
    pasteIntoGemini: launchGemini,
  };
};

const renderTutorResult = (payload, { previewOnly = false } = {}) => {
  latestTutorPrompt = payload.prompt || "";
  latestGeminiUrl = payload.gemini?.url || latestGeminiUrl;
  tutorCopyBtn.hidden = !latestTutorPrompt;

  const statusChips = [
    payload.ocrProvider ? `<span class="chip">OCR: ${escapeHtml(payload.ocrProvider)}</span>` : "",
    payload.clipboardCopied ? `<span class="chip">Clipboard ready</span>` : "",
    payload.gemini?.opened ? `<span class="chip">Gemini opened</span>` : "",
    previewOnly ? `<span class="chip">Preview only</span>` : "",
  ]
    .filter(Boolean)
    .join("");

  const warnings = Array.isArray(payload.warnings) ? payload.warnings.filter(Boolean) : [];
  const warningHtml = warnings.length
    ? `<h3>Warnings</h3><ul>${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  const defaultNote = previewOnly
    ? "Prompt preview ready. Review it below, then use Copy latest prompt when you want to send it to Gemini."
    : payload.clipboardCopied
      ? "If Gemini opened without the prompt already in the text box, press Ctrl+V once. The prompt is still on your clipboard."
      : "Gemini opened, but clipboard copy did not finish cleanly. Review the prompt below and copy it manually.";
  const note = escapeHtml(previewOnly ? defaultNote : payload.clipboardCopied ? payload.note || defaultNote : defaultNote);

  tutorResultEl.innerHTML = `
    <p><strong>${previewOnly ? "Tutor prompt preview" : "Tutor prompt ready"}</strong></p>
    <div class="result-links">${statusChips || '<span class="muted">No status returned.</span>'}</div>
    <p class="tutor-note">${note}</p>
    <div class="result-links">
      <a href="${escapeHtml(latestGeminiUrl)}" target="_blank" rel="noreferrer">Open Gemini manually</a>
    </div>
    <h3>Generated prompt</h3>
    <pre>${escapeHtml(payload.prompt || "")}</pre>
    <h3>OCR text</h3>
    <pre>${escapeHtml(payload.ocrText || "")}</pre>
    ${warningHtml}
  `;
};

const runTutorFlow = async ({ launchGemini }) => {
  const primaryLabel = "Snap, read, copy and open Gemini";
  const previewLabel = "Preview prompt only";

  tutorLaunchBtn.disabled = true;
  tutorPreviewBtn.disabled = true;
  tutorCopyBtn.disabled = true;
  tutorLaunchBtn.textContent = launchGemini ? "Reading and opening Gemini..." : primaryLabel;
  tutorPreviewBtn.textContent = launchGemini ? previewLabel : "Reading photo...";
  tutorResultEl.innerHTML = `<p class="muted">${launchGemini ? "Reading the photo, building the tutoring prompt, and opening Gemini..." : "Reading the photo and building a tutoring prompt preview..."}</p>`;

  try {
  const payload = await asTutorPayload({ launchGemini });
    const response = await callBackend("/api/tutor/snap-to-gemini", payload);
    renderTutorResult(response, { previewOnly: !launchGemini });
  } catch (error) {
    latestTutorPrompt = "";
    tutorCopyBtn.hidden = true;
    tutorResultEl.innerHTML = `
      <p><strong>Tutor flow could not start</strong></p>
      <p class="muted">${escapeHtml(error.message || "Unknown error")}</p>
      <p class="hint">Start the local IC Educate bridge if you want OCR and Gemini handoff from the GitHub site.</p>
    `;
  } finally {
    tutorLaunchBtn.disabled = false;
    tutorPreviewBtn.disabled = false;
    tutorCopyBtn.disabled = false;
    tutorLaunchBtn.textContent = primaryLabel;
    tutorPreviewBtn.textContent = previewLabel;
  }
};

const copyLatestTutorPrompt = async () => {
  if (!latestTutorPrompt) return;
  const previousText = tutorCopyBtn.textContent;
  tutorCopyBtn.disabled = true;
  try {
    await copyTextToClipboard(latestTutorPrompt);
    tutorCopyBtn.textContent = "Copied";
  } catch (error) {
    tutorResultEl.innerHTML += `<p class="hint">Clipboard copy failed: ${escapeHtml(error.message || "Unknown error")}</p>`;
  } finally {
    window.setTimeout(() => {
      tutorCopyBtn.textContent = previousText;
      tutorCopyBtn.disabled = false;
    }, 1200);
  }
};

const onSubmit = async (event) => {
  event.preventDefault();
  const payload = asPayload();
  payload.clientRunId = payload.clientRunId || `run-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

  submitBtn.disabled = true;
  const message =
    currentMode === "learn"
      ? "Preparing learning journey..."
      : currentMode === "mark"
        ? "Preparing mark feedback..."
        : "Generating worksheet...";
  resultEl.innerHTML = `<p class="muted">${message}</p>`;

  try {
    if (currentMode === "mark") {
      const requestPayload = await asMarkingPayload(payload);
      const runId = APP_STATE.activeWorksheetClientRunId || requestPayload.clientRunId || payload.clientRunId;
      if (backendReachable) {
        const data = await callBackend("/api/platform/teacher-feedback", requestPayload);
        const savedMistakes = saveMistakesFromFeedback({ ...data, request: requestPayload });
        await recordWorksheetAttempt({ ...requestPayload, clientRunId: runId }, { ...data, status: "marked" });
        await recordQuestionAttempts(APP_STATE.activeWorksheetRunId || runId, requestPayload, data);
        await recordMistakeEvents(APP_STATE.activeWorksheetRunId || runId, savedMistakes, requestPayload, data);
        const memoryCards = deriveRevisionCards();
        await upsertRevisionCards(memoryCards);
        renderMarkFeedback(data);
        renderStudentApp();
      } else {
        const simulated = simulateMarking(requestPayload);
        const savedMistakes = saveMistakesFromFeedback(simulated);
        await recordWorksheetAttempt({ ...requestPayload, clientRunId: runId }, { ...simulated, status: "marked" });
        await recordQuestionAttempts(APP_STATE.activeWorksheetRunId || runId, requestPayload, simulated);
        await recordMistakeEvents(APP_STATE.activeWorksheetRunId || runId, savedMistakes, requestPayload, simulated);
        const memoryCards = deriveRevisionCards();
        await upsertRevisionCards(memoryCards);
        renderMarkFeedback(simulated);
        renderStudentApp();
      }
      return;
    }

    const endpoint = currentMode === "learn" ? "/api/learn/journey" : "/api/worksheets/generate";
    if (backendReachable) {
      if (currentMode === "learn") {
        try {
          const studyPack = await callBackend("/api/study-pack/generate", payload);
          renderStudyPack(studyPack);
          APP_STATE.activeWorksheetClientRunId = payload.clientRunId;
          await recordWorksheetAttempt(payload, { ...studyPack, status: "learned" });
          await upsertRevisionCards(deriveRevisionCards());
          renderStudentApp();
        } catch (_studyPackError) {
          const generated = await callBackend(endpoint, payload);
          renderLearningJourney(generated);
          APP_STATE.activeWorksheetClientRunId = payload.clientRunId;
          await recordWorksheetAttempt(payload, { ...generated, status: "generated" });
          await upsertRevisionCards(deriveRevisionCards());
          renderStudentApp();
        }
      } else {
        const generated = await callBackend(endpoint, payload);
        renderGeneratedWorksheet(generated);
        APP_STATE.activeWorksheetClientRunId = payload.clientRunId;
        await recordWorksheetAttempt(payload, { ...generated, status: "generated" });
        await upsertRevisionCards(deriveRevisionCards());
        renderStudentApp();
      }
      return;
    }

    const local = simulateWorksheet(payload, currentMode);
    if (currentMode === "learn") {
      renderLearningJourney(local);
    } else {
      renderGeneratedWorksheet(local);
    }
    APP_STATE.activeWorksheetClientRunId = payload.clientRunId;
    await recordWorksheetAttempt(payload, { ...local, status: currentMode === "learn" ? "learned" : "generated" });
    await upsertRevisionCards(deriveRevisionCards());
    renderStudentApp();
  } catch (error) {
    if (currentMode === "mark") {
      renderMarkFeedback({
        status: "feedback_unavailable",
        score: payload.score || 0,
        maxScore: 20,
        feedback: backendReachable
          ? `Feedback could not be generated yet: ${error.message}`
          : `Feedback could not be generated yet: ${error.message}`,
        fixPoints: backendReachable
          ? ["Check API keys, upload format, and OCR readability, then retry."]
          : simulateMarking(payload).fixPoints,
        followUp: backendReachable
          ? "Fix the provider issue, then submit the same completed paper again."
          : "Submit again when marking is available.",
        warnings: [error.message],
      });
      return;
    }
    const local = simulateWorksheet(payload, currentMode);
    if (currentMode === "learn") {
      renderLearningJourney(local);
    } else {
      renderGeneratedWorksheet({
        ...local,
        result: { output: { output: "", pdfUrlAbsolute: "#", htmlUrlAbsolute: "#", markScheme: "#" } },
      });
    }
    APP_STATE.activeWorksheetClientRunId = payload.clientRunId;
    await recordWorksheetAttempt(payload, { ...local, status: "generated" });
    await upsertRevisionCards(deriveRevisionCards());
    renderStudentApp();
    resultEl.innerHTML += `<p class="hint">Could not reach live generation: ${error.message}. Showing local output.</p>`;
  } finally {
    submitBtn.disabled = false;
  }
};

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});
syllabusSelect.addEventListener("change", updateLevelOptions);
levelSelect.addEventListener("change", updateTopicOptions);
topicSelect.addEventListener("change", updateSubtopicOptions);
worksheetForm.addEventListener("submit", onSubmit);
tutorLaunchBtn.addEventListener("click", () => runTutorFlow({ launchGemini: true }));
tutorPreviewBtn.addEventListener("click", () => runTutorFlow({ launchGemini: false }));
tutorCopyBtn.addEventListener("click", copyLatestTutorPrompt);
appTabButtons.forEach((button) => button.addEventListener("click", () => switchAppTab(button.dataset.appTab)));
appShellEl?.addEventListener("click", handleCardAction);
signOutBtn?.addEventListener("click", () => signOut());
refreshStudentDataBtn?.addEventListener("click", () => refreshStudentState({ quiet: false }));
generateCardsBtn?.addEventListener("click", async () => {
  const cards = deriveRevisionCards();
  await upsertRevisionCards(cards);
  renderStudentApp();
  switchAppTab("revise");
});
clearCacheBtn?.addEventListener("click", () => {
  if (APP_STATE.authenticated) {
    setCachedRecords("worksheets", []);
    setCachedRecords("questionAttempts", []);
    setCachedRecords("mistakeEvents", []);
    setCachedRecords("revisionCards", []);
    setCachedRecords("cardReviews", []);
    APP_STATE.worksheets = [];
    APP_STATE.questionAttempts = [];
    APP_STATE.mistakeEvents = [];
    APP_STATE.revisionCards = [];
    APP_STATE.cardReviews = [];
    renderStudentApp();
    return;
  }
  localStorage.removeItem(`${STUDENT_CACHE_PREFIX}:anon:worksheets`);
  localStorage.removeItem(`${STUDENT_CACHE_PREFIX}:anon:questionAttempts`);
  localStorage.removeItem(`${STUDENT_CACHE_PREFIX}:anon:mistakeEvents`);
  localStorage.removeItem(`${STUDENT_CACHE_PREFIX}:anon:revisionCards`);
  localStorage.removeItem(`${STUDENT_CACHE_PREFIX}:anon:cardReviews`);
  loadOfflineCache({ force: true });
  renderStudentApp();
});

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!APP_STATE.authenticated) return;
  const profile = upsertProfilePayload();
  const result = await saveStudentRow("profiles", profile, { useUpsert: true, onConflict: "id", auth: true }).catch((error) => {
    setAuthMessage(`Could not save profile: ${error.message}`, "warn");
    return null;
  });
  APP_STATE.profile = Array.isArray(result) ? result[0] : result || profile;
  hydrateProfileForm(APP_STATE.profile);
  setAuthMessage("Profile saved.", "success");
  renderStudentApp();
});

signInForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = signInEmailInput?.value.trim();
  const password = signInPasswordInput?.value || "";
  if (!email || !password) return;
  setAuthMessage("Signing in...", "info");
  try {
    await signInWithPassword({ email, password });
    await refreshStudentState({ quiet: true });
    setAppModeVisibility(true);
    switchAppTab("dashboard");
    setAuthMessage("Signed in. Your memory is loading.", "success");
  } catch (error) {
    setAuthMessage(`Sign in failed: ${error.message}`, "warn");
  }
});

signUpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = signUpNameInput?.value.trim();
  const email = signUpEmailInput?.value.trim();
  const password = signUpPasswordInput?.value || "";
  if (!email || !password) return;
  setAuthMessage("Creating your account...", "info");
  try {
    await signUpWithPassword({ email, password, name });
    if (!APP_STATE.authenticated) {
      setAuthMessage("Account created. Check your email to confirm, then sign in.", "info");
      return;
    }
    await refreshStudentState({ quiet: true });
    setAppModeVisibility(true);
    switchAppTab("dashboard");
    setAuthMessage("Account created and signed in.", "success");
  } catch (error) {
    setAuthMessage(`Sign up failed: ${error.message}`, "warn");
  }
});

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = buildLeadPayload();
  if (!payload.email) return;
  const button = leadForm.querySelector("button");
  const previousText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Unlocking...";
  }
  saveLead(payload)
    .then(() => {
      if (leadStatus) {
        leadStatus.textContent = supabaseConfigured() || LEAD_ENDPOINT
          ? "Lead saved and starter unlocked. Pick a topic below to generate Day 1."
          : "Demo lead saved locally. Add Supabase config or IC_EDUCATE_LEAD_ENDPOINT to save leads online.";
      }
      setMode("learn");
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
    })
    .catch((error) => {
      if (leadStatus) {
        leadStatus.textContent = `Saved locally, but the lead endpoint failed: ${error.message}`;
      }
    })
    .finally(() => {
      if (button) {
        button.disabled = false;
        button.textContent = previousText;
      }
    });
});

[
  paperLevelInput,
  paperSubjectInput,
  paperTopicInput,
  paperMarksSelect,
  paperTierSelect,
  paperWeaknessesInput,
  leadEmailInput,
  leadNameInput,
  leadLevelInput,
  leadSubjectInput,
].forEach((input) => {
  input?.addEventListener("input", renderPaperPreview);
  input?.addEventListener("change", renderPaperPreview);
});

paperRequestForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = buildPaperRequestPayload();
  if (!payload.email || !payload.level || !payload.subject) return;
  const button = paperRequestForm.querySelector("button");
  const previousText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Requesting...";
  }
  savePaperRequest(payload)
    .then(async () => {
      await loadOrderData();
      if (paperRequestStatus) {
        paperRequestStatus.textContent = supabaseConfigured() || PAPER_REQUEST_ENDPOINT
          ? `Request saved. ${formatMoney(payload.amountCents, payload.currency, payload.cadence)} is now tracked in Orders.`
          : "Demo request saved locally. Orders can still track payment and PDF status in this browser.";
      }
      if (descriptionInput && !descriptionInput.value.trim()) {
        descriptionInput.value = `Generate a ${payload.targetMarks}-mark ${payload.subject} exam PDF for ${payload.level}. Weak areas: ${payload.weaknesses || payload.topic || "use mistake memory"}.`;
      }
      setMode("create");
      renderPaperPreview();
      renderOrdersPanel();
    })
    .catch((error) => {
      if (paperRequestStatus) {
        paperRequestStatus.textContent = `Saved locally, but the paper request endpoint failed: ${error.message}`;
      }
    })
    .finally(() => {
      if (button) {
        button.disabled = false;
        button.textContent = previousText;
      }
    });
});

paperPreviewEl?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-paper-action]");
  if (!button) return;
  if (button.dataset.paperAction === "print-preview") {
    openPrintablePaper(buildPaperRequestPayload());
    if (paperRequestStatus) {
      paperRequestStatus.textContent = "Printable paper opened. Use the print button in the new tab to save the PDF.";
    }
  }
});

refreshOrdersBtn?.addEventListener("click", async () => {
  refreshOrdersBtn.disabled = true;
  const previousText = refreshOrdersBtn.textContent;
  refreshOrdersBtn.textContent = "Refreshing...";
  try {
    await loadOrderData();
    renderOrdersPanel();
  } finally {
    refreshOrdersBtn.disabled = false;
    refreshOrdersBtn.textContent = previousText;
  }
});

orderListEl?.addEventListener("change", handleOrderStatusChange);
orderListEl?.addEventListener("click", handleOrderAction);

mistakeForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const topic = mistakeTopicInput?.value.trim();
  if (!topic) return;
  const latestLead = readStorageList(STORAGE_KEYS.leads)[0] || {};
  const mistake = {
    id: `mistake-${Date.now()}`,
    topic,
    type: mistakeTypeSelect?.value || "Concept gap",
    error_type: mistakeTypeSelect?.value || "Concept gap",
    subtopic: "",
    severity: Number(mistakeSeveritySelect?.value || 2),
    source: mistakeSourceInput?.value.trim() || "Manual entry",
    source_question: mistakeSourceInput?.value.trim() || "Manual entry",
    note: mistakeNoteInput?.value.trim() || "",
    next_review_at: computeNextReviewAt(Number(mistakeSeveritySelect?.value || 2), "unsure"),
    createdAt: new Date().toISOString(),
    origin: "manual",
  };
  if (!APP_STATE.authenticated) {
    writeStorageList(STORAGE_KEYS.mistakes, [mistake, ...getMistakeMemory()], 80);
  }
  const structuredMistake = normalizeMistakeEvent({
    ...mistake,
    user_id: currentStudentId(),
    memory_snapshot: getCurrentMemorySnapshot(),
  });
  APP_STATE.mistakeEvents = [structuredMistake, ...APP_STATE.mistakeEvents];
  setCachedRecords("mistakeEvents", APP_STATE.mistakeEvents);
  setMistakeMemoryStatus(Boolean(getMistakeMemory().length || supabaseConfigured()));
  renderMistakeMemory();
  renderPaperPreview();
  insertSupabaseRow("ic_educate_mistakes", mistakeToSupabaseRow(mistake, latestLead.email || ""), { auth: Boolean(currentStudentId()) })
    .catch((error) => console.warn("Could not save mistake to Supabase", error));
  const cards = deriveRevisionCards();
  upsertRevisionCards(cards).catch((error) => console.warn("Could not refresh revision cards", error));
  mistakeForm.reset();
});

clearMistakesBtn?.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.mistakes);
  APP_STATE.mistakeEvents = [];
  setCachedRecords("mistakeEvents", []);
  setMistakeMemoryStatus(supabaseConfigured());
  renderMistakeMemory();
  renderPaperPreview();
  renderStudentApp();
});

const bootStudentApp = async () => {
  setMode("create");
  setLeadCaptureStatus(hasLeadCaptureBackend());
  setMistakeMemoryStatus(Boolean(getMistakeMemory().length || supabaseConfigured()));
  renderPaperPreview();
  loadOfflineCache();
  await loadOrderData();
  if (supabaseConfigured()) {
    await getSupabaseSession();
    if (APP_STATE.authenticated) {
      await refreshStudentState({ quiet: true });
      setAppModeVisibility(true);
      setAuthMessage("Signed in. Loading your dashboard.", "success");
      switchAppTab("dashboard");
    } else {
      setAppModeVisibility(false);
      setAuthMessage("Sign in to sync profiles, history, and revision cards.", "neutral");
    }
    const client = getSupabaseClient();
    client?.auth.onAuthStateChange(async (_event, session) => {
      await onSessionChange(session);
    });
  } else {
    setAppModeVisibility(false);
    setAuthMessage("Supabase auth is not configured. Set the project URL and anon key to turn on sign-in.", "warn");
  }
  renderMistakeMemory();
  renderPaperPreview();
  await loadBackendCatalog();
  renderStudentApp();
};

bootStudentApp();

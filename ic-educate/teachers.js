const teacherLeadForm = document.getElementById("teacherLeadForm");
const teacherLeadMarket = document.getElementById("teacherLeadMarket");
const teacherLeadName = document.getElementById("teacherLeadName");
const teacherLeadPhone = document.getElementById("teacherLeadPhone");
const teacherLeadPhoto = document.getElementById("teacherLeadPhoto");
const teacherLeadSubjects = document.getElementById("teacherLeadSubjects");
const teacherLeadSyllabus = document.getElementById("teacherLeadSyllabus");
const teacherLeadArea = document.getElementById("teacherLeadArea");
const teacherLeadMode = document.getElementById("teacherLeadMode");
const teacherLeadTime = document.getElementById("teacherLeadTime");
const teacherLeadFee = document.getElementById("teacherLeadFee");
const teacherLeadNote = document.getElementById("teacherLeadNote");
const teacherLeadConsent = document.getElementById("teacherLeadConsent");
const teacherLeadSubmitBtn = document.getElementById("teacherLeadSubmitBtn");
const teacherLeadSampleBtn = document.getElementById("teacherLeadSampleBtn");
const teacherLeadResetBtn = document.getElementById("teacherLeadResetBtn");
const teacherLeadStatus = document.getElementById("teacherLeadStatus");
const teacherLeadPreview = document.getElementById("teacherLeadPreview");
const teacherLeadQueue = document.getElementById("teacherLeadQueue");
const teacherLeadWhatsappLink = document.getElementById("teacherLeadWhatsappLink");
const teacherLeadCopyBtn = document.getElementById("teacherLeadCopyBtn");

const LEAD_STORAGE_KEY = "ic-educate-teacher-leads";
const SUPABASE_URL = window.IC_EDUCATE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";
let teacherLeads = [];
let pendingPhotoDataUrl = "";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const teacherInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("") || "T";

const normalizePhone = (value = "") => String(value).replace(/\D+/g, "");
const routePhone = (market = "malaysia") => (market === "hongkong" ? "85255115251" : "60178265300");
const routeLabel = (market = "malaysia") => (market === "hongkong" ? "Hong Kong" : "Malaysia");

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const copyText = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "true");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
};

const loadLeads = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEAD_STORAGE_KEY) || "[]");
    teacherLeads = Array.isArray(parsed) ? parsed : [];
  } catch {
    teacherLeads = [];
  }
};

const saveLeads = () => {
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(teacherLeads.slice(0, 80)));
  } catch {
    // ignore storage failures
  }
};

const supabaseRequest = async (path, { method = "GET", body, prefer } = {}) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase not configured");
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.error || `HTTP ${response.status}`);
  return payload;
};

const leadToRow = (lead) => ({
  email: `${normalizePhone(lead.phone) || "teacher"}@ic-educate.local`,
  market: lead.market,
  status: lead.status,
  lead_type: "teacher",
  name: lead.name || null,
  phone: normalizePhone(lead.phone) || null,
  subject: lead.subject || null,
  topic: lead.topic || null,
  level: lead.level || null,
  area: lead.area || null,
  source: "teacher-signup",
  mode: lead.mode || null,
  note: lead.note || null,
  page: window.location.href,
  created_at: lead.createdAt || new Date().toISOString(),
});

const saveLead = async (lead) => {
  const next = [lead, ...teacherLeads.filter((item) => item.id !== lead.id)].slice(0, 80);
  teacherLeads = next;
  saveLeads();
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await supabaseRequest("/rest/v1/ic_educate_leads", {
        method: "POST",
        body: [leadToRow(lead)],
        prefer: "return=minimal",
      });
    } catch (error) {
      teacherLeadStatus.textContent = `Saved locally; shared queue offline (${error.message}).`;
    }
  }
};

const buildMessage = (lead) =>
  [
    `Hi ${lead.name || ""}, thanks for joining IC Educate.`,
    "Please send your photo, syllabus, subjects, free times, area, and fee.",
    `Market: ${routeLabel(lead.market)}`,
    lead.note ? `Intro: ${lead.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const buildPreview = (lead) => `
  <div class="teacher-card-identity">
    ${
      lead.photoDataUrl
        ? `<img class="teacher-photo" src="${escapeHtml(lead.photoDataUrl)}" alt="${escapeHtml(lead.name || "Teacher")}">`
        : `<div class="teacher-avatar">${escapeHtml(teacherInitials(lead.name))}</div>`
    }
    <div>
      <span class="tag">${escapeHtml(routeLabel(lead.market))} teacher</span>
      <h3>${escapeHtml(lead.name || "Teacher profile")}</h3>
      <p class="hint">${escapeHtml(lead.subject || "Subjects")} - ${escapeHtml(lead.level || "Any level")}</p>
    </div>
  </div>
  <div class="result-links">
    <span class="chip">${escapeHtml(lead.subject || "Subjects")}</span>
    <span class="chip">${escapeHtml(lead.level || "Syllabus")}</span>
    <span class="chip">${escapeHtml(lead.area || "Area")}</span>
    <span class="chip">${escapeHtml(lead.time || "Free time")}</span>
  </div>
  <p class="teacher-note">${escapeHtml(lead.note || "Short teaching intro goes here.")}</p>
`;

const renderQueue = () => {
  const sorted = teacherLeads.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  teacherLeadQueue.innerHTML = sorted.length
    ? sorted.slice(0, 8).map((lead) => `
        <article class="saved-item">
          <div class="teacher-card-identity">
            ${
              lead.photoDataUrl
                ? `<img class="teacher-photo" src="${escapeHtml(lead.photoDataUrl)}" alt="${escapeHtml(lead.name || "Teacher")}">`
                : `<div class="teacher-avatar">${escapeHtml(teacherInitials(lead.name))}</div>`
            }
            <div>
              <strong>${escapeHtml(lead.name || "Teacher lead")}</strong>
              <p class="hint">${escapeHtml(lead.subject || "")} ${lead.topic ? `- ${escapeHtml(lead.topic)}` : ""}</p>
            </div>
          </div>
          <div class="result-links">
            <span class="chip">${escapeHtml(lead.status || "new")}</span>
            <span class="chip">${escapeHtml(routeLabel(lead.market))}</span>
            <span class="chip">${escapeHtml(lead.area || "Any area")}</span>
            <span class="chip">${escapeHtml(lead.mode || "online")}</span>
          </div>
          <p class="teacher-note">${escapeHtml(lead.note || "")}</p>
          <div class="button-row">
            <a class="chip ghost" href="https://wa.me/${normalizePhone(lead.phone) || routePhone(lead.market)}?text=${encodeURIComponent(buildMessage(lead))}" target="_blank" rel="noreferrer">WhatsApp</a>
            <button type="button" class="secondary-btn copy-lead-btn" data-lead-id="${lead.id}">Copy brief</button>
          </div>
        </article>
      `).join("")
    : `<p class="muted">No teacher leads yet.</p>`;
};

const currentLead = () => ({
  id: `teacher-${Date.now()}`,
  market: teacherLeadMarket.value,
  status: "new",
  name: teacherLeadName.value.trim(),
  phone: teacherLeadPhone.value.trim(),
  subject: teacherLeadSubjects.value.trim(),
  topic: teacherLeadSubjects.value.trim().split(/[\n,;]+/g)[0]?.trim() || "",
  level: teacherLeadSyllabus.value.trim(),
  area: teacherLeadArea.value.trim(),
  mode: teacherLeadMode.value,
  time: teacherLeadTime.value.trim(),
  fee: teacherLeadFee.value.trim(),
  note: teacherLeadNote.value.trim(),
  consentWhatsapp: Boolean(teacherLeadConsent.checked),
  createdAt: new Date().toISOString(),
  source: "teacher-signup",
  photoDataUrl: pendingPhotoDataUrl || "",
});

const fillForm = (lead) => {
  teacherLeadMarket.value = lead.market || "malaysia";
  teacherLeadName.value = lead.name || "";
  teacherLeadPhone.value = lead.phone || "";
  teacherLeadSubjects.value = lead.subject || "";
  teacherLeadSyllabus.value = lead.level || "";
  teacherLeadArea.value = lead.area || "";
  teacherLeadMode.value = lead.mode || "both";
  teacherLeadTime.value = lead.time || "";
  teacherLeadFee.value = lead.fee || "";
  teacherLeadNote.value = lead.note || "";
  teacherLeadConsent.checked = Boolean(lead.consentWhatsapp);
};

const updatePreview = () => {
  const lead = currentLead();
  teacherLeadPreview.innerHTML = buildPreview(lead);
  teacherLeadWhatsappLink.href = `https://wa.me/${routePhone(lead.market)}?text=${encodeURIComponent(buildMessage(lead))}`;
};

teacherLeadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const lead = currentLead();
  if (!lead.name || !lead.phone || !lead.subject || !lead.level || !lead.area) {
    teacherLeadStatus.textContent = "Please add name, phone, subjects, syllabus, level, and area.";
    return;
  }
  if (teacherLeadPhoto.files?.[0]) {
    lead.photoDataUrl = await readFileAsDataUrl(teacherLeadPhoto.files[0]);
  }
  await saveLead(lead);
  teacherLeadStatus.textContent = "Teacher lead saved.";
  renderQueue();
});

teacherLeadSampleBtn?.addEventListener("click", () => {
  fillForm({
    market: "malaysia",
    name: "Maya Tan",
    phone: "+60 12-345 6789",
    subject: "Mathematics, Algebra, Statistics",
    level: "SPM, IGCSE",
    area: "Petaling Jaya",
    mode: "both",
    time: "Weekday evenings, Sunday afternoon",
    fee: "RM90/hr",
    note: "Exam-focused tutor who explains step by step and gives weekly homework follow-up.",
    consentWhatsapp: true,
  });
  updatePreview();
  teacherLeadStatus.textContent = "Sample teacher profile loaded.";
});

teacherLeadResetBtn?.addEventListener("click", () => {
  teacherLeadForm.reset();
  teacherLeadMarket.value = "malaysia";
  pendingPhotoDataUrl = "";
  updatePreview();
  teacherLeadStatus.textContent = "Form cleared.";
});

teacherLeadForm?.addEventListener("input", updatePreview);

teacherLeadPhoto?.addEventListener("change", async () => {
  const file = teacherLeadPhoto.files?.[0];
  pendingPhotoDataUrl = file ? await readFileAsDataUrl(file) : "";
  updatePreview();
});

teacherLeadCopyBtn?.addEventListener("click", async () => {
  const lead = currentLead();
  await copyText(buildMessage(lead));
  teacherLeadStatus.textContent = "Copied teacher brief.";
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-lead-id]");
  if (!button) return;
  const lead = teacherLeads.find((item) => item.id === button.dataset.leadId);
  if (!lead) return;
  await copyText(buildMessage(lead));
  teacherLeadStatus.textContent = `Copied brief for ${lead.name || "the teacher"}.`;
});

loadLeads();
updatePreview();
renderQueue();

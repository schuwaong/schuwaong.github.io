const STORAGE_KEY = "icEducateLandingLeads";

const leadCaptureStatus = document.getElementById("leadCaptureStatus");
const backendStatus = document.getElementById("backendStatus");
const mistakeMemoryStatus = document.getElementById("mistakeMemoryStatus");
const paperRequestForm = document.getElementById("paperRequestForm");
const paperPreviewEl = document.getElementById("paperPreview");
const paperRequestStatus = document.getElementById("paperRequestStatus");

const paperEmailInput = document.getElementById("paperEmail");
const paperLevelInput = document.getElementById("paperLevel");
const paperSubjectInput = document.getElementById("paperSubject");
const paperTopicInput = document.getElementById("paperTopic");
const paperMarksSelect = document.getElementById("paperMarks");
const paperNameInput = document.getElementById("paperName");
const paperWeaknessesInput = document.getElementById("paperWeaknesses");

const readSavedLeads = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const saveLead = (payload) => {
  const leads = readSavedLeads();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([payload, ...leads].slice(0, 50)));
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

let latestSubmittedPayload = null;

const buildPayload = () => ({
  email: paperEmailInput?.value.trim() || "",
  name: paperNameInput?.value.trim() || "",
  level: paperLevelInput?.value.trim() || "",
  subject: paperSubjectInput?.value.trim() || "",
  topic: paperTopicInput?.value.trim() || "",
  targetMarks: Number(paperMarksSelect?.value || 20),
  weaknesses: paperWeaknessesInput?.value.trim() || "",
  source: "free-7-day-plan",
  createdAt: new Date().toISOString(),
  page: window.location.href,
});

const renderPreview = (overridePayload = null) => {
  if (!paperPreviewEl) return;
  const payload = overridePayload || buildPayload();
  const marks = payload.targetMarks;
  const title = payload.subject || "Personalized paper";
  const weakText = payload.weaknesses || "Add weak topics or recent mistakes to shape the next paper.";

  paperPreviewEl.innerHTML = `
    <div class="paper-preview-head">
      <span class="tag">Live brief</span>
      <h3>${escapeHtml(title)}</h3>
    </div>
    <div class="result-links">
      <span class="chip">Level: ${escapeHtml(payload.level || "add one")}</span>
      <span class="chip">Topic: ${escapeHtml(payload.topic || "optional")}</span>
      <span class="chip">Target: ${escapeHtml(String(marks))} marks</span>
      <span class="chip">Starter: Free</span>
      <span class="chip">Paid paper: from RM29</span>
    </div>
    <p>${escapeHtml(weakText)}</p>
    <p class="hint">The free starter shows the brief; the paid product turns it into a full PDF paper and key.</p>
    <ul class="paper-preview-list">
      <li>One free 7-day plan per email</li>
      <li>PDF paper and answer key on the paid path</li>
      <li>Mistake memory keeps the next paper sharper</li>
    </ul>
  `;
};

paperRequestForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = buildPayload();
  if (!payload.email || !payload.level || !payload.subject) return;
  saveLead(payload);
  if (paperRequestStatus) {
    paperRequestStatus.textContent = "Lead captured. Connect Supabase or a checkout follow-up when you are ready.";
  }
  if (leadCaptureStatus) {
    leadCaptureStatus.textContent = "Lead captured";
    leadCaptureStatus.classList.add("online");
  }
  if (backendStatus) {
    backendStatus.textContent = "Paper brief ready";
    backendStatus.classList.add("online");
  }
  if (mistakeMemoryStatus) {
    mistakeMemoryStatus.textContent = "Memory loop ready";
    mistakeMemoryStatus.classList.add("online");
  }
  latestSubmittedPayload = payload;
  renderPreview(payload);
  paperRequestForm.reset();
});

[
  paperEmailInput,
  paperLevelInput,
  paperSubjectInput,
  paperTopicInput,
  paperMarksSelect,
  paperNameInput,
  paperWeaknessesInput,
].forEach((input) => {
  input?.addEventListener("input", () => {
    latestSubmittedPayload = null;
    renderPreview();
  });
  input?.addEventListener("change", () => {
    latestSubmittedPayload = null;
    renderPreview();
  });
});

renderPreview(latestSubmittedPayload);

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
const subjectSelectedEl = document.getElementById("subjectSelected");
const topicSelectedEl = document.getElementById("topicSelected");

const selections = {
  paperSubject: [],
  paperTopic: [],
};

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

const getSelection = (id) => selections[id] || [];

const syncSelectionInput = (id) => {
  const input = document.getElementById(id);
  if (input) input.value = getSelection(id).join(", ");
};

const renderSelectedPills = (id) => {
  const target = id === "paperSubject" ? subjectSelectedEl : topicSelectedEl;
  if (!target) return;
  target.innerHTML = getSelection(id)
    .map((value) => `
      <span class="selected-choice">
        ${escapeHtml(value)}
        <button type="button" data-remove="${escapeHtml(value)}" aria-label="Remove ${escapeHtml(value)}">x</button>
      </span>
    `)
    .join("");
};

const updateOptionState = (id) => {
  document.querySelectorAll(`[data-multi-select][data-target="${id}"] .option-pill`).forEach((button) => {
    button.classList.toggle("active", getSelection(id).includes(button.dataset.value || button.textContent.trim()));
  });
};

const setSelection = (id, values, options = {}) => {
  selections[id] = [...new Set(values.filter(Boolean))];
  syncSelectionInput(id);
  renderSelectedPills(id);
  updateOptionState(id);
  latestSubmittedPayload = null;
  if (!options.silent) renderPreview();
};

document.querySelectorAll("[data-multi-select]").forEach((field) => {
  const id = field.dataset.target;
  if (!id) return;
  const control = field.querySelector(".multi-select-control");
  const setOpen = (isOpen) => {
    field.classList.toggle("open", isOpen);
    control?.setAttribute("aria-expanded", String(isOpen));
  };
  control?.addEventListener("click", () => {
    document.querySelectorAll("[data-multi-select].open").forEach((openField) => {
      if (openField !== field) openField.classList.remove("open");
    });
    setOpen(!field.classList.contains("open"));
  });
  control?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      field.querySelector(".option-pill")?.focus();
    }
  });
  field.querySelectorAll(".option-pill").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.value || button.textContent.trim();
      const current = getSelection(id);
      setSelection(id, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
      setOpen(false);
    });
  });
  field.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");
    if (!removeButton) return;
    const value = removeButton.dataset.remove;
    setSelection(id, getSelection(id).filter((item) => item !== value));
  });
});

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-multi-select]")) return;
  document.querySelectorAll("[data-multi-select].open").forEach((field) => {
    field.classList.remove("open");
    field.querySelector(".multi-select-control")?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll("[data-multi-select].open").forEach((field) => {
    field.classList.remove("open");
    field.querySelector(".multi-select-control")?.setAttribute("aria-expanded", "false");
  });
});

const buildPayload = () => ({
  email: paperEmailInput?.value.trim() || "",
  name: paperNameInput?.value.trim() || "",
  level: paperLevelInput?.value.trim() || "",
  subject: getSelection("paperSubject").join(", ") || paperSubjectInput?.value.trim() || "",
  topics: getSelection("paperTopic"),
  topic: getSelection("paperTopic").join(", ") || paperTopicInput?.value.trim() || "",
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
  const subjects = payload.subject || "Select subject";
  const topics = payload.topics?.length ? payload.topics : payload.topic ? payload.topic.split(",").map((item) => item.trim()).filter(Boolean) : [];
  const focusTopics = topics.length ? topics : ["weak topic", "practice accuracy", "exam timing"];
  const weakText = payload.weaknesses || "Add parent notes or recent mistakes to sharpen the daily plan.";
  const dayPlans = [
    ["Day 1", "Diagnose", `Quick check on ${focusTopics[0] || "core gaps"}.`],
    ["Day 2", "Fix", `Teach the clean method for ${focusTopics[0] || "the first weak area"}.`],
    ["Day 3", "Drill", `Short targeted practice on ${focusTopics[1] || focusTopics[0] || "accuracy"}.`],
    ["Day 4", "Apply", "Mixed questions with one worked example first."],
    ["Day 5", "Speed", "Timed mini-set and careless-mistake check."],
    ["Day 6", "Redo", "Redo missed questions without looking at notes."],
    ["Day 7", "Review", "Parent summary plus next paid paper brief."],
  ];

  paperPreviewEl.innerHTML = `
    <div class="recovery-preview">
      <div class="recovery-preview-head">
        <div>
          <span class="tag">Live parent diagnostic</span>
          <h3>${escapeHtml(payload.level || "Student")} recovery plan</h3>
          <p>${escapeHtml(subjects)} - ${escapeHtml(focusTopics.join(", "))}</p>
        </div>
        <div class="plan-score">
          <strong>7</strong>
          <span>day reset</span>
        </div>
      </div>
      <div class="recovery-tags">
        <span>${escapeHtml(payload.level || "Add level")}</span>
        <span>${escapeHtml(String(marks))} mark target</span>
        <span>${escapeHtml(topics.length ? `${topics.length} chapter${topics.length > 1 ? "s" : ""}` : "Pick chapters")}</span>
        <span>Paid paper from RM29</span>
      </div>
      <p>${escapeHtml(weakText)}</p>
      <div class="recovery-days">
        ${dayPlans.map(([day, label, copy]) => `
          <article class="recovery-day">
            <span>${escapeHtml(day)}</span>
            <strong>${escapeHtml(label)}</strong>
            <p>${escapeHtml(copy)}</p>
          </article>
        `).join("")}
      </div>
      <div class="recovery-next">
        <div>
          <strong>Next paid step: targeted PDF paper + answer key</strong>
          <p>The selected chapters become the paper brief, and missed questions feed the next plan.</p>
        </div>
        <a class="button" href="#pricing">See upgrade</a>
      </div>
    </div>
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
});

[
  paperEmailInput,
  paperLevelInput,
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

setSelection("paperSubject", ["Mathematics"]);
setSelection("paperTopic", ["Fractions", "Ratio"]);
renderPreview(latestSubmittedPayload);

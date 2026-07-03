const STORAGE_KEY = "jobsHuntDashboardState_v1";
const defaultState = {
  signedIn: false,
  user: {
    name: "",
    email: "",
    market: "Hong Kong",
    role: "",
    cvFileName: "",
    cvUploadedAt: ""
  },
  browser: {
    consented: false,
    granted: false
  },
  run: {
    active: false,
    paused: false,
    phase: "idle",
    progress: 0,
    jobsFound: 0,
    draftsReady: 0,
    approvalQueue: 0,
    browserConnected: false,
    updatedAt: ""
  },
  jobs: [],
  activity: []
};

const stepConfig = [
  {
    key: "match",
    title: "Match roles",
    detail: "Score the uploaded CV against open roles."
  },
  {
    key: "tailor",
    title: "Tailor CV",
    detail: "Rewrite keywords and highlights for the role."
  },
  {
    key: "browser",
    title: "Browser access",
    detail: "Open approved pages on this laptop."
  },
  {
    key: "queue",
    title: "Queue drafts",
    detail: "Stage applications for review."
  },
  {
    key: "track",
    title: "Track progress",
    detail: "Log the run and keep the report ready."
  }
];

const phaseMeta = {
  idle: {
    label: "Waiting",
    note: "Upload a CV and press Help find jobs to begin.",
    progress: 0,
    step: 0
  },
  matching: {
    label: "Matching",
    note: "Comparing the CV against live job targets.",
    progress: 22,
    step: 1
  },
  tailoring: {
    label: "Tailoring",
    note: "Rewriting bullets, keywords, and cover letter notes.",
    progress: 48,
    step: 2
  },
  "browser-wait": {
    label: "Browser needed",
    note: "Give browser access to open approved pages.",
    progress: 68,
    step: 2
  },
  "browser-live": {
    label: "Browser live",
    note: "The helper can now stage pages on this laptop.",
    progress: 82,
    step: 3
  },
  approval: {
    label: "Queue ready",
    note: "Drafts are staged and waiting for review.",
    progress: 94,
    step: 4
  },
  complete: {
    label: "Complete",
    note: "Report is ready and the run is logged.",
    progress: 100,
    step: 4
  }
};

const els = {
  sessionBadge: document.getElementById("sessionBadge"),
  workspaceClock: document.getElementById("workspaceClock"),
  helpFindJobsButton: document.getElementById("helpFindJobsButton"),
  pauseRunButton: document.getElementById("pauseRunButton"),
  resetWorkspaceButton: document.getElementById("resetWorkspaceButton"),
  signInForm: document.getElementById("signInForm"),
  cvUpload: document.getElementById("cvUpload"),
  cvHint: document.getElementById("cvHint"),
  authPanel: document.getElementById("authPanel"),
  profilePanel: document.getElementById("profilePanel"),
  switchAccountButton: document.getElementById("switchAccountButton"),
  profileName: document.getElementById("profileName"),
  profileMarket: document.getElementById("profileMarket"),
  profileRole: document.getElementById("profileRole"),
  profileEmail: document.getElementById("profileEmail"),
  profileCv: document.getElementById("profileCv"),
  previewCaption: document.getElementById("previewCaption"),
  browserConsent: document.getElementById("browserConsent"),
  browserAccessButton: document.getElementById("browserAccessButton"),
  browserStatus: document.getElementById("browserStatus"),
  workspaceSummary: document.getElementById("workspaceSummary"),
  jobsFound: document.getElementById("jobsFound"),
  draftsReady: document.getElementById("draftsReady"),
  browserMetric: document.getElementById("browserMetric"),
  approvalQueue: document.getElementById("approvalQueue"),
  phaseLabel: document.getElementById("phaseLabel"),
  pipelineNote: document.getElementById("pipelineNote"),
  stepper: document.getElementById("stepper"),
  progressFill: document.getElementById("progressFill"),
  queueCount: document.getElementById("queueCount"),
  jobQueue: document.getElementById("jobQueue"),
  activityFeed: document.getElementById("activityFeed")
};

let state = loadState();
let runToken = 0;

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!raw) return structuredCloneDefault();
    return mergeState(structuredCloneDefault(), raw);
  } catch (error) {
    return structuredCloneDefault();
  }
}

function structuredCloneDefault() {
  return JSON.parse(JSON.stringify(defaultState));
}

function mergeState(base, incoming) {
  const output = { ...base, ...incoming };
  output.user = { ...base.user, ...(incoming.user || {}) };
  output.browser = { ...base.browser, ...(incoming.browser || {}) };
  output.run = { ...base.run, ...(incoming.run || {}) };
  output.jobs = Array.isArray(incoming.jobs) ? incoming.jobs : [];
  output.activity = Array.isArray(incoming.activity) ? incoming.activity : [];
  return output;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetActivity(message) {
  state.activity = [];
  pushActivity(message, new Date());
}

function pushActivity(message, time = new Date()) {
  state.activity.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    time: time.toISOString()
  });
  state.activity = state.activity.slice(0, 8);
}

function fmtTime(value) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function marketSuffix(market) {
  if (market === "Remote") return "remote";
  return market.toLowerCase();
}

function roleSeed(role) {
  const lowered = (role || "").toLowerCase();
  if (lowered.includes("product")) return ["Product", "Growth", "Operations", "Customer Success", "Program"];
  if (lowered.includes("marketing")) return ["Brand", "Growth", "Content", "CRM", "Partnerships"];
  if (lowered.includes("finance")) return ["Finance", "FP&A", "Treasury", "Risk", "Strategy"];
  if (lowered.includes("data")) return ["Data", "Analytics", "BI", "Insights", "Reporting"];
  if (lowered.includes("sales")) return ["Sales", "Partnerships", "BD", "Account", "Revenue"];
  if (lowered.includes("ops")) return ["Operations", "Programs", "Projects", "Process", "Support"];
  return ["Operations", "Projects", "People", "Strategy", "Coordination"];
}

function buildJobs(user) {
  const [a, b, c, d, e] = roleSeed(user.role);
  const market = marketSuffix(user.market);
  const companies = [
    `Northstar ${user.market}`,
    `Bluegate ${user.market}`,
    `Harbor ${user.market}`,
    `Summit ${user.market}`,
    `Atlas ${user.market}`
  ];

  return [
    {
      id: "job-1",
      title: `${a} Lead`,
      company: companies[0],
      location: user.market,
      source: "JobStreet",
      status: "Matched",
      detail: `Good fit for ${user.role || "your focus role"} in ${market}.`
    },
    {
      id: "job-2",
      title: `${b} Manager`,
      company: companies[1],
      location: user.market,
      source: "LinkedIn",
      status: "Tailor CV",
      detail: "Keywords and CV bullets are being tuned for the description."
    },
    {
      id: "job-3",
      title: `${c} Specialist`,
      company: companies[2],
      location: user.market,
      source: "JobStreet",
      status: "Browser ready",
      detail: "Open pages and keep the draft in the browser helper."
    },
    {
      id: "job-4",
      title: `${d} Coordinator`,
      company: companies[3],
      location: user.market,
      source: "Indeed",
      status: "Awaiting approval",
      detail: "Application is staged and waiting for review."
    },
    {
      id: "job-5",
      title: `${e} Analyst`,
      company: companies[4],
      location: user.market,
      source: "JobStreet",
      status: "Tracking",
      detail: "Logged for follow-up once the run finishes."
    }
  ];
}

function initialRunSummary() {
  return {
    active: false,
    paused: false,
    phase: "idle",
    progress: 0,
    jobsFound: 0,
    draftsReady: 0,
    approvalQueue: 0,
    browserConnected: false,
    updatedAt: ""
  };
}

function setRunPhase(phase) {
  const meta = phaseMeta[phase] || phaseMeta.idle;
  state.run.phase = phase;
  state.run.progress = meta.progress;
  state.run.updatedAt = new Date().toISOString();
  els.phaseLabel.textContent = meta.label;
  els.pipelineNote.textContent = meta.note;
  els.progressFill.style.width = `${meta.progress}%`;

  const currentStep = meta.step;
  Array.from(els.stepper.querySelectorAll("li")).forEach((item, index) => {
    item.classList.toggle("is-done", index < currentStep);
    item.classList.toggle("is-active", index === currentStep);
  });
}

function renderStepper() {
  els.stepper.innerHTML = stepConfig
    .map(
      (step, index) => `
        <li data-step="${index + 1}">
          <strong>${step.title}</strong>
          <span>${step.detail}</span>
        </li>
      `
    )
    .join("");
}

function renderJobs() {
  els.jobQueue.innerHTML = state.jobs.length
    ? state.jobs
        .map(
          (job) => `
            <article class="queue-row" data-job="${job.id}">
              <div class="queue-top">
                <div>
                  <strong>${job.title}</strong>
                  <small>${job.company} · ${job.location}</small>
                </div>
                <span class="chip ${job.status === "Browser ready" || job.status === "Tracking" ? "is-live" : job.status === "Awaiting approval" ? "is-warning" : ""}">${job.status}</span>
              </div>
              <div class="queue-details">
                <span class="chip">${job.source}</span>
                <span class="chip">${job.detail}</span>
              </div>
              <div class="row-actions">
                <button type="button" data-open-brief="${job.id}">Open brief</button>
                <button type="button" data-focus-job="${job.id}">Focus</button>
              </div>
            </article>
          `
        )
        .join("")
    : `
      <article class="queue-row">
        <strong>No jobs yet.</strong>
        <small>Press Help find jobs to generate the queue.</small>
      </article>
    `;
}

function renderActivity() {
  els.activityFeed.innerHTML = state.activity.length
    ? state.activity
        .map(
          (item) => `
            <article class="activity-row">
              <div class="activity-top">
                <strong>${item.message}</strong>
                <small>${fmtTime(item.time)}</small>
              </div>
            </article>
          `
        )
        .join("")
    : `
      <article class="activity-row">
        <strong>Waiting for the first run.</strong>
        <small>The feed will fill as the AI starts working.</small>
      </article>
    `;
}

function renderMetrics() {
  els.jobsFound.textContent = String(state.run.jobsFound || 0);
  els.draftsReady.textContent = String(state.run.draftsReady || 0);
  els.browserMetric.textContent = state.run.browserConnected ? "Live" : state.browser.granted ? "Ready" : "Locked";
  els.approvalQueue.textContent = String(state.run.approvalQueue || 0);
  els.queueCount.textContent = `${state.jobs.length} job${state.jobs.length === 1 ? "" : "s"}`;
}

function renderIdentity() {
  if (state.signedIn) {
    els.sessionBadge.textContent = state.run.active
      ? "Run active"
      : state.browser.granted
      ? "Browser ready"
      : "Signed in";
    els.workspaceClock.textContent = state.run.updatedAt ? `Updated ${fmtTime(state.run.updatedAt)}` : "Ready";
    els.profileName.textContent = state.user.name || "Signed in workspace";
    els.profileMarket.textContent = state.user.market || "-";
    els.profileRole.textContent = state.user.role || "-";
    els.profileEmail.textContent = state.user.email || "-";
    els.profileCv.textContent = state.user.cvFileName ? `${state.user.cvFileName}` : "Not uploaded";
    els.browserStatus.textContent = state.browser.granted
      ? "Browser access granted on this laptop."
      : "Locked until you grant access.";
    els.previewCaption.textContent = state.user.name
      ? `${state.user.name} is signed in. Upload a CV, then hand the browser to the AI helper.`
      : "Login, upload a CV, then hand the browser to the AI helper.";
    els.authPanel.classList.toggle("is-hidden", true);
    els.profilePanel.classList.toggle("is-hidden", false);
  } else {
    els.sessionBadge.textContent = "Guest session";
    els.workspaceClock.textContent = "Waiting for sign in";
    els.browserStatus.textContent = "Locked until you grant access.";
    els.previewCaption.textContent = "Login, upload a CV, then hand the browser to the AI helper.";
    els.authPanel.classList.toggle("is-hidden", false);
    els.profilePanel.classList.toggle("is-hidden", true);
  }
}

function renderSummary() {
  if (!state.signedIn) {
    els.workspaceSummary.textContent =
      "Sign in, upload a CV, and press Help find jobs to start matching roles and preparing the browser flow.";
    return;
  }

  const browserText = state.browser.granted ? "browser access is ready" : "browser access is still locked";
  const runText =
    state.run.phase === "idle"
      ? "The workspace is ready for a run."
      : state.run.phase === "browser-wait"
      ? "The AI is waiting for browser access to continue."
      : state.run.phase === "complete"
      ? "The current run is complete."
      : "The AI is working through the queue.";

  els.workspaceSummary.textContent = `${state.user.name || "The workspace"} is signed in. ${runText} ${browserText}.`;
}

function renderControls() {
  const runReady = state.signedIn && Boolean(state.user.cvFileName);
  els.helpFindJobsButton.disabled = !runReady || state.run.active;
  els.pauseRunButton.disabled = !state.run.active;
  els.browserAccessButton.disabled = !state.signedIn || state.browser.granted;
  els.browserConsent.checked = Boolean(state.browser.consented);
  els.cvHint.textContent = state.user.cvFileName ? `CV submitted: ${state.user.cvFileName}` : "No CV submitted yet.";
}

function renderShell() {
  renderIdentity();
  renderSummary();
  renderMetrics();
  renderStepper();
  renderJobs();
  renderActivity();
  renderControls();
  setRunPhase(state.run.phase || "idle");
  saveState();
}

function setSignedIn(payload) {
  state.signedIn = true;
  state.user = {
    ...state.user,
    name: payload.name,
    email: payload.email,
    market: payload.market,
    role: payload.role,
    cvFileName: payload.cvFileName,
    cvUploadedAt: new Date().toISOString()
  };
  state.browser.consented = false;
  pushActivity(`Workspace created for ${payload.name}.`);
  if (payload.cvFileName) {
    pushActivity(`CV uploaded: ${payload.cvFileName}.`);
  }
  state.run = initialRunSummary();
  state.jobs = [];
  renderShell();
}

function switchAccount() {
  state = structuredCloneDefault();
  runToken += 1;
  resetActivity("Workspace reset. Waiting for sign in.");
  saveState();
  renderShell();
}

function pauseRun() {
  if (!state.run.active) return;
  runToken += 1;
  state.run.active = false;
  state.run.paused = true;
  pushActivity("Run paused by user.");
  state.run.phase = "idle";
  state.run.progress = state.run.progress || 0;
  renderShell();
}

function setBrowserGranted() {
  if (!state.signedIn) return;
  if (!state.browser.consented) {
    pushActivity("Tick the browser consent box first.");
    renderShell();
    return;
  }

  state.browser.granted = true;
  pushActivity("Browser access granted on this laptop.");
  if (state.run.phase === "browser-wait" || state.run.paused) {
    continueRun();
  } else {
    renderShell();
  }
}

function addJobFocusLog(job) {
  pushActivity(`Focused on ${job.title} at ${job.company}.`);
  renderShell();
}

function openBrief(job) {
  pushActivity(`Opened brief for ${job.title}.`);
  const target = state.jobs.find((item) => item.id === job.id);
  if (target && target.status === "Matched") {
    target.status = "Tailor CV";
  }
  renderShell();
}

function buildRunJobs() {
  state.jobs = buildJobs(state.user);
  state.run.jobsFound = state.jobs.length;
  state.run.draftsReady = 0;
  state.run.approvalQueue = 0;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startRun() {
  if (!state.signedIn || !state.user.cvFileName) {
    pushActivity("Upload a CV before starting the run.");
    renderShell();
    return;
  }

  if (state.run.active) return;

  runToken += 1;
  const token = runToken;

  buildRunJobs();
  state.run.active = true;
  state.run.paused = false;
  state.run.browserConnected = false;
  state.run.jobsFound = state.jobs.length;
  state.run.draftsReady = 0;
  state.run.approvalQueue = 0;
  setRunPhase("matching");
  pushActivity("Matching the uploaded CV against live jobs.");
  renderShell();

  await delay(900);
  if (token !== runToken) return;

  state.jobs[0].status = "Tailor CV";
  state.jobs[1].status = "Tailor CV";
  state.run.draftsReady = 2;
  setRunPhase("tailoring");
  pushActivity("Tailoring CV bullets and cover-letter lines.");
  renderShell();

  await delay(900);
  if (token !== runToken) return;

  state.jobs[2].status = "Browser ready";
  state.jobs[3].status = "Awaiting approval";
  state.jobs[4].status = "Tracking";
  state.run.draftsReady = 3;
  state.run.approvalQueue = 2;
  setRunPhase("browser-wait");
  pushActivity("Browser access is needed to open approved pages.");
  state.run.active = false;
  state.run.paused = true;
  renderShell();

  if (state.browser.granted) {
    continueRun(token);
  }
}

async function continueRun(existingToken) {
  const token = existingToken || ++runToken;
  if (!state.browser.granted) return;

  state.run.active = true;
  state.run.paused = false;
  state.run.browserConnected = true;
  setRunPhase("browser-live");
  pushActivity("Browser helper connected on this laptop.");
  renderShell();

  await delay(900);
  if (token !== runToken) return;

  state.run.draftsReady = state.jobs.length;
  state.run.approvalQueue = state.jobs.length;
  state.jobs = state.jobs.map((job, index) => ({
    ...job,
    status: index < 2 ? "Browser ready" : index === 2 ? "Awaiting approval" : "Tracking"
  }));
  setRunPhase("approval");
  pushActivity("Drafts are staged and waiting for review.");
  renderShell();

  await delay(700);
  if (token !== runToken) return;

  state.run.active = false;
  state.run.paused = false;
  setRunPhase("complete");
  pushActivity("Run complete. Open the report to review the queue.");
  renderShell();
}

function submitSignIn(event) {
  event.preventDefault();
  const formData = new FormData(els.signInForm);
  const file = els.cvUpload.files && els.cvUpload.files[0];

  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    market: String(formData.get("market") || "Hong Kong"),
    role: String(formData.get("role") || "").trim(),
    cvFileName: file ? file.name : ""
  };

  if (!payload.cvFileName) {
    pushActivity("Please upload a CV before signing in.");
    renderShell();
    return;
  }

  setSignedIn(payload);
}

function resetWorkspace() {
  runToken += 1;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredCloneDefault();
  resetActivity("Workspace reset. Waiting for sign in.");
  renderShell();
}

function handleQueueClick(event) {
  const openBriefButton = event.target.closest("[data-open-brief]");
  const focusButton = event.target.closest("[data-focus-job]");

  if (openBriefButton) {
    const job = state.jobs.find((item) => item.id === openBriefButton.dataset.openBrief);
    if (job) openBrief(job);
  }

  if (focusButton) {
    const job = state.jobs.find((item) => item.id === focusButton.dataset.focusJob);
    if (job) addJobFocusLog(job);
  }
}

function init() {
  renderStepper();
  if (!state.activity.length) {
    resetActivity("Workspace loaded. Sign in to start.");
  }
  renderShell();

  els.signInForm.addEventListener("submit", submitSignIn);
  els.helpFindJobsButton.addEventListener("click", startRun);
  els.pauseRunButton.addEventListener("click", pauseRun);
  els.resetWorkspaceButton.addEventListener("click", resetWorkspace);
  els.switchAccountButton.addEventListener("click", switchAccount);
  els.browserAccessButton.addEventListener("click", setBrowserGranted);
  els.browserConsent.addEventListener("change", () => {
    state.browser.consented = els.browserConsent.checked;
    if (state.browser.consented) {
      pushActivity("Browser consent marked for this laptop.");
    }
    saveState();
    renderControls();
  });
  els.jobQueue.addEventListener("click", handleQueueClick);

  if (state.signedIn && state.user.cvFileName && state.browser.granted && state.run.phase === "browser-wait") {
    continueRun();
  }
}

init();

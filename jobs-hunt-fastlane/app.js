const form = document.getElementById("intakeForm");
const output = document.getElementById("output");
const regionInput = document.getElementById("regionInput");
const regionOptions = document.getElementById("regionOptions");
const platformCheckboxes = document.getElementById("platformCheckboxes");
const credentialFields = document.getElementById("credentialFields");
const refreshBtn = document.getElementById("refreshBtn");
const runQueueList = document.getElementById("runQueueList");
const applicationPackForm = document.getElementById("applicationPackForm");
const applicationRunId = document.getElementById("applicationRunId");
const jobTargetsInput = document.getElementById("jobTargetsInput");
const refreshApplicationsBtn = document.getElementById("refreshApplicationsBtn");
const applicationsList = document.getElementById("applicationsList");
const refreshCredentialsBtn = document.getElementById("refreshCredentialsBtn");
const credentialList = document.getElementById("credentialList");

const metricQueued = document.getElementById("metricQueued");
const metricApprovedRuns = document.getElementById("metricApprovedRuns");
const localAgentPanel = document.getElementById("localAgentPanel");
const agentStatus = document.getElementById("agentStatus");
const localAgentForm = document.getElementById("localAgentForm");
const localAgentTokenInput = document.getElementById("localAgentToken");
const clearLocalAgentTokenBtn = document.getElementById("clearLocalAgentToken");
const authPanel = document.getElementById("authPanel");
const signedInBadge = document.getElementById("signedInBadge");
const authStatus = document.getElementById("authStatus");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");
const statusBox = document.querySelector(".status-box");

const API_BASE = (window.JOBS_HUNT_API_BASE || "").replace(/\/$/, "");
let authToken = localStorage.getItem("jobsHuntAuthToken") || "";
let localAgentToken = localStorage.getItem("jobsHuntLocalAgentToken") || "";
let localAgentPaired = false;
let cachedRuns = [];
const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

const REGION_PLATFORM_MAP = {
  "Hong Kong": [
    "LinkedIn",
    "JobsDB",
    "Indeed",
    "CTgoodjobs",
    "CPJobs",
    "JobMarket",
    "Recruit.com.hk",
    "HKSlash",
    "foundit",
    "Moovup",
    "eFinancialCareers",
    "Company pages"
  ],
  China: [
    "BOSS Zhipin",
    "Zhaopin",
    "51job",
    "Liepin",
    "Lagou",
    "Maimai",
    "58.com",
    "Ganji",
    "Yingjiesheng",
    "WeChat official accounts",
    "Company pages"
  ],
  Singapore: [
    "LinkedIn",
    "MyCareersFuture",
    "JobStreet",
    "Indeed",
    "JobsDB",
    "JobsCentral",
    "FastJobs",
    "Glints",
    "foundit",
    "NodeFlair",
    "Tech in Asia Jobs",
    "Careers@Gov",
    "STJobs",
    "eFinancialCareers",
    "Company pages"
  ],
  Malaysia: [
    "LinkedIn",
    "JobStreet",
    "Indeed",
    "Hiredly",
    "Maukerja",
    "Ricebowl",
    "MYFutureJobs",
    "Jobstore",
    "foundit",
    "FastJobs",
    "MyStarJob",
    "Jora",
    "GrabJobs",
    "Bossjob",
    "Company pages"
  ],
  "United Kingdom": [
    "LinkedIn",
    "Indeed",
    "Reed",
    "CV-Library",
    "Totaljobs",
    "Monster",
    "Adzuna",
    "Glassdoor",
    "GOV.UK Find a job",
    "Guardian Jobs",
    "jobs.ac.uk",
    "CWJobs",
    "JobServe",
    "NHS Jobs",
    "Civil Service Jobs",
    "Company pages"
  ],
  "United States": [
    "LinkedIn",
    "Indeed",
    "ZipRecruiter",
    "Glassdoor",
    "Monster",
    "CareerBuilder",
    "Dice",
    "Built In",
    "Wellfound",
    "FlexJobs",
    "USAJOBS",
    "Handshake",
    "Snagajob",
    "The Muse",
    "Ladders",
    "SimplyHired",
    "Idealist",
    "Company pages"
  ],
  Canada: [
    "LinkedIn",
    "Indeed",
    "Job Bank",
    "Workopolis",
    "Glassdoor",
    "Monster",
    "ZipRecruiter",
    "Eluta",
    "Jobillico",
    "Talent.com",
    "Jobboom",
    "TalentEgg",
    "CharityVillage",
    "Jobs.ca",
    "SimplyHired",
    "Company pages"
  ],
  Australia: [
    "LinkedIn",
    "SEEK",
    "Indeed",
    "Jora",
    "CareerOne",
    "Adzuna",
    "Workforce Australia",
    "Careerjet",
    "GradConnection",
    "EthicalJobs",
    "ArtsHub",
    "FlexCareers",
    "Gumtree Jobs",
    "Sidekicker",
    "Company pages"
  ],
  "United Arab Emirates": [
    "LinkedIn",
    "Bayt",
    "Naukrigulf",
    "GulfTalent",
    "Indeed UAE",
    "Dubizzle Jobs",
    "foundit Gulf",
    "Laimoon",
    "Khaleej Times Jobs",
    "Gulf News Careers",
    "Oliv",
    "Hays UAE",
    "Gulf Jobs",
    "UAE Government Jobs",
    "Dubai Careers",
    "Company pages"
  ]
};

const NO_LOGIN_PLATFORMS = new Set(["Company pages"]);

function platformRequiresCredentials(platform) {
  return !NO_LOGIN_PLATFORMS.has(platform);
}

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setOutput(value) {
  output.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  animateElement(statusBox, "is-updated");
}

function animateElement(element, className) {
  if (!element || shouldReduceMotion) {
    return;
  }

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function setMetricValue(element, value) {
  const nextValue = String(value);
  if (element.textContent === nextValue) {
    return;
  }

  element.textContent = nextValue;
  animateElement(element, "metric-bump");
}

function setupScrollMotion() {
  const targets = [
    ...document.querySelectorAll(
      ".trust-strip, .section-intro, .feature-card, .public-path, .trust-card, .motion-story, .dashboard-preview, .proof-pack, .sample-card, .timeline article, .app-shell, .panel, .grid-two, .price-card, .item-card"
    ),
  ];

  targets.forEach((target, index) => {
    target.classList.add("reveal-on-scroll");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
  });

  if (shouldReduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  targets.forEach((target) => observer.observe(target));
}

function setupConversionDock() {
  const dock = document.querySelector(".conversion-dock");
  if (!dock) {
    return;
  }

  const updateDock = () => {
    document.body.classList.toggle("show-conversion-dock", window.scrollY > 520);
  };

  updateDock();
  window.addEventListener("scroll", updateDock, { passive: true });
}

async function videoFileExists(src) {
  try {
    const response = await fetch(src, { method: "HEAD", cache: "no-store" });
    if (response.ok) return true;

    if (response.status === 405) {
      const fallback = await fetch(src, {
        cache: "no-store",
        headers: { Range: "bytes=0-0" },
      });
      return fallback.ok;
    }
  } catch (error) {
    return false;
  }

  return false;
}

function revealAutoplayVideo(video) {
  const src = video.dataset.videoSrc;
  if (!src) return;

  const frame = video.closest(".hero-backdrop, .dashboard-preview");
  const badge = frame?.querySelector("[data-video-badge]");

  video.src = src;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.hidden = false;
  frame?.classList.add("has-video");

  if (badge) {
    badge.hidden = false;
  }

  const playAttempt = video.play();
  if (playAttempt && typeof playAttempt.catch === "function") {
    playAttempt.catch(() => {
      frame?.classList.remove("has-video");
      video.hidden = true;
      if (badge) {
        badge.hidden = true;
      }
    });
  }
}

async function setupDemoVideos() {
  const videos = [...document.querySelectorAll("[data-demo-video]")];
  const src = videos.find((video) => video.dataset.videoSrc)?.dataset.videoSrc;
  if (!src || !(await videoFileExists(src))) {
    return;
  }

  videos.forEach(revealAutoplayVideo);
}

async function fetchJson(url, options) {
  const opts = options || {};
  const headers = new Headers(opts.headers || {});
  if (localAgentToken) headers.set("X-Jobs-Hunt-Agent-Token", localAgentToken);
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
  const response = await fetch(apiUrl(url), { ...opts, headers });
  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : {};
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function setAgentState(paired, message = "") {
  localAgentPaired = paired;
  localAgentPanel.classList.toggle("is-paired", paired);
  agentStatus.textContent = message || (paired
    ? "Paired with this PC's local Jobs Hunt agent."
    : "Paste this PC's token from data/local_agent_token.txt before signing in.");
  if (paired && localAgentTokenInput.value !== localAgentToken) {
    localAgentTokenInput.value = localAgentToken;
  }
}

function setAuthState(loggedIn, email = "") {
  const paired = localAgentPaired;
  document.querySelectorAll(".requires-auth").forEach((el) => {
    el.style.display = paired && loggedIn ? "" : "none";
  });

  authPanel.style.display = paired && !loggedIn ? "" : "none";
  signedInBadge.textContent = loggedIn ? `Signed in as ${email}` : "Signed in.";

  authStatus.textContent = !paired
    ? "Pair this browser with the local PC agent first."
    : loggedIn
    ? `Signed in as ${email}`
    : "Sign in to access your private pipeline data.";
}

async function checkLocalAgentPairing() {
  if (!localAgentToken) {
    setAgentState(false);
    setAuthState(false);
    return false;
  }

  try {
    await fetchJson("/api/local-agent/pairing");
    setAgentState(true);
    return true;
  } catch (error) {
    setAgentState(false, `Pairing failed: ${error.message}`);
    setAuthState(false);
    return false;
  }
}

function renderRegionOptions() {
  regionOptions.innerHTML = Object.keys(REGION_PLATFORM_MAP)
    .map((region) => `<option value="${escapeHtml(region)}"></option>`)
    .join("");
}

function selectedPlatforms() {
  return Array.from(platformCheckboxes.querySelectorAll('input[name="platforms"]:checked')).map(
    (input) => input.value
  );
}

function renderCredentialFields(platforms) {
  if (!platforms.length) {
    credentialFields.innerHTML = "";
    return;
  }

  const credentialPlatforms = platforms.filter(platformRequiresCredentials);
  if (!credentialPlatforms.length) {
    credentialFields.innerHTML = `
      <p class="credential-note">
        This run can start with public/company-page research. Add platform logins later only if you approve
        automation for a site that needs them.
      </p>
    `;
    return;
  }

  credentialFields.innerHTML = [
    `
      <p class="credential-note">
        Credentials are optional at queue time. Leave these blank to start with research and drafts first; add
        logins only when you approve platform automation.
      </p>
    `,
    ...credentialPlatforms.map(
      (platform) => `
      <fieldset>
        <legend>${escapeHtml(platform)} login (optional for queue)</legend>
        <label>
          Username / Email
          <input data-platform="${escapeHtml(platform)}" data-kind="username" autocomplete="username" placeholder="Add later if unsure" />
        </label>
        <label>
          Password
          <input data-platform="${escapeHtml(platform)}" data-kind="password" type="password" autocomplete="current-password" placeholder="Only needed before approved login automation" />
        </label>
      </fieldset>
    `
    )
  ].join("");
}

function setPlatformsForRegion(region) {
  const platforms = REGION_PLATFORM_MAP[region] || [];
  platformCheckboxes.innerHTML = platforms
    .map(
      (platform) => `
      <label class="checkbox-row">
        <input type="checkbox" name="platforms" value="${escapeHtml(platform)}" ${
        platform === "Company pages" ? "checked" : ""
      } />
        ${escapeHtml(platform)}
      </label>
    `
    )
    .join("");
  renderCredentialFields(selectedPlatforms());
}

function collectCredentialPayload(platforms) {
  const payload = {};
  for (const platform of platforms) {
    if (!platformRequiresCredentials(platform)) {
      continue;
    }

    const usernameInput = credentialFields.querySelector(
      `input[data-platform="${CSS.escape(platform)}"][data-kind="username"]`
    );
    const passwordInput = credentialFields.querySelector(
      `input[data-platform="${CSS.escape(platform)}"][data-kind="password"]`
    );

    const username = usernameInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    if (!username && !password) {
      continue;
    }
    if (!username || !password) {
      throw new Error(`Both username and password are required when saving credentials for ${platform}.`);
    }

    payload[platform] = { username, password };
  }
  return payload;
}

function formatStatusCounts(statusCounts) {
  if (!statusCounts || typeof statusCounts !== "object") return "";
  return Object.entries(statusCounts)
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");
}

function renderProgress(progress) {
  const detail = progress || {};
  const warnings = Array.isArray(detail.warnings) ? detail.warnings : [];
  const roleSuggestions = Array.isArray(detail.roleSuggestions) ? detail.roleSuggestions : [];
  const statusCounts = formatStatusCounts(detail.statusCounts);
  const localAutomation = detail.localAutomation || {};
  return `
    <div class="run-progress progress-${escapeHtml(detail.status || "unknown")}">
      <div class="progress-line">
        <span>Progress</span>
        <strong>${escapeHtml(detail.label || "No progress yet")}</strong>
      </div>
      <div class="progress-meta">
        <span>${Number(detail.itemCount || 0)} packs</span>
        <span>${Number(detail.suggestedRoleCount || 0)} role tracks</span>
        <span>${detail.reportReady ? "Report ready" : "No report yet"}</span>
        ${detail.roleDiscoverySource ? `<span>${escapeHtml(detail.roleDiscoverySource)}</span>` : ""}
        ${statusCounts ? `<span>${escapeHtml(statusCounts)}</span>` : ""}
        ${localAutomation.status ? `<span>Codex ${escapeHtml(localAutomation.status)}</span>` : ""}
      </div>
      ${
        localAutomation.logPath
          ? `<p class="fineprint">Local Codex log: ${escapeHtml(localAutomation.logPath)}</p>`
          : ""
      }
      ${
        roleSuggestions.length
          ? `<div class="role-suggestions">${roleSuggestions
              .slice(0, 3)
              .map(
                (item) =>
                  `<span>${escapeHtml(item.roleTitle || "Role track")} ${
                    item.fitScore ? `(${escapeHtml(item.fitScore)})` : ""
                  }</span>`
              )
              .join("")}</div>`
          : ""
      }
      ${warnings.map((warning) => `<p class="warning-line">${escapeHtml(warning)}</p>`).join("")}
      <p class="fineprint">${escapeHtml(detail.sendGate || "Nothing has been sent.")}</p>
    </div>
  `;
}

function renderRuns(items) {
  cachedRuns = items.slice();
  if (!items.length) {
    runQueueList.innerHTML = '<p class="empty">No runs queued yet.</p>';
    setMetricValue(metricQueued, "0");
    setMetricValue(metricApprovedRuns, "0");
    applicationRunId.innerHTML = '<option value="">Select a run</option>';
    return;
  }

  const queued = items.filter((item) => item.status !== "approved_for_automation").length;
  const approved = items.filter((item) => item.status === "approved_for_automation").length;
  setMetricValue(metricQueued, queued);
  setMetricValue(metricApprovedRuns, approved);

  runQueueList.innerHTML = items
    .slice()
    .reverse()
    .map((item) => {
      const progress = item.automationProgress || {};
      return `
      <article class="item-card compact">
        <div class="item-head">
          <h3>${escapeHtml(item.id)} <span>${escapeHtml(item.targetLocation || "No region")}</span></h3>
          <span class="pill">${escapeHtml(item.status || "queued")}</span>
        </div>
        <p class="muted">Role preference: ${escapeHtml(item.rolePreference || item.targetRole || "CV-guided matching")}</p>
        <p class="muted">Platforms: ${(item.platforms || []).map((p) => escapeHtml(p)).join(", ") || "n/a"}</p>
        <p class="muted">Auto account creation: ${item.autoCreateAccount ? "Yes" : "No"}</p>
        <p class="muted">Created: ${escapeHtml(item.createdAt || "")}</p>
        ${renderProgress(progress)}
        <div class="card-actions">
          <button data-action="approve-run" data-id="${escapeHtml(item.id)}">
            ${item.status === "approved_for_automation" ? "Check Local Codex" : "Approve & Start Codex"}
          </button>
          <button data-action="view-report" data-id="${escapeHtml(item.id)}" class="ghost" ${
            progress.reportReady ? "" : "disabled"
          }>View Report</button>
          <button data-action="use-run" data-id="${escapeHtml(item.id)}" class="ghost">Use For Packs</button>
        </div>
      </article>
    `;
    })
    .join("");

  applicationRunId.innerHTML = [
    '<option value="">Select a run</option>',
    ...items
      .slice()
      .reverse()
      .map(
        (item) =>
          `<option value="${escapeHtml(item.id)}">${escapeHtml(item.id)} - ${escapeHtml(
            item.rolePreference || item.targetRole || "CV-guided matching"
          )} - ${escapeHtml(item.targetLocation || "No region")}</option>`
      )
  ].join("");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function parseJobTargetLine(line) {
  const parts = line.split("|").map((part) => part.trim());
  if (parts.length < 2) {
    throw new Error(`Each target line needs at least job title and company: ${line}`);
  }
  const [jobTitle, company, platform = "LinkedIn", companyUrl = "", jobUrl = "", companyContext = ""] = parts;
  if (!jobTitle || !company) {
    throw new Error(`Missing job title or company in line: ${line}`);
  }
  return { jobTitle, company, platform, companyUrl, jobUrl, companyContext };
}

function collectJobTargets() {
  const raw = jobTargetsInput.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!raw.length) {
    throw new Error("Add at least one target company line.");
  }
  return raw.map(parseJobTargetLine);
}

function renderApplications(items) {
  if (!items.length) {
    applicationsList.innerHTML = '<p class="empty">No application packs generated yet.</p>';
    return;
  }

  applicationsList.innerHTML = items
    .map((item) => {
      const research = item.research || {};
      const outreach = item.outreach || {};
      const drafts = item.drafts || {};
      const talkingPoints = Array.isArray(research.talkingPoints) ? research.talkingPoints : [];
      const researchTasks = Array.isArray(research.researchTasks) ? research.researchTasks : [];
      return `
      <article class="item-card">
        <div class="item-head">
          <h3>${escapeHtml(item.company)} <span>${escapeHtml(item.jobTitle || "Target role")}</span></h3>
          <span class="pill status-${escapeHtml((item.status || "drafted").toLowerCase())}">${escapeHtml(
            item.status || "drafted"
          )}</span>
        </div>
        <p class="muted">Platform: ${escapeHtml(item.platform || "n/a")}</p>
        <p class="muted">Draft source: ${escapeHtml(item.draftSource || "template")}</p>
        ${
          item.companyUrl
            ? `<p class="muted">Company URL: <a href="${escapeHtml(item.companyUrl)}" target="_blank" rel="noreferrer">${escapeHtml(
                item.companyUrl
              )}</a></p>`
            : ""
        }
        ${
          item.jobUrl
            ? `<p class="muted">Job URL: <a href="${escapeHtml(item.jobUrl)}" target="_blank" rel="noreferrer">${escapeHtml(
                item.jobUrl
              )}</a></p>`
            : ""
        }

        <details open>
          <summary>Company research</summary>
          <p class="muted">${escapeHtml(research.companySummary || "No company summary yet.")}</p>
          <p class="muted">${escapeHtml(research.whyItMayFit || "")}</p>
          <div class="chip-list">
            ${talkingPoints.map((point) => `<span class="chip">${escapeHtml(point)}</span>`).join("")}
          </div>
          <div class="detail-block">
            ${researchTasks.map((task) => `<p class="muted">- ${escapeHtml(task)}</p>`).join("")}
          </div>
          <p class="fineprint">${escapeHtml(research.sourceCaution || "")}</p>
        </details>

        <details>
          <summary>Application drafts</summary>
          <div class="detail-block">
            <p class="detail-label">Cover letter</p>
            <p class="mono">${escapeHtml(drafts.coverLetter || "")}</p>
            <p class="detail-label">Cold message</p>
            <p class="mono">${escapeHtml(drafts.coldMessage || "")}</p>
          </div>
        </details>

        <details>
          <summary>Outreach pack</summary>
          <div class="detail-block">
            <p class="detail-label">Recruiter search</p>
            <p class="mono">${escapeHtml(outreach.recruiterSearch || "")}</p>
            <p class="detail-label">Recruiter message</p>
            <p class="mono">${escapeHtml(outreach.recruiterMessage || "")}</p>
            <p class="detail-label">Hiring manager search</p>
            <p class="mono">${escapeHtml(outreach.hiringManagerSearch || "")}</p>
            <p class="detail-label">Hiring manager message</p>
            <p class="mono">${escapeHtml(outreach.hiringManagerMessage || "")}</p>
            <p class="detail-label">Teammate search</p>
            <p class="mono">${escapeHtml(outreach.teammateSearch || "")}</p>
            <p class="detail-label">Teammate message</p>
            <p class="mono">${escapeHtml(outreach.teammateMessage || "")}</p>
            <p class="detail-label">Follow-up message</p>
            <p class="mono">${escapeHtml(outreach.followUpMessage || "")}</p>
          </div>
        </details>
      </article>
    `;
    })
    .join("");
}

function renderCredentials(items) {
  if (!items.length) {
    credentialList.innerHTML = '<p class="empty">No stored platform credentials yet.</p>';
    return;
  }

  credentialList.innerHTML = items
    .map(
      (item) => `
      <article class="item-card compact credential-card">
        <div class="item-head">
          <h3>${escapeHtml(item.platform || "Platform")} <span>${escapeHtml(item.usernamePreview || "saved")}</span></h3>
          <span class="pill">${escapeHtml(item.secretKind || "secret")}</span>
        </div>
        <p class="muted">Run: ${escapeHtml(item.runId || "n/a")}</p>
        <p class="muted">Key version: ${escapeHtml(item.keyVersion || "n/a")}</p>
        <p class="muted">Updated: ${escapeHtml(item.updatedAt || "")}</p>
        <p class="muted">Last used: ${escapeHtml(item.lastUsedAt || "Never")}</p>
        <div class="card-actions">
          <button data-action="delete-credential" data-id="${escapeHtml(item.id)}" class="danger">Delete</button>
        </div>
      </article>
    `
    )
    .join("");
}

async function refreshCredentials() {
  if (!authToken) return;
  const credentials = await fetchJson("/api/platform-credentials");
  renderCredentials(credentials.items || []);
}

async function refreshApplications() {
  if (!authToken) return;
  const applications = await fetchJson("/api/applications");
  renderApplications(applications.items || []);
}

async function refreshAll() {
  const paired = await checkLocalAgentPairing();
  if (!paired) {
    return;
  }

  if (!authToken) {
    setAuthState(false);
    runQueueList.innerHTML = "";
    applicationsList.innerHTML = "";
    credentialList.innerHTML = "";
    return;
  }

  const me = await fetchJson("/api/auth/me");
  setAuthState(true, me.user.email);

  const intakes = await fetchJson("/api/intakes");
  renderRuns(intakes.items);
  await refreshApplications();
  await refreshCredentials();
}

regionInput.addEventListener("input", () => {
  setPlatformsForRegion(regionInput.value.trim());
});

platformCheckboxes.addEventListener("change", () => {
  renderCredentialFields(selectedPlatforms());
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setOutput("Submitting run...");

  try {
    const platforms = selectedPlatforms();
    if (!platforms.length) {
      throw new Error("Select at least one platform.");
    }

    const credentialPayload = collectCredentialPayload(platforms);
    const data = new FormData(form);
    data.set("platformCredentials", JSON.stringify(credentialPayload));

    const payload = await fetchJson("/api/intake", {
      method: "POST",
      body: data
    });

    setOutput(payload);
    form.reset();
    setPlatformsForRegion("");
    await refreshAll();
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

refreshBtn.addEventListener("click", async () => {
  try {
    await refreshAll();
    setOutput("Run queue refreshed.");
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

runQueueList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.tagName !== "BUTTON") return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!id) return;

  if (action === "use-run") {
    applicationRunId.value = id;
    jobTargetsInput.focus();
    return;
  }

  if (action === "view-report") {
    try {
      const payload = await fetchJson(`/api/intakes/${id}/automation-report`);
      setOutput(payload.reportMarkdown || payload);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
    return;
  }

  if (action !== "approve-run") return;

  try {
    const payload = await fetchJson(`/api/intakes/${id}/approve-automation`, { method: "POST" });
    setOutput({
      message: payload.message,
      localAutomation: payload.localAutomation,
      report: payload.automationReport?.reportPath || ""
    });
    await refreshAll();
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

applicationPackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setOutput("Generating company research and outreach packs...");

  try {
    const runId = normalizeText(applicationRunId.value);
    if (!runId) {
      throw new Error("Select a source run.");
    }
    const jobs = collectJobTargets();

    const payload = await fetchJson("/api/generate-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, jobs })
    });

    setOutput(payload);
    await refreshAll();
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

refreshApplicationsBtn.addEventListener("click", async () => {
  try {
    await refreshApplications();
    setOutput("Applications refreshed.");
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

refreshCredentialsBtn.addEventListener("click", async () => {
  try {
    await refreshCredentials();
    setOutput("Stored credentials refreshed.");
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

credentialList.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.tagName !== "BUTTON") return;
  if (target.dataset.action !== "delete-credential") return;

  const id = target.dataset.id;
  if (!id) return;

  try {
    const payload = await fetchJson(`/api/platform-credentials/${id}`, { method: "DELETE" });
    setOutput(payload);
    await refreshCredentials();
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

localAgentTokenInput.value = localAgentToken;

localAgentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  localAgentToken = localAgentTokenInput.value.trim();
  localStorage.setItem("jobsHuntLocalAgentToken", localAgentToken);
  const paired = await checkLocalAgentPairing();
  if (paired) {
    setOutput("Local PC paired. You can sign in now.");
    if (authToken) {
      await refreshAll();
    }
  }
});

clearLocalAgentTokenBtn.addEventListener("click", () => {
  localAgentToken = "";
  localAgentTokenInput.value = "";
  localStorage.removeItem("jobsHuntLocalAgentToken");
  setAgentState(false);
  setAuthState(false);
  setOutput("Local pairing token forgotten.");
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = await fetchJson("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value
      })
    });
    authToken = payload.token;
    localStorage.setItem("jobsHuntAuthToken", authToken);
    setOutput("Registered and signed in.");
    await refreshAll();
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const payload = await fetchJson("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
      })
    });
    authToken = payload.token;
    localStorage.setItem("jobsHuntAuthToken", authToken);
    setOutput("Logged in.");
    await refreshAll();
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  }
});

logoutBtn.addEventListener("click", () => {
  authToken = "";
  localStorage.removeItem("jobsHuntAuthToken");
  setAuthState(false);
  setOutput("Logged out.");
});

setupScrollMotion();
setupConversionDock();
setupDemoVideos();
renderRegionOptions();
setPlatformsForRegion("");
checkLocalAgentPairing()
  .then((paired) => {
    setAuthState(Boolean(authToken));
    if (paired) {
      return refreshAll();
    }
    return null;
  })
  .catch((error) => {
    setOutput(`Error: ${error.message}`);
  });

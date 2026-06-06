const API_STORAGE_KEY = "icEducate.apiBase";

const fallbackSyllabi = [
  "Cambridge IGCSE",
  "Cambridge International AS & A Level",
  "HKDSE",
  "IB MYP",
  "IB Diploma",
  "Singapore PSLE",
  "UK GCSE",
];

const fallbackYears = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

const fallbackSubjectTopics = {
  Mathematics: ["Algebra", "Geometry", "Trigonometry", "Statistics", "Number", "Calculus"],
  Physics: ["Motion", "Forces", "Energy", "Waves", "Electricity", "Thermal Physics"],
  Chemistry: ["Atomic Structure", "Bonding", "Stoichiometry", "Electrolysis", "Organic Chemistry"],
  Biology: ["Cells", "Enzymes", "Genetics", "Ecology", "Photosynthesis"],
  English: ["Reading", "Writing", "Grammar", "Speaking", "Listening"],
  Chinese: ["Reading Comprehension", "Writing", "Vocabulary", "Classical Chinese"],
};

const sampleLinks = {
  Mathematics: {
    html: "worksheets/psle_topical_math_science/PSLE_Mathematics_Full_Exam_Style_Pack.html",
    pdf: "worksheets/psle_topical_math_science/PSLE_Mathematics_Full_Exam_Style_Pack.pdf",
  },
  Science: {
    html: "worksheets/psle_topical_math_science/PSLE_Science_Full_Exam_Style_Pack.html",
    pdf: "worksheets/psle_topical_math_science/PSLE_Science_Full_Exam_Style_Pack.pdf",
  },
};

const pathPrefix = window.location.pathname.toLowerCase().includes("/login") ? "../" : "./";
const state = {
  apiBase: "",
  apiOnline: false,
  options: null,
  library: null,
  subjectTopics: { ...fallbackSubjectTopics },
  topicIdByTitle: new Map(),
};

const syllabusInput = document.querySelector("#syllabus");
const yearInput = document.querySelector("#year");
const subjectSelect = document.querySelector("#subject");
const topicInput = document.querySelector("#topic");
const marksInput = document.querySelector("#marks");
const marksOutput = document.querySelector("#marksOutput");
const ruleNote = document.querySelector("#ruleNote");
const worksheetForm = document.querySelector("#worksheetForm");
const generationOutput = document.querySelector("#generationOutput");
const markingForm = document.querySelector("#markingForm");
const feedbackOutput = document.querySelector("#feedbackOutput");

let apiInput;
let apiStatus;
let librarySummary;
let libraryMatches;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const cleanApiBase = (value) => String(value || "").trim().replace(/\/+$/, "");

const getConfiguredApiBase = () => {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("api");
  if (fromQuery === "clear") {
    localStorage.removeItem(API_STORAGE_KEY);
    return "";
  }
  if (fromQuery) {
    const cleaned = cleanApiBase(fromQuery);
    localStorage.setItem(API_STORAGE_KEY, cleaned);
    return cleaned;
  }
  if (window.IC_EDUCATE_API_BASE) return cleanApiBase(window.IC_EDUCATE_API_BASE);
  return cleanApiBase(localStorage.getItem(API_STORAGE_KEY));
};

const createOptions = (datalist, values) => {
  datalist.replaceChildren(
    ...values.filter(Boolean).map((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      return option;
    }),
  );
};

const apiUrl = (path) => `${state.apiBase}${path.startsWith("/") ? path : `/${path}`}`;

const resolveApiUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/") && state.apiBase) return `${state.apiBase}${url}`;
  return url;
};

const apiJson = async (path, options = {}) => {
  if (!state.apiBase) throw new Error("No API URL configured.");
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `API returned HTTP ${response.status}`);
  }
  return data;
};

const insertConnectionPanel = () => {
  const panel = document.createElement("section");
  panel.className = "connection-panel";
  panel.innerHTML = `
    <div>
      <p class="eyebrow">Library access</p>
      <h2>Connect IC educate to the worksheet API.</h2>
      <p>
        GitHub Pages is static, so the full library comes from a backend URL.
        Use a public HTTPS API for live users, or localhost only while testing on this machine.
      </p>
    </div>
    <form class="api-form" id="apiForm">
      <label>
        <span>Worksheet API URL</span>
        <input id="apiBaseInput" type="url" placeholder="https://api.example.com or http://127.0.0.1:8001" />
      </label>
      <button class="button secondary" type="submit">Save API URL</button>
      <button class="button ghost" type="button" id="clearApiButton">Use demo mode</button>
      <div class="api-status" id="apiStatus">Demo mode: no backend URL configured.</div>
      <div class="library-summary" id="librarySummary">Library not loaded.</div>
      <div class="library-matches" id="libraryMatches"></div>
    </form>
  `;
  document.querySelector(".feature-strip").after(panel);
  apiInput = panel.querySelector("#apiBaseInput");
  apiStatus = panel.querySelector("#apiStatus");
  librarySummary = panel.querySelector("#librarySummary");
  libraryMatches = panel.querySelector("#libraryMatches");
  panel.querySelector("#apiForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const nextApi = cleanApiBase(apiInput.value);
    if (nextApi) {
      localStorage.setItem(API_STORAGE_KEY, nextApi);
      state.apiBase = nextApi;
    }
    loadBackend();
  });
  panel.querySelector("#clearApiButton").addEventListener("click", () => {
    localStorage.removeItem(API_STORAGE_KEY);
    state.apiBase = "";
    state.apiOnline = false;
    state.options = null;
    state.library = null;
    state.subjectTopics = { ...fallbackSubjectTopics };
    setFallbackControls();
    updateConnectionStatus("Demo mode: backend disabled.", "offline");
  });
};

const updateConnectionStatus = (message, mode = "offline") => {
  if (!apiStatus) return;
  apiStatus.textContent = message;
  apiStatus.classList.toggle("online", mode === "online");
  apiStatus.classList.toggle("offline", mode !== "online");
  if (librarySummary && mode !== "online") {
    librarySummary.textContent = "Library not loaded. Configure the API to search the full worksheet library.";
    libraryMatches.replaceChildren();
  }
};

const setSubjectOptions = (subjects = Object.keys(state.subjectTopics)) => {
  subjectSelect.replaceChildren(
    ...subjects.filter(Boolean).map((subject) => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      return option;
    }),
  );
  if (!subjects.includes(subjectSelect.value)) {
    subjectSelect.value = subjects.includes("Mathematics") ? "Mathematics" : subjects[0] || "";
  }
};

const setTopicOptions = () => {
  const topics = state.subjectTopics[subjectSelect.value] || [];
  createOptions(document.querySelector("#topicOptions"), topics);
  if (topics.length && !topics.includes(topicInput.value)) {
    topicInput.value = topics[0];
  }
};

const setFallbackControls = () => {
  createOptions(document.querySelector("#syllabusOptions"), fallbackSyllabi);
  createOptions(document.querySelector("#yearOptions"), fallbackYears);
  setSubjectOptions(Object.keys(state.subjectTopics));
  setTopicOptions();
};

const applyBackendOptions = (options) => {
  const topicalSubjects = Array.isArray(options?.topical?.subjects) ? options.topical.subjects : [];
  const libraryFacets = options?.library?.facets || {};
  const syllabi = [
    ...(Array.isArray(libraryFacets.syllabus) ? libraryFacets.syllabus.map((item) => item.label) : []),
    "Cambridge IGCSE",
  ];
  const years = new Set(fallbackYears);
  const subjectTopics = {};

  topicalSubjects.forEach((subject) => {
    if (Array.isArray(subject.years)) subject.years.forEach((year) => years.add(String(year)));
    const topics = Array.isArray(subject.topicPacks) ? subject.topicPacks : [];
    subjectTopics[subject.label] = topics.map((topic) => topic.title).filter(Boolean);
    topics.forEach((topic) => {
      if (topic.title && topic.id) state.topicIdByTitle.set(`${subject.label}::${topic.title}`, topic.id);
    });
  });

  const librarySubjects = Array.isArray(libraryFacets.subject)
    ? libraryFacets.subject.map((item) => item.label).filter(Boolean)
    : [];
  librarySubjects.forEach((subject) => {
    if (!subjectTopics[subject]) subjectTopics[subject] = fallbackSubjectTopics[subject] || [];
  });

  state.subjectTopics = Object.keys(subjectTopics).length ? subjectTopics : { ...fallbackSubjectTopics };
  createOptions(document.querySelector("#syllabusOptions"), [...new Set(syllabi.filter(Boolean))]);
  createOptions(document.querySelector("#yearOptions"), [...years].sort((a, b) => Number(b) - Number(a)));
  setSubjectOptions(Object.keys(state.subjectTopics));
  setTopicOptions();
};

const renderLibraryMatches = (items = []) => {
  if (!libraryMatches) return;
  libraryMatches.replaceChildren(
    ...items.slice(0, 6).map((item) => {
      const href = resolveApiUrl(item.localUrl || item.url || item.sources_url || "");
      const node = document.createElement(href ? "a" : "span");
      node.className = "library-match";
      if (href) {
        node.href = href;
        node.target = "_blank";
        node.rel = "noreferrer";
      }
      node.textContent = item.title || item.filename || "Library item";
      return node;
    }),
  );
};

const refreshLibraryMatches = async () => {
  if (!state.apiOnline) return;
  const query = new URLSearchParams({
    limit: "12",
    syllabus: syllabusInput.value,
    subject: subjectSelect.value,
    topic: topicInput.value,
  });
  try {
    const data = await apiJson(`/api/worksheets/library?${query.toString()}`, { method: "GET" });
    renderLibraryMatches(data.items || []);
  } catch {
    renderLibraryMatches([]);
  }
};

const loadBackend = async () => {
  if (apiInput) apiInput.value = state.apiBase;
  if (!state.apiBase) {
    updateConnectionStatus("Demo mode: no backend URL configured.", "offline");
    setFallbackControls();
    return;
  }

  updateConnectionStatus(`Connecting to ${state.apiBase}...`, "offline");
  try {
    const [health, options, library] = await Promise.all([
      apiJson("/health", { method: "GET" }),
      apiJson("/api/worksheets/options", { method: "GET" }),
      apiJson("/api/worksheets/library?limit=12", { method: "GET" }),
    ]);
    state.apiOnline = true;
    state.options = options;
    state.library = library;
    applyBackendOptions(options);
    updateConnectionStatus(`Connected to ${health.name || "worksheet API"} at ${state.apiBase}.`, "online");
    librarySummary.textContent = `Library loaded: ${library.count || 0} indexed files. Showing closest matches below.`;
    renderLibraryMatches(library.items || []);
  } catch (error) {
    state.apiOnline = false;
    updateConnectionStatus(`Could not reach API: ${error.message}`, "offline");
    setFallbackControls();
  }
};

const getQuestionType = () => {
  const selected = document.querySelector('input[name="questionType"]:checked');
  return selected ? selected.value : "MCQ";
};

const updateMarksRule = () => {
  const marks = Number(marksInput.value);
  const type = getQuestionType();
  marksOutput.textContent = `${marks} marks`;
  if (type === "MCQ") {
    ruleNote.textContent = `MCQ rule: ${marks} marks creates ${marks} MCQs because every MCQ is worth 1 mark.`;
    return;
  }
  const estimatedQuestions = Math.max(1, Math.ceil(marks / 4));
  ruleNote.textContent = `Open-ended mode: ${marks} marks creates about ${estimatedQuestions} longer questions, with marks split by working and final answers.`;
};

const getSampleLinks = (subject) => {
  if (subject === "Mathematics") return sampleLinks.Mathematics;
  if (["Physics", "Chemistry", "Biology"].includes(subject)) return sampleLinks.Science;
  return sampleLinks.Mathematics;
};

const buildWorksheetPayload = () => {
  const subject = subjectSelect.value;
  const topic = topicInput.value.trim() || "Selected topic";
  const type = getQuestionType();
  const marks = Number(marksInput.value);
  const questionCount = type === "MCQ" ? marks : Math.max(1, Math.ceil(marks / 4));
  const syllabusYear = Number(yearInput.value) || undefined;
  const topicId = state.topicIdByTitle.get(`${subject}::${topic}`) || "";
  return {
    syllabus: syllabusInput.value.trim() || "Cambridge IGCSE",
    curriculum: syllabusInput.value.trim() || "Cambridge IGCSE",
    year: syllabusYear,
    syllabusYear,
    level: syllabusInput.value.toLowerCase().includes("igcse") ? "IGCSE" : "",
    subject,
    topic,
    subtopic: topic,
    officialTopic: topic,
    topicId,
    worksheetType: type,
    answerFormat: type,
    component: type === "MCQ" ? "2" : undefined,
    marks,
    targetMarks: marks,
    questionCount,
    itemCount: questionCount,
    description: `Generate a ${type} worksheet for ${subject} ${topic}.`,
  };
};

const outputLinkCandidates = (output = {}) => [
  ["Worksheet PDF", output.pdfUrlAbsolute || output.pdfPathLocalUrl || output.pdfUrl],
  ["Worksheet preview", output.htmlUrlAbsolute || output.htmlUrl || output.htmlPathLocalUrl],
  ["Mark scheme PDF", output.markSchemePdfUrlAbsolute || output.markSchemePdfPathLocalUrl || output.markSchemePdfUrl],
  ["Sources", output.sourcesMdUrlAbsolute || output.sourcesMdPathLocalUrl || output.sourcesMdUrl],
  ["Source CSV", output.sourcesCsvUrlAbsolute || output.sourcesCsvPathLocalUrl || output.sourcesCsvUrl],
  ["Worksheet JSON", output.jsonUrlAbsolute || output.jsonUrl || output.jsonPathLocalUrl],
].filter(([, url]) => Boolean(url));

const renderOutputLinks = (links) => {
  if (!links.length) return '<span class="output-pill">No output links returned</span>';
  return links
    .map(([label, url]) => `<a href="${escapeHtml(resolveApiUrl(url))}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
    .join("");
};

const renderBackendWorksheet = (record, payload) => {
  const result = record.result || record;
  const output = result.output || {};
  const links = outputLinkCandidates(output);
  const matches = record.libraryMatches || result.libraryMatches || [];
  generationOutput.innerHTML = `
    <div class="generated-card">
      <div>
        <span class="generated-title">${escapeHtml(result.title || `${payload.subject} ${payload.topic} worksheet`)}</span>
        <p class="feedback-copy">
          Backend mode: ${escapeHtml(record.mode || result.mode || "worksheet-api")} - ${escapeHtml(payload.syllabus)} - ${escapeHtml(payload.worksheetType)} - ${payload.targetMarks} marks
        </p>
      </div>
      <div class="output-links" aria-label="Generated worksheet links">${renderOutputLinks(links)}</div>
      <div class="output-links" aria-label="Generation details">
        <span class="output-pill">${escapeHtml(matches.length)} matched library source${matches.length === 1 ? "" : "s"}</span>
        <span class="output-pill">${payload.worksheetType === "MCQ" ? "MCQ component requested" : "Open-ended topical paper requested"}</span>
      </div>
    </div>
  `;
  renderLibraryMatches(matches);
};

const renderDemoWorksheet = (payload) => {
  const links = getSampleLinks(payload.subject);
  const htmlUrl = `${pathPrefix}${links.html}`;
  const pdfUrl = `${pathPrefix}${links.pdf}`;

  generationOutput.innerHTML = `
    <div class="generated-card">
      <div>
        <span class="generated-title">${escapeHtml(payload.subject)} ${escapeHtml(payload.topic)} worksheet</span>
        <p class="feedback-copy">
          Demo mode - ${escapeHtml(payload.syllabus)} - ${payload.year || "selected year"} - ${escapeHtml(payload.worksheetType)} - ${payload.targetMarks} marks - ${payload.questionCount} question${payload.questionCount === 1 ? "" : "s"}
        </p>
      </div>
      <div class="output-links" aria-label="Generated worksheet links">
        <a href="${htmlUrl}" target="_blank" rel="noreferrer">Open worksheet preview</a>
        <a href="${pdfUrl}" target="_blank" rel="noreferrer">Download worksheet PDF</a>
        <a href="${htmlUrl}" target="_blank" rel="noreferrer">Open answer link</a>
      </div>
      <div class="output-links" aria-label="Generation details">
        <span class="output-pill">Demo output only</span>
        <span class="output-pill">${payload.worksheetType === "MCQ" ? "1 mark per MCQ enforced" : "Open-ended mark split estimated"}</span>
      </div>
    </div>
  `;
};

const renderGeneratedWorksheet = async (event) => {
  event.preventDefault();
  const payload = buildWorksheetPayload();
  generationOutput.innerHTML = `<p class="feedback-copy">Generating worksheet...</p>`;
  if (!state.apiOnline) {
    renderDemoWorksheet(payload);
    return;
  }

  try {
    const record = await apiJson("/api/worksheets/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    renderBackendWorksheet(record, payload);
  } catch (error) {
    generationOutput.innerHTML = `
      <div class="generated-card">
        <span class="generated-title">Backend generation failed</span>
        <p class="feedback-copy">${escapeHtml(error.message)}. Falling back to demo links.</p>
      </div>
    `;
    renderDemoWorksheet(payload);
  }
};

const renderBackendFeedback = (result) => {
  const prompts = Array.isArray(result.nextPrompts) && result.nextPrompts.length
    ? result.nextPrompts
    : [
        "Would you wanna do a quiz worksheet to practice your mistakes?",
        "Would you want to practice another topic?",
      ];
  const questionFeedback = Array.isArray(result.questions) ? result.questions : [];
  feedbackOutput.innerHTML = `
    <div class="feedback-card">
      <div>
        <span class="feedback-score">${escapeHtml(result.awardedMarks ?? "--")} / ${escapeHtml(result.totalMarks ?? "--")}</span>
        <p class="feedback-copy">${escapeHtml(result.overallFeedback || "Marking complete. Review the feedback below.")}</p>
      </div>
      <ul class="feedback-list">
        ${
          questionFeedback.length
            ? questionFeedback.map((item) => `<li>${escapeHtml(item.feedback || "Review this answer.")}</li>`).join("")
            : "<li>Review method, wording, and final answer precision.</li>"
        }
      </ul>
      <div class="prompt-actions" aria-label="Next prompts">
        ${prompts.map((prompt) => `<button type="button">${escapeHtml(prompt)}</button>`).join("")}
      </div>
    </div>
  `;
};

const renderDemoFeedback = () => {
  feedbackOutput.innerHTML = `
    <div class="feedback-card">
      <div>
        <span class="feedback-score">4 / 5</span>
        <p class="feedback-copy">
          Good method recognition. The answer shows the main rearrangement step, but the final response
          should include a clearer method line, final statement, and a quick substitution check.
        </p>
      </div>
      <ul class="feedback-list">
        <li>Keep the working visible: move constants first, then divide both sides.</li>
        <li>State the final answer clearly, for example: x = 6.</li>
        <li>Check by substituting the answer into the original equation.</li>
      </ul>
      <div class="prompt-actions" aria-label="Next prompts">
        <button type="button">Would you wanna do a quiz worksheet to practice your mistakes?</button>
        <button type="button">Would you want to practice another topic?</button>
      </div>
    </div>
  `;
};

const renderFeedback = async (event) => {
  event.preventDefault();
  const markScheme = document.querySelector("#markScheme").value.trim();
  const answer = document.querySelector("#studentAnswer").value.trim();
  const payload = {
    syllabus: syllabusInput.value,
    year: Number(yearInput.value) || undefined,
    subject: subjectSelect.value,
    topic: topicInput.value,
    worksheetType: "Open-ended",
    questions: [
      {
        question: markScheme || "Question block",
        correctAnswer: markScheme,
        studentAnswer: answer,
        maxMarks: 5,
      },
    ],
  };

  feedbackOutput.innerHTML = `<p class="feedback-copy">Marking answer...</p>`;
  if (!state.apiOnline) {
    renderDemoFeedback();
    return;
  }

  try {
    const result = await apiJson("/api/worksheets/mark", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    renderBackendFeedback(result);
  } catch (error) {
    feedbackOutput.innerHTML = `<p class="feedback-copy">Backend marking failed: ${escapeHtml(error.message)}. Showing demo feedback.</p>`;
    renderDemoFeedback();
  }
};

insertConnectionPanel();
state.apiBase = getConfiguredApiBase();
if (apiInput) apiInput.value = state.apiBase;
setFallbackControls();
updateMarksRule();
loadBackend();

subjectSelect.addEventListener("change", () => {
  setTopicOptions();
  refreshLibraryMatches();
});
topicInput.addEventListener("change", refreshLibraryMatches);
topicInput.addEventListener("input", () => {
  window.clearTimeout(topicInput.dataset.timer);
  topicInput.dataset.timer = window.setTimeout(refreshLibraryMatches, 300);
});
syllabusInput.addEventListener("change", refreshLibraryMatches);
yearInput.addEventListener("change", refreshLibraryMatches);
marksInput.addEventListener("input", updateMarksRule);
document.querySelectorAll('input[name="questionType"]').forEach((input) => {
  input.addEventListener("change", updateMarksRule);
});
worksheetForm.addEventListener("submit", renderGeneratedWorksheet);
markingForm.addEventListener("submit", renderFeedback);

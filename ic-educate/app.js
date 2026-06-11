const defaultApiBase = (() => {
  if (window.IC_EDUCATE_API_BASE) return window.IC_EDUCATE_API_BASE;
  if (window.location.hostname.endsWith("github.io")) return "http://127.0.0.1:8001";
  if (window.location.protocol.startsWith("http")) return window.location.origin;
  return "http://127.0.0.1:8001";
})();

const API_BASE = defaultApiBase.replace(/\/$/, "");

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

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

let currentMode = "create";
let latestTutorPrompt = "";
let latestGeminiUrl = "https://gemini.google.com/app";

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
  });
};

const setBackendStatus = (online) => {
  backendReachable = online;
  if (online) {
    backendStatus.textContent = `AAutograder bridge: ${API_BASE} (online)`;
    backendStatus.classList.add("online");
    backendStatus.classList.remove("offline");
  } else {
    backendStatus.classList.add("offline");
    backendStatus.textContent = "AAutograder bridge offline - running demo mode";
    backendStatus.classList.remove("online");
  }
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
    submitBtn.textContent = "Start learning journey";
  }
  if (mode === "mark") {
    submitBtn.textContent = "Get mark feedback";
  }
  resultEl.innerHTML = `<p class="muted">Mode: ${mode}</p>`;
};

const asPayload = () => {
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  const selectedSubtopic = subtopicSelect.options[subtopicSelect.selectedIndex];
  return {
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
  };
};

const asMarkingPayload = async (payload) => {
  const paperFile = document.getElementById("uploadFile").files[0];
  const rubricFile = document.getElementById("rubricFile").files[0];
  if (!paperFile) {
    throw new Error("Upload a completed paper before requesting AAutograder feedback.");
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
  const candidates = [
    ["Worksheet", output.pdfPathLocalUrl || output.htmlUrl || output.pdfUrlAbsolute || output.htmlUrlAbsolute],
    ["Answer key", output.answerKeyLocalUrl || output.answerKey || output.answer_key],
    ["Sources", output.sourcesMdPathLocalUrl || output.sourcesCsvPathLocalUrl],
  ].filter(([, url]) => Boolean(url));
  if (!candidates.length) {
    return '<span class="muted">No output link returned.</span>';
  }
  return candidates
    .map(([title, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${title}</a>`)
    .join(" ");
};

const renderGeneratedWorksheet = (payload) => {
  const output = payload.result || payload.output || {};
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
  `;
};

const renderLearningJourney = (payload) => {
  const checklist = payload.checklist || [];
  const sections = payload.lesson?.sections || [];
  const quiz = payload.quiz?.questions || payload.quiz || [];
  const worksheetResult = payload.worksheet?.result || {};

  const journeyHtml = checklist
    .map(
      (step, index) => `
      <li class="journey-step ${step.status === "done" ? "done" : ""}">
        <span class="step-dot">${index + 1}</span>
        <span><strong>${step.title || step}</strong><small>${step.type || "duo mode"} - ${step.xp || 0} XP</small></span>
      </li>
    `
    )
    .join("");

  const lessonHtml = sections
    .map((sec) => `<article class="lesson-card"><h3>${sec.title}</h3><p>${sec.body || sec}</p></article>`)
    .join("");

  const questionList = (quiz?.questions || quiz)
    .map((q, i) => `<article class="quiz-card"><h3>Q${i + 1}. ${q.prompt || q}</h3><p>${q.explanation || ""}</p></article>`)
    .join("");

  resultEl.innerHTML = `
    <p><strong>${payload.title || "Learning journey created"}</strong></p>
    <p class="hint">${payload.lesson?.objective || ""}</p>
    <div class="hint">Total XP: ${(checklist || []).reduce((sum, item) => sum + Number(item.xp || 0), 0)} XP</div>
    <ol class="journey-list">${journeyHtml}</ol>
    <h3>Lesson</h3>
    <div class="lesson-grid">${lessonHtml}</div>
    <h3>Workbook to practice</h3>
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

const simulateWorksheet = (payload, mode) => {
  const safeTopic = payload.subtopic || payload.topic || "topic";
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
      if (backendReachable) {
        const data = await callBackend("/api/platform/teacher-feedback", requestPayload);
        renderMarkFeedback(data);
      } else {
        renderMarkFeedback(simulateMarking(requestPayload));
      }
      return;
    }

    const endpoint = currentMode === "learn" ? "/api/learn/journey" : "/api/worksheets/generate";
    if (backendReachable) {
      const generated = await callBackend(endpoint, payload);
      if (currentMode === "learn") {
        renderLearningJourney(generated);
      } else {
        renderGeneratedWorksheet(generated);
      }
      return;
    }

    const local = simulateWorksheet(payload, currentMode);
    if (currentMode === "learn") {
      renderLearningJourney(local);
    } else {
      renderGeneratedWorksheet(local);
    }
  } catch (error) {
    if (currentMode === "mark") {
      renderMarkFeedback({
        status: backendReachable ? "aautograder_error" : "demo_mode_error",
        score: payload.score || 0,
        maxScore: 20,
        feedback: backendReachable
          ? `AAutograder could not mark this paper yet: ${error.message}`
          : `Bridge is offline, so this is demo feedback. ${error.message}`,
        fixPoints: backendReachable
          ? ["Check API keys, upload format, and OCR readability, then retry."]
          : simulateMarking(payload).fixPoints,
        followUp: backendReachable
          ? "Fix the bridge/provider issue, then submit the same completed paper again."
          : "Start the AAutograder IC Educate bridge, then submit again for real marking.",
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
    resultEl.innerHTML += `<p class="hint">Backend error: ${error.message}. Switched to demo mode output.</p>`;
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

setMode("create");
loadBackendCatalog();

const API_BASE = window.INSTAPHOTO_API_BASE || "http://127.0.0.1:8001";

const fallbackCatalog = {
  "Cambridge IGCSE": {
    IGCSE: {
      Physics: ["Motion, forces and energy", "Thermal physics", "Waves", "Electricity and magnetism", "Nuclear physics"],
      Chemistry: ["Atomic structure", "Chemical bonding", "Stoichiometry", "Electrolysis", "Organic chemistry"],
      Biology: ["Cells", "Biological molecules", "Enzymes", "Genetics", "Ecology"],
      Mathematics: ["Number", "Algebra", "Geometry", "Trigonometry", "Statistics"]
    }
  }
};

let catalogData = fallbackCatalog;
let topicalSubjects = [];
let latestLibraryItems = [];

const syllabusSelect = document.getElementById("syllabus");
const levelSelect = document.getElementById("level");
const topicSelect = document.getElementById("topic");
const subtopicSelect = document.getElementById("subtopic");
const form = document.getElementById("worksheet-form");
const resultEl = document.getElementById("result");
const catalogEl = document.getElementById("catalog");
const submitButton = document.getElementById("submitButton");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
let currentMode = "worksheet";

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
    option.value = typeof item === "string" ? item : item.value;
    option.textContent = typeof item === "string" ? item : item.label;
    if (item && typeof item === "object" && item.dataset) {
      Object.entries(item.dataset).forEach(([key, value]) => {
        option.dataset[key] = value;
      });
    }
    select.appendChild(option);
  });
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildCatalogFromOptions = (optionsPayload) => {
  const next = { ...fallbackCatalog };
  const subjects = optionsPayload?.topical?.subjects || [];
  if (subjects.length) {
    next["Cambridge IGCSE"] = {
      IGCSE: Object.fromEntries(
        subjects.map((subject) => [
          subject.label,
          (subject.topicPacks || []).map((pack) => ({
            value: pack.title,
            label: pack.title,
            dataset: { topicId: pack.id || "" }
          }))
        ])
      )
    };
    topicalSubjects = subjects;
  }
  const facets = optionsPayload?.library?.facets || {};
  (facets.syllabus || []).slice(0, 8).forEach((item) => {
    if (!next[item.label]) next[item.label] = { "Library": {} };
  });
  return next;
};

const fillAll = () => {
  fillSelect(syllabusSelect, Object.keys(catalogData), "Select syllabus");
  fillSelect(levelSelect, [], "Select level");
  fillSelect(topicSelect, [], "Select topic");
  fillSelect(subtopicSelect, [], "Select subtopic");
};

const updateLevels = () => {
  const levels = catalogData[syllabusSelect.value] ? Object.keys(catalogData[syllabusSelect.value]) : [];
  fillSelect(levelSelect, levels, "Select level");
  fillSelect(topicSelect, [], "Select topic");
  fillSelect(subtopicSelect, [], "Select subtopic");
};

const updateTopics = () => {
  const syllabus = catalogData[syllabusSelect.value];
  const topics = syllabus && syllabus[levelSelect.value] ? Object.keys(syllabus[levelSelect.value]) : [];
  fillSelect(topicSelect, topics, "Select topic");
  fillSelect(subtopicSelect, [], "Select subtopic");
};

const updateSubtopics = () => {
  const syllabus = catalogData[syllabusSelect.value];
  const levelMap = syllabus && syllabus[levelSelect.value];
  const subtopics = levelMap && levelMap[topicSelect.value] ? levelMap[topicSelect.value] : [];
  fillSelect(subtopicSelect, subtopics, "Select subtopic");
};

const renderCatalog = () => {
  const nodes = [];
  Object.entries(catalogData).forEach(([syllabus, levels]) => {
    const syllabusNode = document.createElement("div");
    syllabusNode.className = "catalog-item";
    syllabusNode.innerHTML = `<strong>${syllabus}</strong>`;

    Object.entries(levels).forEach(([level, topics]) => {
      const levelNode = document.createElement("div");
      levelNode.style.marginTop = "0.3rem";
      levelNode.innerHTML = `<span class="hint">${level}</span>`;
      syllabusNode.appendChild(levelNode);

      const topicList = document.createElement("ul");
      topicList.style.margin = "0.2rem 0 0.65rem 1.1rem";
      Object.entries(topics).forEach(([topic, subtopics]) => {
        const labels = subtopics.map((item) => (typeof item === "string" ? item : item.label)).slice(0, 10);
        const topicNode = document.createElement("li");
        topicNode.innerHTML = `<strong>${topic}</strong>: ${labels.join(", ")}`;
        topicList.appendChild(topicNode);
      });
      syllabusNode.appendChild(topicList);
    });

    nodes.push(syllabusNode);
  });

  if (latestLibraryItems.length) {
    const resourcesNode = document.createElement("div");
    resourcesNode.className = "catalog-item";
    resourcesNode.innerHTML = `<strong>Recent library matches</strong>`;
    const list = document.createElement("ul");
    list.style.margin = "0.2rem 0 0 1.1rem";
    latestLibraryItems.slice(0, 12).forEach((item) => {
      const row = document.createElement("li");
      row.textContent = `${item.title} (${item.kind || "resource"})`;
      list.appendChild(row);
    });
    resourcesNode.appendChild(list);
    nodes.push(resourcesNode);
  }

  catalogEl.replaceChildren(...nodes);
};

const loadBackendCatalog = async () => {
  try {
    const [optionsResponse, libraryResponse] = await Promise.all([
      fetch(`${API_BASE}/api/worksheets/options`),
      fetch(`${API_BASE}/api/worksheets/library?limit=20`)
    ]);
    const optionsPayload = await optionsResponse.json();
    const libraryPayload = await libraryResponse.json();
    latestLibraryItems = libraryPayload.items || [];
    catalogData = buildCatalogFromOptions(optionsPayload);
  } catch (error) {
    resultEl.innerHTML = `<p class="muted">Backend not reachable yet. Using starter catalog.</p>`;
  }
  fillAll();
  renderCatalog();
};

const selectedOption = (select) => select.options[select.selectedIndex];

const setMode = (mode) => {
  currentMode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  submitButton.textContent = mode === "learn" ? "Start learning journey" : "Generate worksheet";
};

const asPayload = (formData) => ({
  sourceType: "ic-educate-website",
  syllabus: formData.syllabus,
  curriculum: formData.syllabus,
  level: formData.level,
  subject: formData.topic,
  topic: formData.topic,
  subtopic: formData.subtopic,
  topicId: formData.topicId,
  description: formData.description,
  questionCount: Number(formData.itemCount),
  answerFormat: formData.format,
  deadline: formData.deadline || null,
  uploadedAsset: formData.uploadedAsset || null
});

const renderOutputLinks = (output = {}) => {
  const links = [
    ["Worksheet", output.pdfPathLocalUrl || output.htmlUrl || output.pdfUrlAbsolute || output.htmlUrlAbsolute],
    ["Mark scheme", output.markSchemePdfPathLocalUrl || output.markSchemePdfUrlAbsolute],
    ["Sources", output.sourcesMdPathLocalUrl || output.sourcesCsvPathLocalUrl]
  ].filter(([, href]) => href);

  return links.length
    ? links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`).join(" ")
    : "<span class=\"muted\">No file link returned.</span>";
};

const renderGeneratedResult = (payload) => {
  const output = payload?.result?.output || {};
  const title = payload?.result?.title || payload?.title || "Generated worksheet";

  const libraryHtml = (payload.libraryMatches || [])
    .slice(0, 6)
    .map((item) => `<li>${item.title}</li>`)
    .join("");

  resultEl.innerHTML = `
    <p style="margin-top:0"><strong>${title}</strong></p>
    <p class="hint">${payload.mode || "generated"}${payload.aiProvider ? ` via ${payload.aiProvider}` : ""}</p>
    <div class="result-links">${renderOutputLinks(output)}</div>
    ${libraryHtml ? `<h3>Matched resources</h3><ul>${libraryHtml}</ul>` : ""}
  `;
};

const renderJourneyResult = (payload) => {
  const lessonSections = payload.lesson?.sections || [];
  const checklist = payload.checklist || [];
  const quizQuestions = payload.quiz?.questions || [];
  const worksheetOutput = payload.worksheet?.result?.output || {};
  const resources = payload.libraryMatches || payload.resources || [];

  const lessonHtml = lessonSections
    .map((section) => `<article class="lesson-card"><h3>${section.title}</h3><p>${section.body}</p></article>`)
    .join("");

  const checklistHtml = checklist
    .map(
      (step, index) => `
        <li class="journey-step ${step.status || "locked"}">
          <span class="step-dot">${index + 1}</span>
          <span><strong>${step.title}</strong><small>${step.type || "step"} · ${step.xp || 0} XP</small></span>
        </li>
      `
    )
    .join("");

  const quizHtml = quizQuestions
    .map(
      (question, index) => `
        <article class="quiz-card">
          <h3>Q${index + 1}. ${question.prompt}</h3>
          <ol>${(question.answers || []).map((answer) => `<li>${answer}</li>`).join("")}</ol>
          <p class="hint">Answer: ${(question.answers || [])[question.correctIndex] || "Review lesson"} · ${question.explanation || ""}</p>
        </article>
      `
    )
    .join("");

  const resourcesHtml = resources
    .slice(0, 6)
    .map((item) => `<li>${item.title}</li>`)
    .join("");

  resultEl.innerHTML = `
    <div class="journey-head">
      <div>
        <p class="eyebrow">Learn with IC Educate</p>
        <h2>${payload.title || "Learning journey"}</h2>
        <p class="hint">${payload.lesson?.objective || ""}</p>
      </div>
      <span class="xp-badge">${checklist.reduce((total, step) => total + Number(step.xp || 0), 0)} XP</span>
    </div>
    <ol class="journey-list">${checklistHtml}</ol>
    <div class="lesson-grid">${lessonHtml}</div>
    <h3>Worksheet</h3>
    <div class="result-links">${renderOutputLinks(worksheetOutput)}</div>
    <h3>${payload.quiz?.title || "Quick quiz"}</h3>
    <div class="quiz-grid">${quizHtml}</div>
    ${resourcesHtml ? `<h3>Library sources</h3><ul>${resourcesHtml}</ul>` : ""}
  `;
};

const onSubmit = async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  const subtopicOption = selectedOption(subtopicSelect);

  const formData = {
    description: document.getElementById("description").value.trim(),
    syllabus: syllabusSelect.value,
    level: levelSelect.value,
    topic: topicSelect.value,
    subtopic: subtopicSelect.value,
    topicId: subtopicOption?.dataset?.topicId || "",
    itemCount: document.getElementById("itemCount").value,
    format: document.getElementById("format").value,
    deadline: document.getElementById("deadline").value,
    uploadedAsset: file
      ? {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size
        }
      : null
  };

  const payload = asPayload(formData);
  const endpoint = currentMode === "learn" ? "/api/learn/journey" : "/api/worksheets/generate";
  resultEl.innerHTML = `<p class="muted">${currentMode === "learn" ? "Building learning journey..." : "Generating worksheet..."}</p>`;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const generated = await response.json();
    if (!response.ok || generated.error) {
      throw new Error(generated.error || `Backend returned HTTP ${response.status}`);
    }
    if (currentMode === "learn") {
      renderJourneyResult(generated);
    } else {
      renderGeneratedResult(generated);
    }
  } catch (error) {
    resultEl.innerHTML = `
      <p><strong>Generation failed</strong></p>
      <p class="muted">${error.message}</p>
      <pre>${JSON.stringify(payload, null, 2)}</pre>
    `;
  }
};

syllabusSelect.addEventListener("change", updateLevels);
levelSelect.addEventListener("change", updateTopics);
topicSelect.addEventListener("change", updateSubtopics);
form.addEventListener("submit", onSubmit);
modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode || "worksheet"));
});

setMode("worksheet");
loadBackendCatalog();

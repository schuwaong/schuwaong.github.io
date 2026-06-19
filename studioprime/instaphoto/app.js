const API_BASE = window.INSTAPHOTO_API_BASE || "http://127.0.0.1:8001";
const SHARED_SYLLABUS_BASE = "../../shared-data/syllabuses/";

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

const mergeCatalogs = (base, extra) => {
  const merged = structuredClone(base);
  Object.entries(extra || {}).forEach(([syllabus, levels]) => {
    merged[syllabus] = merged[syllabus] || {};
    Object.entries(levels || {}).forEach(([level, topics]) => {
      merged[syllabus][level] = {
        ...(merged[syllabus][level] || {}),
        ...(topics || {})
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
    subject.category ? `Category: ${subject.category}` : ""
  ]
    .filter(Boolean)
    .join(". "),
  dataset: { topicId: subject.id || subject.title }
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
            dataset: { topicId: subject.id }
          }
        ]
      ])
    );
    const vocational = Object.fromEntries(
      (data.vocationalSubjects || []).map((title) => [
        title,
        [{ value: `${title} DSKP`, label: `${title} DSKP`, content: "KSSM MPV Form 4/5 vocational syllabus content." }]
      ])
    );
    const specialEducation = Object.fromEntries(
      (data.specialEducationSubjects || []).map((title) => [
        title,
        [{ value: `${title} DSKP`, label: `${title} DSKP`, content: "KSSMPK Form 4/5 special education syllabus content." }]
      ])
    );
    return {
      [data.name]: {
        [data.level]: academic,
        "SPM Vocational MPV": vocational,
        "KSSMPK Form 4 and 5": specialEducation
      }
    };
  }

  return {};
};

const optionFromSubtopic = (item, prefix = "") => ({
  value: item.title,
  label: prefix ? `${prefix}: ${item.title}` : item.title,
  content: item.content || item.children?.join(", ") || `Syllabus focus: ${item.title}.`,
  dataset: { topicId: item.id || item.title }
});

const catalogFromSubjectDetail = (data) => {
  if (data.curriculumId === "sg-psle-2026") {
    return {
      "Singapore PSLE": {
        [data.level || "Primary 6"]: {
          [data.subject]: (data.topics || []).flatMap((topic) =>
            (topic.subtopics || []).map((subtopic) => optionFromSubtopic(subtopic, topic.title))
          )
        }
      }
    };
  }

  if (data.curriculumId === "my-spm-kssm-form-4-5" && data.subject) {
    return {
      "Malaysia SPM KSSM": {
        [data.level || "Form 4 and Form 5"]: {
          [data.subject]: (data.topics || []).flatMap((topic) =>
            (topic.subtopics || []).map((subtopic) => optionFromSubtopic(subtopic, topic.title))
          )
        }
      }
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
                content: `${subject.title} ${topic.level} syllabus topic.`
              },
              topic.level
            )
          )
        )
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

const getOptionLabel = (item) => (typeof item === "string" ? item : item?.label || item?.value || "");

const getOptionContent = (item) => {
  if (typeof item === "string") return `Syllabus focus: ${item}.`;
  return item?.content || item?.description || item?.summary || `Syllabus focus: ${getOptionLabel(item)}.`;
};

const buildSyllabusOutline = (payload) => {
  const syllabus = catalogData[payload.syllabus] || {};
  const levelMap = syllabus[payload.level] || {};
  const subtopicItems = levelMap[payload.topic] || [];
  const selectedTitle = payload.subtopic || payload.topic || "Selected topic";
  const mappedItems = subtopicItems
    .map((item) => ({
      title: getOptionLabel(item),
      content: getOptionContent(item),
      topicId: typeof item === "object" ? item.dataset?.topicId || item.value || "" : ""
    }))
    .filter((item) => item.title);
  const selectedItem =
    mappedItems.find((item) => item.title.toLowerCase() === selectedTitle.toLowerCase()) || {
      title: selectedTitle,
      content: `Syllabus focus: ${selectedTitle}.`,
      topicId: payload.topicId || ""
    };
  const relatedItems = mappedItems.filter((item) => item.title !== selectedItem.title);

  return {
    syllabus: payload.syllabus,
    level: payload.level,
    subject: payload.topic,
    selectedSubtopic: selectedItem,
    items: [selectedItem, ...relatedItems].slice(0, 12)
  };
};

const buildSevenDayStudyPlan = (payload) => {
  const outline = payload.syllabusOutline || buildSyllabusOutline(payload);
  const items = outline.items?.length
    ? outline.items
    : [{ title: payload.subtopic || payload.topic || "Selected topic", content: "Review the selected syllabus area." }];
  const pick = (index) => items[index % items.length];
  const selected = outline.selectedSubtopic || pick(0);
  return [
    { day: 1, title: `Map the syllabus for ${selected.title}`, focus: selected.content, task: `Read the ${outline.syllabus} ${outline.level} expectations for ${outline.subject}, then list the key terms and formulas in ${selected.title}.` },
    { day: 2, title: `Build core understanding: ${pick(0).title}`, focus: pick(0).content, task: "Make short notes from the syllabus content, then explain each idea aloud without looking." },
    { day: 3, title: `Connect related subtopic: ${pick(1).title}`, focus: pick(1).content, task: `Compare ${pick(1).title} with ${selected.title}; write two similarities, two differences, and one exam trap.` },
    { day: 4, title: `Worked examples: ${pick(2).title}`, focus: pick(2).content, task: "Do three worked examples, showing every method line and annotating where each syllabus point is used." },
    { day: 5, title: `Mixed practice across ${outline.subject}`, focus: [pick(0), pick(1), pick(2)].map((item) => item.title).join(", "), task: "Complete mixed short-answer questions across these subtopics, then mark errors by syllabus point." },
    { day: 6, title: `Exam application: ${pick(3).title}`, focus: pick(3).content, task: "Attempt timed exam-style questions and rewrite weak answers using precise syllabus language." },
    { day: 7, title: "Review and close gaps", focus: items.slice(0, 6).map((item) => item.title).join(", "), task: "Redo missed questions, update a one-page summary, and generate a final worksheet for the weakest subtopic." }
  ];
};

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
  try {
    catalogData = mergeCatalogs(catalogData, await loadSharedSyllabusCatalog());
  } catch (error) {
    console.warn("Shared syllabus catalog unavailable", error);
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

const asPayload = (formData) => {
  const payload = {
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
  };
  payload.syllabusOutline = buildSyllabusOutline(payload);
  return payload;
};

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

const renderJourneyResult = (payload, requestPayload = null) => {
  const lessonSections = payload.lesson?.sections || [];
  const checklist = payload.checklist || [];
  const quizQuestions = payload.quiz?.questions || [];
  const worksheetOutput = payload.worksheet?.result?.output || {};
  const resources = payload.libraryMatches || payload.resources || [];
  const sevenDayPlan = payload.sevenDayPlan || payload.studyPlan || buildSevenDayStudyPlan(payload.request || requestPayload || payload);

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

  const studyPlanHtml = sevenDayPlan
    .map(
      (day) => `
        <li class="journey-step">
          <span class="step-dot">${day.day}</span>
          <span>
            <strong>${day.title}</strong>
            <small>${day.focus || ""}</small>
            <p>${day.task || ""}</p>
          </span>
        </li>
      `
    )
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
    <h3>7 day syllabus study plan</h3>
    <ol class="journey-list">${studyPlanHtml}</ol>
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
      renderJourneyResult(generated, payload);
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

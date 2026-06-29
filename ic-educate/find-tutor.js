const REQUESTS_STORAGE_KEY = "ic-educate-requests";
const MARKETPLACE_STORAGE_KEY = "ic-educate-marketplace";

const tutorRequestForm = document.getElementById("tutorRequestForm");
const tutorRequestBtn = document.getElementById("tutorRequestBtn");
const tutorSampleBtn = document.getElementById("tutorSampleBtn");
const tutorResetBtn = document.getElementById("tutorResetBtn");
const tutorRequestStatus = document.getElementById("tutorRequestStatus");
const tutorSummaryEl = document.getElementById("tutorSummary");
const tutorMatchesEl = document.getElementById("tutorMatches");
const copyTutorBriefBtn = document.getElementById("copyTutorBriefBtn");
const tutorWhatsappLink = document.getElementById("tutorWhatsappLink");

const tutorNameInput = document.getElementById("tutorName");
const tutorPhoneInput = document.getElementById("tutorPhone");
const tutorSubjectInput = document.getElementById("tutorSubject");
const tutorTopicInput = document.getElementById("tutorTopic");
const tutorSyllabusInput = document.getElementById("tutorSyllabus");
const tutorLevelInput = document.getElementById("tutorLevel");
const tutorAreaInput = document.getElementById("tutorArea");
const tutorModeInput = document.getElementById("tutorMode");
const tutorTimeInput = document.getElementById("tutorTime");
const tutorBudgetInput = document.getElementById("tutorBudget");
const tutorNoteInput = document.getElementById("tutorNote");
const tutorConsentInput = document.getElementById("tutorConsent");

const sampleRequest = {
  studentName: "Aisha",
  phone: "+60 12-345 6789",
  subject: "Mathematics",
  topic: "Algebra and fractions",
  syllabus: "Cambridge IGCSE",
  level: "IGCSE",
  area: "Petaling Jaya",
  mode: "physical",
  preferredTime: "Weekend",
  budget: "RM90/hr",
  note: "Need an exam-focused tutor who can explain step by step and give homework follow-up.",
  consentWhatsapp: true,
};

const teacherDirectory = [
  {
    id: "maya-lim",
    name: "Maya Lim",
    subjects: ["Mathematics", "Algebra", "Number"],
    syllabus: "Cambridge IGCSE",
    level: "IGCSE",
    rating: 4.9,
    reviews: 124,
    mode: ["online", "physical"],
    onlineFee: "RM90/hr",
    physicalFee: "RM120/hr",
    location: "Kuala Lumpur",
    coordinates: { lat: 3.1478, lng: 101.6953 },
    availability: ["Morning", "Afternoon", "Weekend"],
    responseTime: "18 min",
    intro: "Patient exam prep coach for algebra foundations, paper strategy, and confidence building.",
  },
  {
    id: "aaron-chen",
    name: "Aaron Chen",
    subjects: ["Physics", "Motion", "Waves"],
    syllabus: "Cambridge IGCSE",
    level: "IGCSE",
    rating: 4.8,
    reviews: 88,
    mode: ["online"],
    onlineFee: "RM95/hr",
    physicalFee: null,
    location: "Online only",
    coordinates: null,
    availability: ["Evening", "Weekend"],
    responseTime: "9 min",
    intro: "Best for clear worked examples, quick checks, and steady progress in science.",
  },
  {
    id: "nur-syahirah",
    name: "Nur Syahirah",
    subjects: ["Biology", "Cells", "Genetics"],
    syllabus: "HK DSE",
    level: "Junior",
    rating: 4.9,
    reviews: 152,
    mode: ["online", "physical"],
    onlineFee: "RM85/hr",
    physicalFee: "RM110/hr",
    location: "Petaling Jaya",
    coordinates: { lat: 3.1073, lng: 101.6067 },
    availability: ["Afternoon", "Weekend"],
    responseTime: "14 min",
    intro: "Strong on topic recovery, revision plans, and study routines for exam pressure.",
  },
  {
    id: "devin-patel",
    name: "Devin Patel",
    subjects: ["Chemistry", "Stoichiometry", "Organic Chemistry"],
    syllabus: "Cambridge IGCSE",
    level: "IGCSE",
    rating: 4.7,
    reviews: 61,
    mode: ["online", "physical"],
    onlineFee: "RM80/hr",
    physicalFee: "RM105/hr",
    location: "Subang Jaya",
    coordinates: { lat: 3.0738, lng: 101.5183 },
    availability: ["Morning", "Evening"],
    responseTime: "24 min",
    intro: "Concise explanations and lots of practice for chemistry problem-solving.",
  },
  {
    id: "siti-farhana",
    name: "Siti Farhana",
    subjects: ["Mathematics", "Statistics", "Geometry"],
    syllabus: "HK DSE",
    level: "Junior",
    rating: 4.95,
    reviews: 173,
    mode: ["online", "physical"],
    onlineFee: "RM88/hr",
    physicalFee: "RM115/hr",
    location: "Shah Alam",
    coordinates: { lat: 3.0733, lng: 101.5185 },
    availability: ["Afternoon", "Weekend"],
    responseTime: "11 min",
    intro: "Friendly weekly structure, homework help, and confidence building for maths.",
  },
  {
    id: "felix-wong",
    name: "Felix Wong",
    subjects: ["English", "Reading", "Writing"],
    syllabus: "IB",
    level: "MYP",
    rating: 4.85,
    reviews: 94,
    mode: ["online"],
    onlineFee: "RM92/hr",
    physicalFee: null,
    location: "Kowloon",
    coordinates: { lat: 22.3167, lng: 114.17 },
    availability: ["Morning", "Evening"],
    responseTime: "21 min",
    intro: "Strong for essay writing, comprehension, and structured feedback on written work.",
  },
];

const inferMarket = (value = "") => {
  const text = normalizeText(value);
  if (
    [
      "hong kong",
      "hong kong island",
      "hk island",
      "kowloon",
      "new territories",
      "central",
      "causeway bay",
      "mong kok",
      "tsim sha tsui",
      "sha tin",
      "tuen mun",
    ].some((needle) => text.includes(needle))
  ) {
    return "hongkong";
  }
  return "malaysia";
};

const routePhoneForMarket = (market = "malaysia") => (market === "hongkong" ? "85255115251" : "60178265300");

const normalizeLessonMode = (value = "") => {
  const text = normalizeText(value);
  if (text === "either" || text === "both" || text === "any") return "both";
  if (text === "physical") return "physical";
  return "online";
};

const lessonModeLabel = (value = "") => {
  const mode = normalizeLessonMode(value);
  if (mode === "physical") return "Physical";
  if (mode === "both") return "Either lesson type";
  return "Online";
};

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const matchesText = (left = "", right = "") => {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return false;
};

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

const teacherHue = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
};

const avatarBackground = (name = "") =>
  `linear-gradient(135deg, hsl(${teacherHue(name)} 65% 40%), hsl(${(teacherHue(name) + 36) % 360} 70% 56%))`;

const readJson = (key, fallback = []) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore demo storage failures
  }
};

const buildLocationCoords = (text = "") => {
  const value = normalizeText(text);
  const lookup = [
    { match: ["kuala lumpur", "kl", "bukit bintang"], coords: { lat: 3.139, lng: 101.6869 }, label: "Kuala Lumpur" },
    { match: ["petaling jaya", "pj", "damansara"], coords: { lat: 3.1073, lng: 101.6067 }, label: "Petaling Jaya" },
    { match: ["subang", "subang jaya"], coords: { lat: 3.0738, lng: 101.5183 }, label: "Subang Jaya" },
    { match: ["shah alam"], coords: { lat: 3.0733, lng: 101.5185 }, label: "Shah Alam" },
    { match: ["hong kong island", "hk island", "hong kong", "central", "causeway bay"], coords: { lat: 22.2819, lng: 114.1587 }, label: "Hong Kong Island" },
    { match: ["kowloon", "tsim sha tsui", "tsuen wan", "mong kok", "yau ma tei"], coords: { lat: 22.3167, lng: 114.17 }, label: "Kowloon" },
    { match: ["new territories", "shatin", "sha tin", "tuen mun"], coords: { lat: 22.3833, lng: 114.205 }, label: "New Territories" },
  ];
  const hit = lookup.find((item) => item.match.some((needle) => value.includes(needle)));
  return hit ? { ...hit.coords, label: hit.label } : null;
};

const haversineKm = (a, b) => {
  if (!a || !b) return Infinity;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad((b.lat || 0) - (a.lat || 0));
  const dLng = toRad((b.lng || 0) - (a.lng || 0));
  const lat1 = toRad(a.lat || 0);
  const lat2 = toRad(b.lat || 0);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
};

const buildRequestPayload = () => ({
  id: `tutor-${Date.now()}`,
  studentName: tutorNameInput.value.trim(),
  phone: tutorPhoneInput.value.trim(),
  subject: tutorSubjectInput.value.trim(),
  topic: tutorTopicInput.value.trim(),
  syllabus: tutorSyllabusInput.value.trim(),
  level: tutorLevelInput.value.trim(),
  area: tutorAreaInput.value.trim(),
  mode: normalizeLessonMode(tutorModeInput.value),
  schedule: tutorTimeInput.value.trim(),
  preferredTime: tutorTimeInput.value.trim(),
  budget: tutorBudgetInput.value.trim(),
  note: tutorNoteInput.value.trim(),
  consentWhatsapp: Boolean(tutorConsentInput.checked),
  market: inferMarket(tutorAreaInput.value || tutorSubjectInput.value),
  createdAt: new Date().toISOString(),
  page: window.location.href,
});

const buildWhatsAppMessage = (request, tutor = null) => {
  const lines = [
    "Hi IC Educate, I need a tutor match.",
    `Name: ${request.studentName || ""}`,
    `Subject: ${request.subject || ""}`,
    request.topic ? `Topic: ${request.topic}` : "",
    request.syllabus ? `Syllabus: ${request.syllabus}` : "",
    request.level ? `Level: ${request.level}` : "",
    request.area ? `Area: ${request.area}` : "",
    request.mode ? `Lesson type: ${lessonModeLabel(request.mode)}` : "",
    request.preferredTime ? `Preferred time: ${request.preferredTime}` : "",
    request.budget ? `Budget: ${request.budget}` : "",
    request.note ? `Note: ${request.note}` : "",
    tutor ? `Selected tutor: ${tutor.name}` : "",
  ].filter(Boolean);
  return lines.join("\n");
};

const buildTutorBrief = (request, tutor = null) => {
  const lines = [
    "Tutor request",
    `Name: ${request.studentName || "-"}`,
    `Subject: ${request.subject || "-"}`,
    `Topic: ${request.topic || "-"}`,
    `Syllabus: ${request.syllabus || "-"}`,
    `Level: ${request.level || "-"}`,
    `Area: ${request.area || "-"}`,
    `Lesson type: ${lessonModeLabel(request.mode)}`,
    `Preferred time: ${request.preferredTime || "-"}`,
    `Budget: ${request.budget || "-"}`,
    `Selected tutor: ${tutor ? tutor.name : "None yet"}`,
    `Note: ${request.note || "-"}`,
  ];
  return lines.join("\n");
};

const saveTutorRequest = (request) => {
  const stored = readJson(REQUESTS_STORAGE_KEY, []);
  const next = [request, ...stored.filter((item) => item.id !== request.id)].slice(0, 100);
  writeJson(REQUESTS_STORAGE_KEY, next);

  const leadQueue = readJson(MARKETPLACE_STORAGE_KEY, []);
  const leadEntry = {
    id: request.id,
    market: request.market,
    status: "new",
    type: "student",
    name: request.studentName,
    phone: request.phone,
    subject: request.subject,
    topic: request.topic,
    level: [request.syllabus, request.level].filter(Boolean).join(" - "),
    area: request.area,
    mode: request.mode,
    schedule: request.schedule || request.preferredTime,
    note: request.note,
    preferredTime: request.preferredTime,
    consentWhatsapp: Boolean(request.consentWhatsapp),
    page: request.page,
    createdAt: request.createdAt,
    queueSource: "tutor-finder",
  };
  writeJson(MARKETPLACE_STORAGE_KEY, [leadEntry, ...leadQueue.filter((item) => item.id !== request.id)].slice(0, 120));
};

const currentRequestSummary = (request) =>
  [
    request.subject || "Subject",
    request.level || "Level",
    request.area || "Area",
    lessonModeLabel(request.mode),
  ].join(" - ");

const scoreTeacher = (request, teacher) => {
  let score = 0;
  const reasons = [];
  const requestCoords = request.area ? buildLocationCoords(request.area) : null;
  const teacherCoords = teacher.coordinates || null;
  const requestMode = normalizeLessonMode(request.mode);
  const distanceKm = requestMode !== "online" && requestCoords && teacherCoords ? haversineKm(requestCoords, teacherCoords) : null;

  if (request.subject && (teacher.subjects || []).some((subject) => matchesText(subject, request.subject))) {
    score += 34;
    reasons.push("Strong subject match");
  }
  if (request.topic && (teacher.subjects || []).some((subject) => matchesText(subject, request.topic))) {
    score += 18;
    reasons.push(`Covers ${request.topic}`);
  }
  if (request.syllabus && matchesText(teacher.syllabus, request.syllabus)) {
    score += 16;
    reasons.push(`Teaches ${teacher.syllabus}`);
  }
  if (request.level && matchesText(teacher.level, request.level)) {
    score += 12;
    reasons.push(`Works with ${request.level} students`);
  }
  if (requestMode === "both") {
    score += (teacher.mode || []).length ? 16 : 0;
  } else if ((teacher.mode || []).includes(requestMode)) {
    score += 16;
    reasons.push(`${lessonModeLabel(requestMode)} available`);
  } else {
    score -= requestMode === "physical" ? 10 : 4;
  }
  if (request.preferredTime && (teacher.availability || []).some((slot) => matchesText(slot, request.preferredTime))) {
    score += 12;
    reasons.push(`Free ${request.preferredTime}`);
  }
  if (requestMode !== "online") {
    if (distanceKm !== null) {
      const proximity = Math.max(0, 60 - Math.round(distanceKm * 6));
      score += proximity;
      if (Number.isFinite(distanceKm)) {
        reasons.push(`${distanceKm.toFixed(1)} km away`);
      }
    } else if (request.area && matchesText(teacher.location, request.area)) {
      score += 10;
      reasons.push(`Matches ${request.area}`);
    }
  } else if (request.area && matchesText(teacher.location, request.area)) {
    score += 8;
    reasons.push(`Located in ${request.area}`);
  }

  score += Math.round((teacher.rating || 0) * 10);
  score += Math.min(20, Math.round((teacher.reviews || 0) / 8));

  return { score, reasons, distanceKm };
};

const rankTeachers = (request) =>
  teacherDirectory
    .map((teacher) => ({ teacher, ...scoreTeacher(request, teacher) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (Number.isFinite(a.distanceKm) ? a.distanceKm : Infinity) - (Number.isFinite(b.distanceKm) ? b.distanceKm : Infinity) ||
        b.teacher.rating - a.teacher.rating ||
        b.teacher.reviews - a.teacher.reviews
    );

const renderTutorCard = (entry, request, rank, mode = "matched") => {
  const { teacher, score, reasons, distanceKm } = entry;
  const selected = teacher.id === selectedTutorId;
  const chipLabel = mode === "featured" ? "Popular" : `${Math.max(1, Math.round(score))} score`;
  const message = buildWhatsAppMessage(request, teacher);
  const requestMode = normalizeLessonMode(request.mode);
  const feeLabel = requestMode === "physical" && teacher.physicalFee ? teacher.physicalFee : teacher.onlineFee;

  return `
    <article class="tutor-match-card ${selected ? "featured" : ""}">
      <div class="tutor-match-head">
        <div class="tutor-match-identity">
          <div class="tutor-avatar" style="background:${avatarBackground(teacher.name)}">${escapeHtml(teacherInitials(teacher.name))}</div>
          <div>
            <span class="tag">${mode === "featured" ? "Featured" : `#${rank + 1} match`}</span>
            <h3>${escapeHtml(teacher.name)}</h3>
            <p class="hint">${escapeHtml((teacher.subjects || []).slice(0, 3).join(", "))}</p>
          </div>
        </div>
        <span class="chip">${escapeHtml(chipLabel)}</span>
      </div>
      <div class="result-links">
        <span class="chip">${escapeHtml(teacher.syllabus || "Any syllabus")}</span>
        <span class="chip">${escapeHtml(teacher.level || "Any level")}</span>
        <span class="chip">${escapeHtml(teacher.location || "Remote")}</span>
        <span class="chip">${escapeHtml(teacher.rating.toFixed(1))} star</span>
        <span class="chip">${escapeHtml(feeLabel)}</span>
        ${Number.isFinite(distanceKm) ? `<span class="chip">${escapeHtml(distanceKm.toFixed(1))} km</span>` : ""}
      </div>
      <p class="teacher-note">${escapeHtml(teacher.intro)}</p>
      <ul class="tutor-reasons">
        ${(reasons.length ? reasons : ["Good overall fit"]).slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
      <div class="button-row">
        <button type="button" class="secondary-btn" data-select-tutor="${escapeHtml(teacher.id)}">${selected ? "Selected" : "Select tutor"}</button>
        <button type="button" class="secondary-btn" data-copy-tutor="${escapeHtml(teacher.id)}">Copy tutor brief</button>
        <a class="chip ghost" href="https://wa.me/${routePhoneForMarket(request.market)}?text=${encodeURIComponent(message)}" target="_blank" rel="noreferrer">WhatsApp route</a>
      </div>
    </article>
  `;
};

const renderSummary = (request, selectedTutor, rankedTeachers) => {
  if (!tutorSummaryEl) return;
  if (!request) {
    tutorSummaryEl.innerHTML = `
      <span class="tag">Tutor preview</span>
      <h3>Tell us what you need to see a shortlist.</h3>
      <p class="hint">We'll show tutor matches here once the form is filled in.</p>
      <div class="result-links">
        <span class="chip">Subject</span>
        <span class="chip">Level</span>
        <span class="chip">Area</span>
        <span class="chip">Time</span>
      </div>
    `;
    return;
  }

  const topMatch = rankedTeachers[0]?.teacher;
  const targetTutor = selectedTutor || topMatch;
  const summaryChips = [
    request.syllabus || "Any syllabus",
    request.level || "Any level",
    request.area || "Any area",
    lessonModeLabel(request.mode),
    request.preferredTime || "Any time",
  ];

  tutorSummaryEl.innerHTML = `
    <span class="tag">${escapeHtml(request.market === "hongkong" ? "Hong Kong route" : "Malaysia route")}</span>
    <h3>${escapeHtml(currentRequestSummary(request))}</h3>
    <p class="hint">Best live match: ${escapeHtml(targetTutor?.name || topMatch?.name || "TBD")}</p>
    <div class="result-links">
      ${summaryChips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}
    </div>
    <p class="teacher-note">${escapeHtml(request.note || "No extra notes added yet.")}</p>
  `;
};

const renderMatches = (request) => {
  if (!tutorMatchesEl) return;

  const rankedTeachers = request ? rankTeachers(request).slice(0, 4) : teacherDirectory.slice().sort((a, b) => b.rating - a.rating).slice(0, 4).map((teacher) => ({
    teacher,
    score: teacher.rating * 10 + Math.round((teacher.reviews || 0) / 8),
    reasons: ["Popular all-round tutor", teacher.responseTime ? `Replies in about ${teacher.responseTime}` : "Responsive tutor", "Available for follow-up"],
    distanceKm: null,
  }));

  tutorMatchesEl.innerHTML = rankedTeachers.map((entry, index) => renderTutorCard(entry, request || sampleRequest, index, request ? "matched" : "featured")).join("");

  const requestBrief = request ? buildTutorBrief(request, selectedTutorId ? rankedTeachers.find((item) => item.teacher.id === selectedTutorId)?.teacher : null) : "No tutor request yet.";
  if (copyTutorBriefBtn) {
    copyTutorBriefBtn.hidden = !request;
    copyTutorBriefBtn.dataset.brief = requestBrief;
  }
  if (tutorWhatsappLink) {
    const phone = routePhoneForMarket(request?.market || "malaysia");
    const tutor = selectedTutorId ? rankedTeachers.find((item) => item.teacher.id === selectedTutorId)?.teacher : rankedTeachers[0]?.teacher;
    const message = request ? buildWhatsAppMessage(request, tutor) : buildWhatsAppMessage(sampleRequest, tutorDirectoryFallback());
    tutorWhatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  renderSummary(request, selectedTutorId ? rankedTeachers.find((item) => item.teacher.id === selectedTutorId)?.teacher : rankedTeachers[0]?.teacher, rankedTeachers);
};

const tutorDirectoryFallback = () => teacherDirectory[0];

const copyText = async (value) => {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
};

const setRequestStatus = (message) => {
  if (tutorRequestStatus) tutorRequestStatus.textContent = message;
};

const fillForm = (request) => {
  tutorNameInput.value = request.studentName || "";
  tutorPhoneInput.value = request.phone || "";
  tutorSubjectInput.value = request.subject || "";
  tutorTopicInput.value = request.topic || "";
  tutorSyllabusInput.value = request.syllabus || "";
  tutorLevelInput.value = request.level || "";
  tutorAreaInput.value = request.area || "";
  tutorModeInput.value = normalizeLessonMode(request.mode);
  tutorTimeInput.value = request.preferredTime || "";
  tutorBudgetInput.value = request.budget || "";
  tutorNoteInput.value = request.note || "";
  tutorConsentInput.checked = Boolean(request.consentWhatsapp);
};

const currentRequest = () => ({
  studentName: tutorNameInput.value.trim(),
  phone: tutorPhoneInput.value.trim(),
  subject: tutorSubjectInput.value.trim(),
  topic: tutorTopicInput.value.trim(),
  syllabus: tutorSyllabusInput.value.trim(),
  level: tutorLevelInput.value.trim(),
  area: tutorAreaInput.value.trim(),
  mode: normalizeLessonMode(tutorModeInput.value),
  preferredTime: tutorTimeInput.value.trim(),
  budget: tutorBudgetInput.value.trim(),
  note: tutorNoteInput.value.trim(),
  consentWhatsapp: Boolean(tutorConsentInput.checked),
  market: inferMarket(tutorAreaInput.value || tutorSubjectInput.value),
  createdAt: new Date().toISOString(),
  page: window.location.href,
});

const handleSubmit = (event) => {
  event.preventDefault();
  const request = currentRequest();
  if (!request.studentName || !request.subject || !request.level) {
    setRequestStatus("Add your name, subject, and level so we can match the right tutors.");
    return;
  }

  const ranked = rankTeachers(request);
  const selectedTutor = ranked[0]?.teacher || null;
  selectedTutorId = selectedTutor?.id || "";
  saveTutorRequest({
    ...request,
    id: `tutor-${Date.now()}`,
    selectedTutorId: selectedTutor?.id || "",
    selectedTutorName: selectedTutor?.name || "",
  });
  renderSummary(request, selectedTutor, ranked);
  renderMatches(request);
  if (copyTutorBriefBtn) {
    copyTutorBriefBtn.hidden = false;
    copyTutorBriefBtn.dataset.brief = buildTutorBrief(request, selectedTutor);
  }
  if (tutorWhatsappLink) {
    const phone = routePhoneForMarket(request.market);
    tutorWhatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(request, selectedTutor))}`;
  }
  setRequestStatus("Request saved. Your tutor shortlist is ready.");
  window.location.hash = "#matches";
};

const loadExistingRequest = () => readJson(REQUESTS_STORAGE_KEY, [])[0] || null;

const prefillFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  const level = params.get("level");
  const area = params.get("area");
  const mode = params.get("mode");
  if (subject) tutorSubjectInput.value = subject;
  if (level) tutorLevelInput.value = level;
  if (area) tutorAreaInput.value = area;
  if (mode && ["online", "physical", "either", "both"].includes(mode)) tutorModeInput.value = normalizeLessonMode(mode);
};

const applySample = () => {
  fillForm(sampleRequest);
  selectedTutorId = "maya-lim";
  const request = currentRequest();
  const ranked = rankTeachers(request);
  renderSummary(request, ranked[0]?.teacher || null, ranked);
  renderMatches(request);
  setRequestStatus("Sample details loaded. Edit them to match your own request.");
};

const clearForm = () => {
  tutorRequestForm.reset();
  selectedTutorId = teacherDirectory[0]?.id || "";
  renderSummary(null, null, []);
  renderMatches(null);
  setRequestStatus("Form cleared. Add your details to see tutor matches.");
};

let selectedTutorId = teacherDirectory[0]?.id || "";

prefillFromUrl();
const storedRequest = loadExistingRequest();
if (storedRequest) {
  fillForm(storedRequest);
  selectedTutorId = storedRequest.selectedTutorId || teacherDirectory.find((teacher) => teacher.name === storedRequest.selectedTutorName)?.id || teacherDirectory[0]?.id || "";
  const ranked = rankTeachers(storedRequest);
  renderSummary(storedRequest, ranked.find((item) => item.teacher.id === selectedTutorId)?.teacher || ranked[0]?.teacher || null, ranked);
  renderMatches(storedRequest);
  setRequestStatus("Loaded your latest saved request.");
} else {
  renderSummary(null, null, []);
  renderMatches(null);
}

tutorRequestForm?.addEventListener("submit", handleSubmit);
tutorSampleBtn?.addEventListener("click", applySample);
tutorResetBtn?.addEventListener("click", clearForm);
copyTutorBriefBtn?.addEventListener("click", async () => {
  const brief = copyTutorBriefBtn.dataset.brief || "";
  await copyText(brief);
  const previous = copyTutorBriefBtn.textContent;
  copyTutorBriefBtn.textContent = "Copied";
  window.setTimeout(() => {
    copyTutorBriefBtn.textContent = previous;
  }, 1200);
});

document.addEventListener("click", (event) => {
  const selectButton = event.target.closest("[data-select-tutor]");
  const copyButton = event.target.closest("[data-copy-tutor]");
  if (selectButton) {
    selectedTutorId = selectButton.dataset.selectTutor;
    const request = currentRequest();
    const ranked = rankTeachers(request);
    renderSummary(request, ranked.find((item) => item.teacher.id === selectedTutorId)?.teacher || ranked[0]?.teacher || null, ranked);
    renderMatches(request);
    setRequestStatus("Tutor selected. You can copy the brief or open WhatsApp next.");
  }
  if (copyButton) {
    const request = currentRequest();
    const ranked = rankTeachers(request);
    const tutor = ranked.find((item) => item.teacher.id === copyButton.dataset.copyTutor)?.teacher;
    const brief = buildTutorBrief(request, tutor || ranked[0]?.teacher || null);
    copyText(brief);
    setRequestStatus(`Copied a brief for ${tutor?.name || "the tutor"}.`);
  }
});

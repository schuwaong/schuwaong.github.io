const syllabusOptions = [
  "Cambridge IGCSE",
  "HKDSE",
  "IB MYP",
  "IB Diploma",
  "Singapore PSLE",
  "UK GCSE",
];

const yearOptions = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

const subjectTopics = {
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

const createOptions = (datalist, values) => {
  datalist.replaceChildren(
    ...values.map((value) => {
      const option = document.createElement("option");
      option.value = value;
      return option;
    }),
  );
};

const setSubjectOptions = () => {
  subjectSelect.replaceChildren(
    ...Object.keys(subjectTopics).map((subject) => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      return option;
    }),
  );
  subjectSelect.value = "Mathematics";
};

const setTopicOptions = () => {
  const topics = subjectTopics[subjectSelect.value] || [];
  createOptions(document.querySelector("#topicOptions"), topics);
  if (!topics.includes(topicInput.value)) {
    topicInput.value = topics[0] || "";
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

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getSampleLinks = (subject) => {
  if (subject === "Mathematics") return sampleLinks.Mathematics;
  if (["Physics", "Chemistry", "Biology"].includes(subject)) return sampleLinks.Science;
  return sampleLinks.Mathematics;
};

const renderGeneratedWorksheet = (event) => {
  event.preventDefault();
  const syllabus = syllabusInput.value.trim() || "Selected syllabus";
  const year = yearInput.value.trim() || "Selected year";
  const subject = subjectSelect.value;
  const topic = topicInput.value.trim() || "Selected topic";
  const type = getQuestionType();
  const marks = Number(marksInput.value);
  const questionCount = type === "MCQ" ? marks : Math.max(1, Math.ceil(marks / 4));
  const links = getSampleLinks(subject);
  const htmlUrl = `${pathPrefix}${links.html}`;
  const pdfUrl = `${pathPrefix}${links.pdf}`;

  generationOutput.innerHTML = `
    <div class="generated-card">
      <div>
        <span class="generated-title">${escapeHtml(subject)} ${escapeHtml(topic)} worksheet</span>
        <p class="feedback-copy">
          ${escapeHtml(syllabus)} · ${escapeHtml(year)} · ${escapeHtml(type)} · ${marks} marks · ${questionCount} question${questionCount === 1 ? "" : "s"}
        </p>
      </div>
      <div class="output-links" aria-label="Generated worksheet links">
        <a href="${htmlUrl}" target="_blank" rel="noreferrer">Open worksheet preview</a>
        <a href="${pdfUrl}" target="_blank" rel="noreferrer">Download worksheet PDF</a>
        <a href="${htmlUrl}" target="_blank" rel="noreferrer">Open answer link</a>
      </div>
      <div class="output-links" aria-label="Generation details">
        <span class="output-pill">Searchable syllabus selector used</span>
        <span class="output-pill">Searchable year selector used</span>
        <span class="output-pill">${type === "MCQ" ? "1 mark per MCQ enforced" : "Open-ended mark split estimated"}</span>
      </div>
    </div>
  `;
};

const renderFeedback = (event) => {
  event.preventDefault();
  const markScheme = document.querySelector("#markScheme").value.trim();
  const answer = document.querySelector("#studentAnswer").value.trim();
  const score = answer.length > 20 && markScheme.length > 20 ? "4 / 5" : "2 / 5";

  feedbackOutput.innerHTML = `
    <div class="feedback-card">
      <div>
        <span class="feedback-score">${score}</span>
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

createOptions(document.querySelector("#syllabusOptions"), syllabusOptions);
createOptions(document.querySelector("#yearOptions"), yearOptions);
setSubjectOptions();
setTopicOptions();
updateMarksRule();

subjectSelect.addEventListener("change", setTopicOptions);
marksInput.addEventListener("input", updateMarksRule);
document.querySelectorAll('input[name="questionType"]').forEach((input) => {
  input.addEventListener("change", updateMarksRule);
});
worksheetForm.addEventListener("submit", renderGeneratedWorksheet);
markingForm.addEventListener("submit", renderFeedback);

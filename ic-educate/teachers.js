const teacherLeadForm = document.getElementById("teacherLeadForm");
const teacherLeadMarket = document.getElementById("teacherLeadMarket");
const teacherLeadName = document.getElementById("teacherLeadName");
const teacherLeadPhone = document.getElementById("teacherLeadPhone");
const teacherLeadPhoto = document.getElementById("teacherLeadPhoto");
const teacherLeadSubjects = document.getElementById("teacherLeadSubjects");
const teacherLeadSyllabus = document.getElementById("teacherLeadSyllabus");
const teacherLeadLevels = document.getElementById("teacherLeadLevels");
const teacherLeadExperience = document.getElementById("teacherLeadExperience");
const teacherLeadArea = document.getElementById("teacherLeadArea");
const teacherLeadMode = document.getElementById("teacherLeadMode");
const teacherLeadTime = document.getElementById("teacherLeadTime");
const teacherLeadFee = document.getElementById("teacherLeadFee");
const teacherLeadQualifications = document.getElementById("teacherLeadQualifications");
const teacherLeadLanguages = document.getElementById("teacherLeadLanguages");
const teacherLeadNote = document.getElementById("teacherLeadNote");
const teacherLeadPublic = document.getElementById("teacherLeadPublic");
const teacherLeadConsent = document.getElementById("teacherLeadConsent");
const teacherLeadSubmitBtn = document.getElementById("teacherLeadSubmitBtn");
const teacherLeadSampleBtn = document.getElementById("teacherLeadSampleBtn");
const teacherLeadResetBtn = document.getElementById("teacherLeadResetBtn");
const teacherLeadStatus = document.getElementById("teacherLeadStatus");
const teacherLeadPreview = document.getElementById("teacherLeadPreview");
const teacherLeadQueue = document.getElementById("teacherLeadQueue");
const teacherLeadWhatsappLink = document.getElementById("teacherLeadWhatsappLink");
const teacherLeadCopyBtn = document.getElementById("teacherLeadCopyBtn");

const LEAD_STORAGE_KEY = "ic-educate-teacher-leads";
const PUBLIC_PROFILE_TABLE = "ic_educate_teacher_profiles";
const SUPABASE_SESSION_KEY = "icEducateSupabaseSession";
const QA_STUDENT_USER_ID = "qa-student-localhost";
const QA_STUDENT_EMAIL = "qa-student@localhost.test";
const SUPABASE_URL = window.IC_EDUCATE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";
const PUBLIC_TEACHER_PROFILES_ENABLED = window.IC_EDUCATE_PUBLIC_TEACHER_PROFILES_ENABLED === true;
let teacherLeads = [];
let pendingPhotoDataUrl = "";
let editingLeadId = "";

const teacherSession = (() => {
  try {
    const session = JSON.parse(localStorage.getItem(SUPABASE_SESSION_KEY) || "null");
    return session?.access_token ? session : null;
  } catch {
    return null;
  }
})();

const teacherUserId = teacherSession?.user?.id || "";
const teacherIsLocalQaSession = () =>
  teacherSession?.user?.id === QA_STUDENT_USER_ID && teacherSession?.user?.email === QA_STUDENT_EMAIL;

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

const normalizePhone = (value = "") => String(value).replace(/\D+/g, "");
const routePhone = (market = "malaysia") => (market === "hongkong" ? "85255115251" : "60178265300");
const routeLabel = (market = "malaysia") => (market === "hongkong" ? "Hong Kong" : "Malaysia");
const splitList = (value = "") =>
  String(value)
    .split(/[\n,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);

const modeList = (mode = "both") => (mode === "both" ? ["online", "physical"] : [mode]);
const profileStatusForLead = (lead) => (lead.isPublic ? "pending" : "draft");
const leadVisibilityLabel = (lead) => {
  const profileStatus = lead.profileStatus || profileStatusForLead(lead);
  if (!lead.isPublic) return "Private draft";
  if (profileStatus === "published") return "Visible in tutor finder";
  if (profileStatus === "hidden") return "Needs changes before publishing";
  return "Pending review";
};
const leadVisibilityTag = (lead) => {
  const profileStatus = lead.profileStatus || profileStatusForLead(lead);
  if (!lead.isPublic) return "";
  if (profileStatus === "published") return " · Live profile";
  if (profileStatus === "hidden") return " · Needs changes";
  return " · Review requested";
};

const createProfileId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `teacher-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const copyText = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "true");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }
};

const loadLeads = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEAD_STORAGE_KEY) || "[]");
    teacherLeads = Array.isArray(parsed) ? parsed : [];
  } catch {
    teacherLeads = [];
  }
};

const saveLeads = () => {
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(teacherLeads.slice(0, 80)));
    return true;
  } catch {
    const withoutPhotos = teacherLeads.map(({ photoDataUrl, ...lead }) => lead);
    try {
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(withoutPhotos.slice(0, 80)));
      teacherLeads = withoutPhotos;
      return true;
    } catch {
      return false;
    }
  }
};

const supabaseRequest = async (path, { method = "GET", body, prefer } = {}) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase not configured");
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${teacherSession?.access_token || SUPABASE_ANON_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.error || `HTTP ${response.status}`);
  return payload;
};

const mergeRemoteProfileStatuses = (rows = []) => {
  const profileMap = new Map(
    rows
      .filter((row) => row?.submission_id || row?.id)
      .map((row) => [String(row.submission_id || row.id), row])
  );
  if (!profileMap.size) return { remoteCount: 0, changedCount: 0 };

  let changedCount = 0;
  teacherLeads = teacherLeads.map((lead) => {
    const remote = profileMap.get(String(lead.id));
    if (!remote) return lead;

    const nextLead = {
      ...lead,
      remoteProfileSubmitted: true,
      profileStatus: remote.status || lead.profileStatus || profileStatusForLead(lead),
      reviewNote: remote.review_note || "",
      reviewedBy: remote.reviewed_by || "",
      reviewedAt: remote.reviewed_at || "",
      publishedAt: remote.published_at || "",
      updatedAt: remote.updated_at || lead.updatedAt,
    };

    if (
      nextLead.remoteProfileSubmitted !== Boolean(lead.remoteProfileSubmitted)
      || nextLead.profileStatus !== (lead.profileStatus || "")
      || nextLead.reviewNote !== (lead.reviewNote || "")
      || nextLead.reviewedBy !== (lead.reviewedBy || "")
      || nextLead.reviewedAt !== (lead.reviewedAt || "")
      || nextLead.publishedAt !== (lead.publishedAt || "")
      || nextLead.updatedAt !== (lead.updatedAt || "")
    ) {
      changedCount += 1;
    }

    return nextLead;
  });

  if (changedCount) {
    saveLeads();
  }

  return { remoteCount: profileMap.size, changedCount };
};

const loadOwnedRemoteProfiles = async () => {
  if (teacherIsLocalQaSession()) return [];
  if (!PUBLIC_TEACHER_PROFILES_ENABLED) return [];
  if (!teacherSession?.access_token || !teacherUserId) return [];
  return supabaseRequest(
    `/rest/v1/${PUBLIC_PROFILE_TABLE}?select=id,submission_id,status,review_note,reviewed_by,reviewed_at,published_at,updated_at&user_id=eq.${encodeURIComponent(teacherUserId)}&order=updated_at.desc&limit=80`,
    { method: "GET" }
  );
};

const syncRemoteProfileStatuses = async ({ announce = false } = {}) => {
  if (teacherIsLocalQaSession()) return null;
  if (!PUBLIC_TEACHER_PROFILES_ENABLED) return null;
  if (!(SUPABASE_URL && SUPABASE_ANON_KEY && teacherSession?.access_token && teacherUserId)) return null;

  try {
    const remoteProfiles = await loadOwnedRemoteProfiles();
    const syncResult = mergeRemoteProfileStatuses(Array.isArray(remoteProfiles) ? remoteProfiles : []);
    renderQueue();
    updatePreview();

    if (announce && teacherLeadStatus) {
      if (!syncResult.remoteCount) {
        teacherLeadStatus.textContent = "No shared teacher profiles are linked to this signed-in account yet.";
      } else if (syncResult.changedCount) {
        teacherLeadStatus.textContent = `Shared review status synced for ${syncResult.changedCount} profile${syncResult.changedCount === 1 ? "" : "s"}.`;
      } else {
        teacherLeadStatus.textContent = `Shared review status checked for ${syncResult.remoteCount} online profile${syncResult.remoteCount === 1 ? "" : "s"}.`;
      }
    }

    return syncResult;
  } catch (error) {
    if (announce && teacherLeadStatus) {
      teacherLeadStatus.textContent = `Shared review sync unavailable (${error.message}).`;
    }
    return null;
  }
};

const leadToRow = (lead) => ({
  user_id: teacherUserId || null,
  email: `${normalizePhone(lead.phone) || "teacher"}@ic-educate.local`,
  market: lead.market,
  status: lead.status,
  lead_type: "teacher",
  name: lead.name || null,
  phone: normalizePhone(lead.phone) || null,
  subject: lead.subject || null,
  topic: lead.topic || null,
  level: lead.level || null,
  area: lead.area || null,
  source: "teacher-signup",
  mode: lead.mode || null,
  preferred_time: lead.time || null,
  consent_whatsapp: Boolean(lead.consentWhatsapp),
  note: [
    lead.note,
    lead.experienceYears !== "" ? `Experience: ${lead.experienceYears} years` : "",
    lead.qualifications ? `Qualifications: ${lead.qualifications}` : "",
    lead.languages ? `Languages: ${lead.languages}` : "",
    lead.fee ? `Fee: ${lead.fee}` : "",
  ]
    .filter(Boolean)
    .join("\n") || null,
  page: window.location.href,
  created_at: lead.createdAt || new Date().toISOString(),
});

const leadToPublicProfileRow = (lead) => ({
  user_id: teacherUserId || null,
  submission_id: lead.id,
  display_name: lead.name,
  market: lead.market,
  subjects: splitList(lead.subject),
  syllabuses: splitList(lead.syllabus),
  levels: splitList(lead.levels),
  experience_years: Number(lead.experienceYears || 0),
  qualifications: lead.qualifications || null,
  languages: splitList(lead.languages),
  area: lead.area,
  lesson_modes: modeList(lead.mode),
  availability: splitList(lead.time),
  fee_label: lead.fee || null,
  bio: lead.note || null,
  status: "pending",
});

const saveLead = async (lead) => {
  const existingProfile = teacherLeads.find((item) => item.id === lead.id);
  const needsLeadSubmission = !existingProfile?.remoteLeadSubmitted;
  const needsProfileInsert = PUBLIC_TEACHER_PROFILES_ENABLED && lead.isPublic && !existingProfile?.remoteProfileSubmitted;
  const needsProfileUpdate = PUBLIC_TEACHER_PROFILES_ENABLED && lead.isPublic && Boolean(existingProfile?.remoteProfileSubmitted && teacherUserId);
  const next = [lead, ...teacherLeads.filter((item) => item.id !== lead.id)].slice(0, 80);
  teacherLeads = next;
  const savedLocally = saveLeads();
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !teacherIsLocalQaSession()) {
    const remoteResult = {
      savedLocally,
      sharedOnline: false,
      remoteLeadSubmitted: Boolean(existingProfile?.remoteLeadSubmitted),
      remoteProfileSubmitted: Boolean(existingProfile?.remoteProfileSubmitted),
    };
    const markRemoteState = (patch) => {
      teacherLeads = teacherLeads.map((item) => (item.id === lead.id ? { ...item, ...patch } : item));
      saveLeads();
    };
    try {
      if (needsLeadSubmission) {
        await supabaseRequest("/rest/v1/ic_educate_leads", {
          method: "POST",
          body: [leadToRow(lead)],
          prefer: "return=minimal",
        });
        remoteResult.sharedOnline = true;
        remoteResult.remoteLeadSubmitted = true;
        markRemoteState({ remoteLeadSubmitted: true });
      }
      if (needsProfileInsert) {
        await supabaseRequest(`/rest/v1/${PUBLIC_PROFILE_TABLE}`, {
          method: "POST",
          body: [leadToPublicProfileRow(lead)],
          prefer: "return=minimal",
        });
        remoteResult.sharedOnline = true;
        remoteResult.remoteProfileSubmitted = true;
        markRemoteState({ remoteProfileSubmitted: true });
      }
      if (needsProfileUpdate) {
        await supabaseRequest(`/rest/v1/${PUBLIC_PROFILE_TABLE}?submission_id=eq.${encodeURIComponent(lead.id)}`, {
          method: "PATCH",
          body: leadToPublicProfileRow(lead),
          prefer: "return=minimal",
        });
        remoteResult.sharedOnline = true;
      }
      return remoteResult;
    } catch (error) {
      return { ...remoteResult, error };
    }
  }
  return { savedLocally, sharedOnline: false };
};

const buildMessage = (lead) =>
  [
    `Hi ${lead.name || ""}, thanks for joining IC Educate.`,
    `Market: ${routeLabel(lead.market)}`,
    `Subjects: ${lead.subject || "Not added"}`,
    `Syllabus: ${lead.syllabus || "Not added"}`,
    `Levels: ${lead.levels || "Not added"}`,
    `Experience: ${lead.experienceYears || 0} years`,
    `Area: ${lead.area || "Not added"}`,
    `Lesson type: ${lead.mode || "Not added"}`,
    lead.time ? `Availability: ${lead.time}` : "",
    lead.fee ? `Fee: ${lead.fee}` : "",
    lead.qualifications ? `Qualifications: ${lead.qualifications}` : "",
    lead.languages ? `Languages: ${lead.languages}` : "",
    lead.note ? `Intro: ${lead.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");

const buildPreview = (lead) => `
  <div class="teacher-card-identity">
    ${
      lead.photoDataUrl
        ? `<img class="teacher-photo" src="${escapeHtml(lead.photoDataUrl)}" alt="${escapeHtml(lead.name || "Teacher")}">`
        : `<div class="teacher-avatar">${escapeHtml(teacherInitials(lead.name))}</div>`
    }
    <div>
      <span class="tag">${escapeHtml(routeLabel(lead.market))} teacher${escapeHtml(leadVisibilityTag(lead))}</span>
      <h3>${escapeHtml(lead.name || "Teacher profile")}</h3>
      <p class="hint">${escapeHtml(lead.subject || "Subjects")} · ${escapeHtml(lead.levels || "Any level")}</p>
    </div>
  </div>
  <div class="result-links">
    <span class="chip">${escapeHtml(lead.syllabus || "Syllabus")}</span>
    <span class="chip">${escapeHtml(lead.experienceYears !== "" ? `${lead.experienceYears} years` : "Experience")}</span>
    <span class="chip">${escapeHtml(lead.area || "Area")}</span>
    <span class="chip">${escapeHtml(lead.fee || "Fee")}</span>
  </div>
  ${lead.qualifications ? `<p class="teacher-credentials"><strong>Qualifications</strong> ${escapeHtml(lead.qualifications)}</p>` : ""}
  <p class="teacher-note">${escapeHtml(lead.note || "Short teaching intro goes here.")}</p>
  ${
    lead.reviewNote
      ? `<p class="teacher-credentials"><strong>Review note</strong> ${escapeHtml(lead.reviewNote)}</p>`
      : ""
  }
`;

const renderQueue = () => {
  const sorted = teacherLeads.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  teacherLeadQueue.innerHTML = sorted.length
    ? sorted.slice(0, 8).map((lead) => `
        <article class="saved-item">
          <div class="teacher-card-identity">
            ${
              lead.photoDataUrl
                ? `<img class="teacher-photo" src="${escapeHtml(lead.photoDataUrl)}" alt="${escapeHtml(lead.name || "Teacher")}">`
                : `<div class="teacher-avatar">${escapeHtml(teacherInitials(lead.name))}</div>`
            }
            <div>
              <strong>${escapeHtml(lead.name || "Teacher lead")}</strong>
              <p class="hint">${escapeHtml(lead.subject || "")} · ${escapeHtml(lead.levels || lead.level || "Any level")}</p>
            </div>
          </div>
          <div class="result-links">
            <span class="chip">${escapeHtml(leadVisibilityLabel(lead))}</span>
            <span class="chip">${escapeHtml(routeLabel(lead.market))}</span>
            <span class="chip">${escapeHtml(lead.area || "Any area")}</span>
            <span class="chip">${escapeHtml(lead.experienceYears !== "" && lead.experienceYears !== undefined ? `${lead.experienceYears} years` : "Experience not added")}</span>
          </div>
          <p class="teacher-note">${escapeHtml(lead.note || "")}</p>
          ${
            lead.reviewNote
              ? `<p class="teacher-credentials"><strong>Review note</strong> ${escapeHtml(lead.reviewNote)}</p>`
              : ""
          }
          ${
            lead.reviewedAt || lead.reviewedBy
              ? `<p class="hint">Last review${lead.reviewedBy ? ` by ${escapeHtml(lead.reviewedBy)}` : ""}${lead.reviewedAt ? ` · ${escapeHtml(new Date(lead.reviewedAt).toLocaleString())}` : ""}</p>`
              : ""
          }
          <div class="button-row">
            <button type="button" class="secondary-btn" data-edit-profile-id="${escapeHtml(lead.id)}">Edit profile</button>
            ${
              (lead.profileStatus || profileStatusForLead(lead)) === "published"
                ? `<a class="chip ghost" href="./find-tutor.html?screen=results&tutor=${encodeURIComponent(lead.id)}">View on home</a>`
                : ""
            }
            <a class="chip ghost" href="https://wa.me/${normalizePhone(lead.phone) || routePhone(lead.market)}?text=${encodeURIComponent(buildMessage(lead))}" target="_blank" rel="noreferrer">WhatsApp</a>
            <button type="button" class="secondary-btn copy-lead-btn" data-lead-id="${lead.id}">Copy brief</button>
          </div>
        </article>
      `).join("")
    : `<p class="muted">No teacher leads yet.</p>`;
};

const currentLead = () => ({
  id: editingLeadId || createProfileId(),
  market: teacherLeadMarket.value,
  status: "new",
  name: teacherLeadName.value.trim(),
  phone: teacherLeadPhone.value.trim(),
  subject: teacherLeadSubjects.value.trim(),
  topic: teacherLeadSubjects.value.trim().split(/[\n,;]+/g)[0]?.trim() || "",
  syllabus: teacherLeadSyllabus.value.trim(),
  level: teacherLeadSyllabus.value.trim(),
  levels: teacherLeadLevels.value.trim(),
  experienceYears: teacherLeadExperience.value === "" ? "" : Number(teacherLeadExperience.value),
  area: teacherLeadArea.value.trim(),
  mode: teacherLeadMode.value,
  time: teacherLeadTime.value.trim(),
  fee: teacherLeadFee.value.trim(),
  qualifications: teacherLeadQualifications.value.trim(),
  languages: teacherLeadLanguages.value.trim(),
  note: teacherLeadNote.value.trim(),
  isPublic: Boolean(teacherLeadPublic.checked),
  consentWhatsapp: Boolean(teacherLeadConsent.checked),
  createdAt: teacherLeads.find((item) => item.id === editingLeadId)?.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  remoteLeadSubmitted: Boolean(teacherLeads.find((item) => item.id === editingLeadId)?.remoteLeadSubmitted),
  remoteProfileSubmitted: Boolean(teacherLeads.find((item) => item.id === editingLeadId)?.remoteProfileSubmitted),
  profileStatus: teacherLeads.find((item) => item.id === editingLeadId)?.profileStatus || (Boolean(teacherLeadPublic.checked) ? "pending" : "draft"),
  reviewNote: teacherLeads.find((item) => item.id === editingLeadId)?.reviewNote || "",
  reviewedBy: teacherLeads.find((item) => item.id === editingLeadId)?.reviewedBy || "",
  reviewedAt: teacherLeads.find((item) => item.id === editingLeadId)?.reviewedAt || "",
  source: "teacher-signup",
  photoDataUrl: pendingPhotoDataUrl || teacherLeads.find((item) => item.id === editingLeadId)?.photoDataUrl || "",
});

const fillForm = (lead) => {
  teacherLeadMarket.value = lead.market || "malaysia";
  teacherLeadName.value = lead.name || "";
  teacherLeadPhone.value = lead.phone || "";
  teacherLeadSubjects.value = lead.subject || "";
  teacherLeadSyllabus.value = lead.syllabus || lead.level || "";
  teacherLeadLevels.value = lead.levels || "";
  teacherLeadExperience.value = lead.experienceYears ?? "";
  teacherLeadArea.value = lead.area || "";
  teacherLeadMode.value = lead.mode || "both";
  teacherLeadTime.value = lead.time || "";
  teacherLeadFee.value = lead.fee || "";
  teacherLeadQualifications.value = lead.qualifications || "";
  teacherLeadLanguages.value = lead.languages || "";
  teacherLeadNote.value = lead.note || "";
  teacherLeadPublic.checked = lead.isPublic !== false;
  teacherLeadConsent.checked = Boolean(lead.consentWhatsapp);
  pendingPhotoDataUrl = lead.photoDataUrl || "";
};

const updatePreview = () => {
  const lead = currentLead();
  teacherLeadPreview.innerHTML = buildPreview(lead);
  teacherLeadWhatsappLink.href = `https://wa.me/${routePhone(lead.market)}?text=${encodeURIComponent(buildMessage(lead))}`;
};

teacherLeadForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const lead = currentLead();
  if (!lead.name || !lead.phone || !lead.subject || !lead.syllabus || !lead.levels || lead.experienceYears === "" || !lead.area) {
    teacherLeadStatus.textContent = "Please add name, phone, subjects, syllabus, student levels, experience, and area.";
    return;
  }
  if (teacherLeadPhoto.files?.[0]) {
    lead.photoDataUrl = await readFileAsDataUrl(teacherLeadPhoto.files[0]);
  }
  teacherLeadSubmitBtn.disabled = true;
  teacherLeadSubmitBtn.textContent = "Saving...";
  const result = await saveLead(lead);
  editingLeadId = lead.id;
  teacherLeadSubmitBtn.disabled = false;
  teacherLeadSubmitBtn.textContent = "Update teacher profile";
  if (!result.savedLocally) {
    teacherLeadStatus.textContent = "The profile could not be saved. Try a smaller profile photo and submit again.";
  } else if (result.sharedOnline) {
    teacherLeadStatus.textContent = lead.isPublic
      ? "Profile saved and submitted for review. It will appear in tutor search after approval."
      : "Private draft saved.";
  } else if (result.error) {
    teacherLeadStatus.textContent = lead.isPublic
      ? `Profile saved on this device. Review submission is unavailable (${result.error.message}).`
      : `Private draft saved on this device (${result.error.message}).`;
  } else {
    teacherLeadStatus.textContent = lead.isPublic
      ? "Profile saved on this device and marked for review."
      : "Private draft saved on this device.";
  }
  renderQueue();
  updatePreview();
  await syncRemoteProfileStatuses();
});

teacherLeadSampleBtn?.addEventListener("click", () => {
  fillForm({
    market: "malaysia",
    name: "Maya Tan",
    phone: "+60 12-345 6789",
    subject: "Mathematics, Algebra, Statistics",
    syllabus: "SPM, Cambridge IGCSE",
    levels: "Secondary, Form 4-5, IGCSE",
    experienceYears: 6,
    area: "Petaling Jaya",
    mode: "both",
    time: "Weekday evenings, Sunday afternoon",
    fee: "RM90/hr",
    qualifications: "BSc Mathematics, Cambridge curriculum training",
    languages: "English, Mandarin, Bahasa Melayu",
    note: "Exam-focused tutor who explains step by step and gives weekly homework follow-up.",
    isPublic: true,
    consentWhatsapp: true,
  });
  editingLeadId = "";
  teacherLeadSubmitBtn.textContent = "Save teacher profile";
  updatePreview();
  teacherLeadStatus.textContent = "Sample teacher profile loaded.";
});

teacherLeadResetBtn?.addEventListener("click", () => {
  teacherLeadForm.reset();
  teacherLeadMarket.value = "malaysia";
  teacherLeadPublic.checked = true;
  pendingPhotoDataUrl = "";
  editingLeadId = "";
  teacherLeadSubmitBtn.textContent = "Save teacher profile";
  updatePreview();
  teacherLeadStatus.textContent = "Form cleared.";
});

teacherLeadForm?.addEventListener("input", updatePreview);

teacherLeadPhoto?.addEventListener("change", async () => {
  const file = teacherLeadPhoto.files?.[0];
  pendingPhotoDataUrl = file ? await readFileAsDataUrl(file) : "";
  updatePreview();
});

teacherLeadCopyBtn?.addEventListener("click", async () => {
  const lead = currentLead();
  await copyText(buildMessage(lead));
  teacherLeadStatus.textContent = "Copied teacher brief.";
});

document.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-profile-id]");
  if (editButton) {
    const lead = teacherLeads.find((item) => item.id === editButton.dataset.editProfileId);
    if (!lead) return;
    editingLeadId = lead.id;
    fillForm(lead);
    updatePreview();
    teacherLeadSubmitBtn.textContent = "Update teacher profile";
    teacherLeadStatus.textContent = `Editing ${lead.name || "teacher profile"}.`;
    teacherLeadForm.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const button = event.target.closest("[data-lead-id]");
  if (!button) return;
  const lead = teacherLeads.find((item) => item.id === button.dataset.leadId);
  if (!lead) return;
  await copyText(buildMessage(lead));
  teacherLeadStatus.textContent = `Copied brief for ${lead.name || "the teacher"}.`;
});

loadLeads();
updatePreview();
renderQueue();
void syncRemoteProfileStatuses({ announce: true });

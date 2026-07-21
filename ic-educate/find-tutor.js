const REQUESTS_STORAGE_KEY = "ic-educate-requests";
const MARKETPLACE_STORAGE_KEY = "ic-educate-marketplace";
const TEACHER_PROMOS_STORAGE_KEY = "ic-educate-teacher-promos";
const MY_TEACHERS_STORAGE_KEY = "ic-educate-my-teachers";
const FRIENDS_STORAGE_KEY = "ic-educate-friends";
const STUDENT_PROFILE_STORAGE_KEY = "ic-educate-student-profile";
const MARKETPLACE_MESSAGES_STORAGE_KEY = "ic-educate-marketplace-messages";
const TEACHER_PROFILES_STORAGE_KEY = "ic-educate-teacher-leads";
const SUPABASE_SESSION_KEY = "icEducateSupabaseSession";
const PUBLIC_PROFILE_TABLE = "ic_educate_teacher_profiles";
const SUPABASE_URL = window.IC_EDUCATE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";
const PUBLIC_TEACHER_PROFILES_ENABLED = window.IC_EDUCATE_PUBLIC_TEACHER_PROFILES_ENABLED === true;
const QA_STUDENT_USER_ID = "qa-student-localhost";
const QA_STUDENT_EMAIL = "qa-student@localhost.test";
const AUTH_RETURN_SCREENS = new Set(["discover", "results", "student-profile", "upcoming"]);

const tutorRequestForm = document.getElementById("tutorRequestForm");
const tutorRequestBtn = document.getElementById("tutorRequestBtn");
const tutorSampleBtn = document.getElementById("tutorSampleBtn");
const tutorResetBtn = document.getElementById("tutorResetBtn");
const tutorRequestStatus = document.getElementById("tutorRequestStatus");
const tutorSummaryEl = document.getElementById("tutorSummary");
const tutorMatchesEl = document.getElementById("tutorMatches");
const copyTutorBriefBtn = document.getElementById("copyTutorBriefBtn");
const tutorWhatsappLink = document.getElementById("tutorWhatsappLink");
const detectLocationBtn = document.getElementById("detectLocationBtn");
const locationStatusEl = document.getElementById("locationStatus");
const tutorProfileEl = document.getElementById("tutorProfile");
const communityTeacherPanelEl = document.getElementById("communityTeacherPanel");
const communityTeacherGridEl = document.getElementById("communityTeacherGrid");
const railTopTutorEl = document.getElementById("railTopTutor");
const resultsRequestChipsEl = document.getElementById("resultsRequestChips");
const discoverSubjectRailEl = document.getElementById("discoverSubjectRail");
const discoverFeaturedTutorsEl = document.getElementById("discoverFeaturedTutors");
const discoverFeedGridEl = document.getElementById("discoverFeedGrid");
const discoverFeedTitleEl = document.getElementById("discoverFeedTitle");
const discoverSavedTutorStripEl = document.getElementById("discoverSavedTutorStrip");
const discoverFriendActivityEl = document.getElementById("discoverFriendActivity");
const homeModeInput = document.getElementById("homeMode");
const homeSubjectInput = document.getElementById("homeSubject");
const homeSyllabusInput = document.getElementById("homeSyllabus");
const homeLevelInput = document.getElementById("homeLevel");
const homeAreaInput = document.getElementById("homeArea");
const homeStartStatusEl = document.getElementById("homeStartStatus");
const teacherPromoForm = document.getElementById("teacherPromoForm");
const teacherPromoFeedEl = document.getElementById("teacherPromoFeed");
const promoTeacherNameInput = document.getElementById("promoTeacherName");
const promoSubjectInput = document.getElementById("promoSubject");
const promoHeadlineInput = document.getElementById("promoHeadline");
const promoMediaInput = document.getElementById("promoMediaInput");
const promoCaptionInput = document.getElementById("promoCaption");
const myTeacherForm = document.getElementById("myTeacherForm");
const myTeacherNameInput = document.getElementById("myTeacherName");
const myTeacherFocusInput = document.getElementById("myTeacherFocus");
const myTeacherAreaInput = document.getElementById("myTeacherArea");
const myTeachersListEl = document.getElementById("myTeachersList");
const friendsForm = document.getElementById("friendsForm");
const friendNameInput = document.getElementById("friendName");
const friendFocusInput = document.getElementById("friendFocus");
const friendNoteInput = document.getElementById("friendNote");
const friendsListEl = document.getElementById("friendsList");
const searchTopMatchEl = document.getElementById("searchTopMatch");
const bookingTutorCardEl = document.getElementById("bookingTutorCard");
const bookingDayPickerEl = document.getElementById("bookingDayPicker");
const bookingSlotGridEl = document.getElementById("bookingSlotGrid");
const bookingSummaryEl = document.getElementById("bookingSummary");
const bookingStatusEl = document.getElementById("bookingStatus");
const bookingVenueInput = document.getElementById("bookingVenue");
const bookLessonModeInput = document.getElementById("bookLessonMode");
const bookingConfirmBtn = document.getElementById("bookingConfirmBtn");
const studentProfilePanelEl = document.getElementById("studentProfilePanel");
const marketplaceSignOutBtn = document.getElementById("marketplaceSignOutBtn");
const marketplaceBackendStatusEl = document.getElementById("marketplaceBackendStatus");
const marketplaceAuthMessageEl = document.getElementById("marketplaceAuthMessage");
const marketplaceAccountSummaryEl = document.getElementById("marketplaceAccountSummary");
const marketplaceAccountPanelEl = document.getElementById("marketplaceAccountPanel");
const marketplaceGuestUtilitiesEl = document.getElementById("marketplaceGuestUtilities");
const upcomingClassesPanelEl = document.getElementById("upcomingClassesPanel");
const upcomingGuestUtilitiesEl = document.getElementById("upcomingGuestUtilities");
const savedRequestsListEl = document.getElementById("savedRequestsList");
const resultsFilterPanelEl = document.getElementById("resultsFilterPanel");
const filterMinRatingInput = document.getElementById("filterMinRating");
const filterLessonModeInput = document.getElementById("filterLessonMode");
const filterAvailabilityInput = document.getElementById("filterAvailability");
const filterBudgetCapInput = document.getElementById("filterBudgetCap");
const filterTutorGenderInput = document.getElementById("filterTutorGender");
const tutorDirectorySearchInput = document.getElementById("tutorDirectorySearch");
const tutorDirectorySearchBtn = document.getElementById("tutorDirectorySearchBtn");
const findDetectLocationBtn = document.getElementById("findDetectLocationBtn");
const recommendedPanelEl = document.getElementById("recommendedPanel");
const directorySearchLabelEl = document.getElementById("directorySearchLabel");
const studioPrimeFolderInput = document.getElementById("studioPrimeFolderInput");
const resourceSearchInput = document.getElementById("resourceSearchInput");
const resourceFolderStatusEl = document.getElementById("resourceFolderStatus");
const resourceFileListEl = document.getElementById("resourceFileList");
const studentLearningEditor = document.getElementById("studentLearningEditor");
const studentLevelInput = document.getElementById("studentLevelInput");
const studentNameInput = document.getElementById("studentNameInput");
const profileRoleInput = document.getElementById("profileRoleInput");
const studentProfileEditBtn = document.getElementById("studentProfileEditBtn");
const studentPhotoInput = document.getElementById("studentPhotoInput");
const studentPhotoPreviewEl = document.getElementById("studentPhotoPreview");
const studentPhotoRemoveBtn = document.getElementById("studentPhotoRemoveBtn");
const inboxThreadListEl = document.getElementById("inboxThreadList");
const inboxMessageViewEl = document.getElementById("inboxMessageView");
const inboxSocialRailEl = document.getElementById("inboxSocialRail");
const adminQueueBoardEl = document.getElementById("adminQueueBoard");
const adminNewCountEl = document.getElementById("adminNewCount");
const adminContactedCountEl = document.getElementById("adminContactedCount");
const adminMatchedCountEl = document.getElementById("adminMatchedCount");
const adminClosedCountEl = document.getElementById("adminClosedCount");
const teachLeadBoardEl = document.getElementById("teachLeadBoard");
const upcomingCalendarBtn = document.getElementById("upcomingCalendarBtn");

const resultSortButtons = Array.from(document.querySelectorAll("[data-result-sort]"));
const modeChoiceButtons = Array.from(document.querySelectorAll("[data-mode-choice]"));
const quickSubjectButtons = Array.from(document.querySelectorAll("[data-quick-subject]"));
const homeModeButtons = Array.from(document.querySelectorAll("[data-home-mode]"));
const homeSubjectButtons = Array.from(document.querySelectorAll("[data-home-subject]"));
const directoryTypeButtons = Array.from(document.querySelectorAll("[data-directory-type]"));
const screenNavButtons = Array.from(document.querySelectorAll(".marketplace-topnav-btn, .rail-nav-btn, .bottom-nav-btn"));
const appScreens = Array.from(document.querySelectorAll(".app-screen"));
const APP_SCREEN_IDS = new Set(appScreens.map((screen) => screen.dataset.screen).filter(Boolean));

const ROOT_SCREENS = new Set(["results", "inbox", "upcoming", "resources", "student-profile"]);
const CHILD_SCREENS = new Set(["discover", "discover-more", "search", "profile", "book", "requests", "teach", "admin"]);
const SCREEN_PARENT_TARGETS = {
  discover: "results",
  "discover-more": "results",
  search: "results",
  profile: "results",
  book: "results",
  requests: "results",
  teach: "student-profile",
  admin: "teach",
};

const embeddedParamEnabled = () => {
  try {
    return new URLSearchParams(window.location.search).has("embedded");
  } catch {
    return false;
  }
};

const isEmbeddedContext = () =>
  window.location.protocol === "file:"
  || document.body.classList.contains("embedded-shell")
  || embeddedParamEnabled();

const isLocalQaRuntime = () =>
  ["http:", "https:"].includes(window.location.protocol)
  && ["localhost", "127.0.0.1"].includes(window.location.hostname)
  && !isEmbeddedContext();

const isInstalledAppOrigin = () => ["file:", "capacitor:", "ionic:"].includes(window.location.protocol);

const isAllowedQaRuntime = () => isLocalQaRuntime() || isInstalledAppOrigin();

const sanitizeStudentReturnTo = (screenId) => (AUTH_RETURN_SCREENS.has(screenId || "") ? screenId : "student-profile");

const buildMarketplaceLoginUrl = (screenId = "student-profile") => {
  const url = new URL("./login/index.html", window.location.href);
  url.searchParams.set("returnTo", sanitizeStudentReturnTo(screenId));
  if (embeddedParamEnabled()) url.searchParams.set("embedded", "1");
  else url.searchParams.delete("embedded");
  return url.toString();
};

const lockedMarketplaceCardMarkup = ({ title, hint, returnTo }) => `
  <article class="screen-panel marketplace-locked-state">
    <div class="marketplace-locked-hero">
      <div class="marketplace-locked-icon" aria-hidden="true">
        <svg class="icon"><use href="#icon-lock-card"></use></svg>
      </div>
      <div class="marketplace-locked-copy">
        <span class="tag">Sign in required</span>
        <h3>${escapeHtml(title)}</h3>
        <p class="hint">${escapeHtml(hint)}</p>
      </div>
    </div>
    <div class="button-row">
      <a class="button primary" href="${buildMarketplaceLoginUrl(returnTo)}" data-marketplace-login-link="true">Sign in</a>
      <button type="button" class="secondary-btn" data-screen-target="results">Back to matches</button>
    </div>
  </article>
`;

const activeMarketplaceLoginLink = () => document.querySelector("[data-marketplace-login-link]");

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

const DEFAULT_LOCATION_HINT =
  locationStatusEl?.textContent?.trim() || "We can auto-detect your nearest supported area.";

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

const seedTeacherDirectory = [
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
    gender: "female",
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
    gender: "male",
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
    gender: "female",
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
    gender: "male",
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
    gender: "female",
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
    gender: "male",
  },
];

let teacherDirectory = [...seedTeacherDirectory];

const tuitionCentres = [
  {
    id: "bright-path-pj",
    name: "Bright Path Learning Centre",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    levels: ["IGCSE", "Secondary"],
    rating: 4.9,
    reviews: 86,
    price: 65,
    priceLabel: "From RM65/class",
    area: "Petaling Jaya",
    distanceKm: 2.4,
    mode: ["physical", "online"],
    nextIntake: "Tuesday evening",
  },
  {
    id: "scholars-hub-kl",
    name: "Scholars Hub KL",
    subjects: ["English", "Mathematics", "Biology"],
    levels: ["IGCSE", "IB MYP"],
    rating: 4.8,
    reviews: 112,
    price: 58,
    priceLabel: "From RM58/class",
    area: "Kuala Lumpur",
    distanceKm: 5.8,
    mode: ["physical"],
    nextIntake: "Saturday morning",
  },
  {
    id: "axis-science-subang",
    name: "Axis Science Academy",
    subjects: ["Physics", "Chemistry", "Biology"],
    levels: ["IGCSE", "A Level"],
    rating: 4.7,
    reviews: 64,
    price: 72,
    priceLabel: "From RM72/class",
    area: "Subang Jaya",
    distanceKm: 8.1,
    mode: ["physical", "online"],
    nextIntake: "Thursday evening",
  },
  {
    id: "northstar-online",
    name: "Northstar Online Tuition",
    subjects: ["Mathematics", "English", "Science"],
    levels: ["Primary", "Secondary", "IGCSE"],
    rating: 4.8,
    reviews: 143,
    price: 45,
    priceLabel: "From RM45/class",
    area: "Online",
    distanceKm: null,
    mode: ["online"],
    nextIntake: "Starts this week",
  },
];

const TEACHER_PROFILE_DETAILS = {
  "maya-lim": {
    yearsExperience: "8 years",
    lessonsCompleted: "1,200+ lessons",
    languages: ["English", "Bahasa Melayu"],
    districts: ["Kuala Lumpur", "Bangsar", "Damansara", "Petaling Jaya"],
    bestFor: ["Algebra recovery", "Exam planning", "Step-by-step confidence building"],
    credentials: "BSc Mathematics, former IGCSE tuition lead",
    reviewQuote: "Maya made algebra feel calm again. My daughter stopped panicking before papers and started finishing them.",
    weeklyAvailability: {
      Mon: ["4:00 pm", "7:30 pm"],
      Tue: ["10:00 am", "2:00 pm"],
      Wed: ["4:00 pm", "7:30 pm"],
      Thu: ["10:00 am", "2:00 pm"],
      Fri: ["4:00 pm"],
      Sat: ["10:00 am", "1:00 pm"],
      Sun: ["11:00 am"],
    },
  },
  "aaron-chen": {
    yearsExperience: "6 years",
    lessonsCompleted: "900+ lessons",
    languages: ["English", "Mandarin"],
    districts: ["Online only", "Malaysia-wide remote"],
    bestFor: ["Physics foundations", "Quick concept checks", "Paper walkthroughs"],
    credentials: "BEng Mechanical Engineering, science camp coach",
    reviewQuote: "Aaron explains physics without making it feel intimidating. The worked examples were the turning point.",
    weeklyAvailability: {
      Mon: ["7:30 pm"],
      Tue: ["7:30 pm"],
      Wed: ["7:30 pm"],
      Thu: ["7:30 pm"],
      Fri: ["7:30 pm"],
      Sat: ["11:00 am", "4:00 pm"],
      Sun: ["11:00 am"],
    },
  },
  "nur-syahirah": {
    yearsExperience: "7 years",
    lessonsCompleted: "1,100+ lessons",
    languages: ["English", "Bahasa Melayu"],
    districts: ["Petaling Jaya", "Damansara", "Subang"],
    bestFor: ["Biology topic recovery", "Study routine resets", "Exam stress support"],
    credentials: "BSc Biomedical Science, secondary biology specialist",
    reviewQuote: "She helped my son go from memorising blindly to actually understanding the topic flow.",
    weeklyAvailability: {
      Mon: ["2:30 pm"],
      Tue: ["2:30 pm"],
      Wed: ["2:30 pm"],
      Thu: ["2:30 pm"],
      Fri: ["2:30 pm"],
      Sat: ["10:30 am", "3:00 pm"],
      Sun: ["10:30 am"],
    },
  },
  "devin-patel": {
    yearsExperience: "5 years",
    lessonsCompleted: "760+ lessons",
    languages: ["English"],
    districts: ["Subang Jaya", "Sunway", "USJ", "Online"],
    bestFor: ["Chemistry problem solving", "Stoichiometry fixes", "Practice-heavy revision"],
    credentials: "BSc Chemistry, lab mentor and tutor",
    reviewQuote: "Devin is very direct in a good way. Every lesson ends with a clear set of questions to fix.",
    weeklyAvailability: {
      Mon: ["9:30 am", "8:00 pm"],
      Tue: ["9:30 am"],
      Wed: ["8:00 pm"],
      Thu: ["9:30 am"],
      Fri: ["8:00 pm"],
      Sat: ["2:00 pm"],
      Sun: [],
    },
  },
  "siti-farhana": {
    yearsExperience: "9 years",
    lessonsCompleted: "1,500+ lessons",
    languages: ["English", "Bahasa Melayu"],
    districts: ["Shah Alam", "Subang", "Klang", "Online"],
    bestFor: ["Maths confidence", "Weekly structure", "Secondary syllabus catch-up"],
    credentials: "MEd Curriculum, former maths department mentor",
    reviewQuote: "Siti brings a structure parents can actually follow at home. The weekly updates are excellent.",
    weeklyAvailability: {
      Mon: ["3:30 pm"],
      Tue: ["3:30 pm"],
      Wed: ["3:30 pm"],
      Thu: ["3:30 pm"],
      Fri: ["3:30 pm"],
      Sat: ["9:30 am", "1:30 pm"],
      Sun: ["9:30 am"],
    },
  },
  "felix-wong": {
    yearsExperience: "7 years",
    lessonsCompleted: "980+ lessons",
    languages: ["English", "Cantonese", "Mandarin"],
    districts: ["Kowloon", "Hong Kong Island", "Online"],
    bestFor: ["Essay feedback", "Reading comprehension", "IB writing structure"],
    credentials: "BA English Literature, IB writing coach",
    reviewQuote: "Felix made writing feel less vague. Every correction is specific and easy to improve from.",
    weeklyAvailability: {
      Mon: ["8:00 am", "7:30 pm"],
      Tue: ["8:00 am"],
      Wed: ["7:30 pm"],
      Thu: ["8:00 am"],
      Fri: ["7:30 pm"],
      Sat: ["11:00 am"],
      Sun: ["11:00 am"],
    },
  },
};

const LOCATION_LOOKUP = [
  { match: ["kuala lumpur", "kl", "bukit bintang"], coords: { lat: 3.139, lng: 101.6869 }, label: "Kuala Lumpur", market: "malaysia" },
  { match: ["petaling jaya", "pj", "damansara"], coords: { lat: 3.1073, lng: 101.6067 }, label: "Petaling Jaya", market: "malaysia" },
  { match: ["subang", "subang jaya"], coords: { lat: 3.0738, lng: 101.5183 }, label: "Subang Jaya", market: "malaysia" },
  { match: ["shah alam"], coords: { lat: 3.0733, lng: 101.5185 }, label: "Shah Alam", market: "malaysia" },
  { match: ["hong kong island", "hk island", "hong kong", "central", "causeway bay"], coords: { lat: 22.2819, lng: 114.1587 }, label: "Hong Kong Island", market: "hongkong" },
  { match: ["kowloon", "tsim sha tsui", "tsuen wan", "mong kok", "yau ma tei"], coords: { lat: 22.3167, lng: 114.17 }, label: "Kowloon", market: "hongkong" },
  { match: ["new territories", "shatin", "sha tin", "tuen mun"], coords: { lat: 22.3833, lng: 114.205 }, label: "New Territories", market: "hongkong" },
];

const discoverRoutes = [
  { subject: "Mathematics", subtitle: "IGCSE, HK DSE, secondary catch-up", area: "Petaling Jaya", level: "IGCSE" },
  { subject: "Physics", subtitle: "Worked examples and exam papers", area: "Kuala Lumpur", level: "IGCSE" },
  { subject: "Chemistry", subtitle: "Stoichiometry and structured practice", area: "Subang Jaya", level: "IGCSE" },
  { subject: "English", subtitle: "Reading, writing, IB and essay structure", area: "Kowloon", level: "MYP" },
];

const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const discoverFeedCards = [
  {
    title: "Exam rescue this weekend",
    meta: "Malaysia · Parents booking fast",
    description: "Parents needing urgent IGCSE Maths and Science support before papers.",
    actionLabel: "Open Maths route",
    subject: "Mathematics",
    level: "IGCSE",
    area: "Kuala Lumpur",
  },
  {
    title: "Hong Kong DSE pathway",
    meta: "Hong Kong · DSE and IB",
    description: "Students looking for structured English and Maths tutors around Kowloon and the Island.",
    actionLabel: "Open Hong Kong",
    screen: "discover",
    href: "./hong-kong.html",
  },
  {
    title: "Online-only shortlist",
    meta: "Cross-city remote tutors",
    description: "Great when the parent wants speed first and is happy to start online this week.",
    actionLabel: "Browse online tutors",
    subject: "Physics",
    level: "IGCSE",
    area: "Online",
  },
  {
    title: "Confidence-building tutors",
    meta: "Lower-pressure teaching style",
    description: "Good for students who need patient step-by-step support before jumping into drill work.",
    actionLabel: "See best fits",
    subject: "English",
    level: "MYP",
    area: "Kowloon",
  },
  {
    title: "Topic packs after the match",
    meta: "StudioPrime materials layer",
    description: "Notes, worksheets, and generated papers can sit behind the tutor flow to drive better retention and repeat requests.",
    actionLabel: "Open student resources",
    href: "./student-resources.html",
  },
];

const demoInboxThreads = [
  {
    id: "thread-aisha-maya",
    title: "Aisha / Maya Lim",
    subtitle: "IGCSE Maths · Petaling Jaya",
    status: "Ready to confirm",
    unread: 2,
    messages: [
      { from: "Parent", text: "We can do Saturday morning. Is Maya still available?", time: "9:12 am" },
      { from: "Operator", text: "Yes, 10:00 am is open. I can lock it in now.", time: "9:16 am" },
      { from: "Tutor", text: "Happy to take this slot. Please send the brief and weak topics.", time: "9:19 am" },
    ],
  },
  {
    id: "thread-physics-aaron",
    title: "Ken / Aaron Chen",
    subtitle: "IGCSE Physics · Online",
    status: "Waiting on parent",
    unread: 0,
    messages: [
      { from: "Operator", text: "I found an online Physics tutor who can start this week.", time: "Yesterday" },
      { from: "Parent", text: "Please share his rate and available evenings.", time: "Yesterday" },
      { from: "Operator", text: "He replies within 9 minutes and has weekend slots too.", time: "Yesterday" },
    ],
  },
  {
    id: "thread-hk-felix",
    title: "Chloe / Felix Wong",
    subtitle: "IB English · Kowloon",
    status: "New reply",
    unread: 1,
    messages: [
      { from: "Tutor", text: "I can do Tuesdays 7:30 pm and Saturdays 11:00 am.", time: "7:04 am" },
      { from: "Operator", text: "Perfect, I’ll send those slots to the parent.", time: "7:08 am" },
    ],
  },
];

const demoTeacherPromos = [
  {
    id: "promo-maya-algebra",
    teacherName: "Maya Lim",
    subject: "Mathematics",
    headline: "IGCSE algebra rescue sessions open",
    caption: "Short, focused lessons for students falling behind in algebra, fractions, and confidence before exam season.",
    mediaType: "image",
    mediaUrl: "./assets/gradequest-role-teacher.png",
    market: "malaysia",
    coverPosition: "center center",
  },
  {
    id: "promo-felix-writing",
    teacherName: "Felix Wong",
    subject: "English",
    headline: "Essay structure coaching for IB and IGCSE",
    caption: "Writing feedback, rubric breakdowns, and weekly improvement plans for students who need clearer arguments.",
    mediaType: "video",
    mediaUrl: "./assets/videos/gradequest-splash.mp4",
    market: "hongkong",
    coverPosition: "center center",
  },
];

const demoMyTeachers = [
  { id: "my-maya", name: "Maya Lim", focus: "Maths confidence and algebra", area: "Petaling Jaya" },
  { id: "my-aaron", name: "Aaron Chen", focus: "Physics worked examples", area: "Online" },
];
const DEMO_MY_TEACHER_IDS = new Set(demoMyTeachers.map((teacher) => teacher.id));

const demoFriends = [
  { id: "friend-chloe", name: "Chloe", focus: "IB English", note: "Friend referral from Kowloon" },
  { id: "friend-adam", name: "Adam", focus: "IGCSE Maths", note: "Parent group intro lead" },
];

const teacherDemandCards = [
  {
    id: "teach-demand-maths",
    teacher: "Maya Lim",
    subject: "Mathematics",
    level: "IGCSE",
    area: "Petaling Jaya",
    mode: "physical",
    timing: "Weekend",
    fit: "Top fit by subject, rating, and distance",
  },
  {
    id: "teach-demand-english",
    teacher: "Felix Wong",
    subject: "English",
    level: "IB / IGCSE",
    area: "Kowloon",
    mode: "online",
    timing: "Tue 7:30 pm",
    fit: "Best for structured writing feedback and weekly review loops",
  },
  {
    id: "teach-demand-chem",
    teacher: "Devin Patel",
    subject: "Chemistry",
    level: "IGCSE",
    area: "Subang Jaya",
    mode: "both",
    timing: "After school",
    fit: "Strong worksheet-led tutor for topic recovery and paper drilling",
  },
];

const studentSubjectCards = [
  {
    subject: "Mathematics",
    tutorId: "maya-lim",
    cadence: "Tue + Sat",
    nextGoal: "Fractions and algebra word problems",
    progress: "On track",
    streak: "6 lessons",
  },
  {
    subject: "Physics",
    tutorId: "aaron-chen",
    cadence: "Thu",
    nextGoal: "Waves structured questions",
    progress: "Needs revision",
    streak: "3 lessons",
  },
  {
    subject: "English",
    tutorId: "felix-wong",
    cadence: "Sun",
    nextGoal: "Argument paragraph rewrite",
    progress: "Strong momentum",
    streak: "4 lessons",
  },
];

const upcomingClasses = [
  {
    id: "class-maya-tue",
    subject: "Mathematics",
    tutorId: "maya-lim",
    day: "Tue",
    dateLabel: "Next class",
    time: "5:30 pm",
    startUtc: "20260714T093000Z",
    endUtc: "20260714T103000Z",
    mode: "physical",
    location: "Petaling Jaya",
    focus: "Algebra rescue + timed corrections",
  },
  {
    id: "class-aaron-thu",
    subject: "Physics",
    tutorId: "aaron-chen",
    day: "Thu",
    dateLabel: "Jul 16",
    time: "7:30 pm",
    startUtc: "20260716T113000Z",
    endUtc: "20260716T123000Z",
    mode: "online",
    location: "Zoom link ready",
    focus: "Waves + graph interpretation",
  },
  {
    id: "class-felix-sun",
    subject: "English",
    tutorId: "felix-wong",
    day: "Sun",
    dateLabel: "Jul 19",
    time: "4:00 pm",
    startUtc: "20260719T080000Z",
    endUtc: "20260719T090000Z",
    mode: "online",
    location: "Google Meet",
    focus: "Essay planning and hook rewrites",
  },
];

const demoMarketplaceLeads = [
  {
    id: "lead-new-kl-maths",
    market: "malaysia",
    status: "new",
    type: "student",
    name: "Alicia",
    phone: "+60 12-111 2233",
    subject: "Mathematics",
    level: "Cambridge IGCSE - IGCSE",
    area: "Kuala Lumpur",
    mode: "physical",
    preferredTime: "Weekend",
    note: "Needs fast exam prep and weekly homework follow-up.",
  },
  {
    id: "lead-contacted-hk-english",
    market: "hongkong",
    status: "contacted",
    type: "student",
    name: "Chloe",
    phone: "+852 9000 2211",
    subject: "English",
    level: "IB - MYP",
    area: "Kowloon",
    mode: "online",
    preferredTime: "Evening",
    note: "Parent wants writing feedback and essay structure support.",
  },
  {
    id: "lead-matched-pj-physics",
    market: "malaysia",
    status: "matched",
    type: "student",
    name: "Ken",
    phone: "+60 18-555 8832",
    subject: "Physics",
    level: "Cambridge IGCSE - IGCSE",
    area: "Petaling Jaya",
    mode: "online",
    preferredTime: "Evening",
    note: "Shortlisted Aaron Chen and waiting for parent confirmation.",
  },
  {
    id: "lead-closed-subang-chem",
    market: "malaysia",
    status: "closed",
    type: "student",
    name: "Mira",
    phone: "+60 17-222 9900",
    subject: "Chemistry",
    level: "Cambridge IGCSE - IGCSE",
    area: "Subang Jaya",
    mode: "physical",
    preferredTime: "Morning",
    note: "Booked and closed with weekly Sunday revision slot.",
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

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

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

const matchesText = (left = "", right = "") => {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
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
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
  }
  return hash;
};

const avatarBackground = (name = "") =>
  `linear-gradient(135deg, hsl(${teacherHue(name)} 65% 40%), hsl(${(teacherHue(name) + 36) % 360} 70% 56%))`;

const PORTRAIT_SHEET_URL = "./assets/teacher-portraits-sheet-DXmfbI93.png";
const STUDENT_PORTRAIT_SHEET_URL = "./assets/student-portraits-gemini.png";
const STUDENT_PORTRAIT_POSITIONS = ["0% 0%", "50% 0%", "100% 0%", "0% 100%", "50% 100%", "100% 100%"];

const TEACHER_PORTRAIT_POSITIONS = {
  "maya-lim": "0% 0%",
  "aaron-chen": "50% 0%",
  "nur-syahirah": "100% 0%",
  "devin-patel": "0% 100%",
  "siti-farhana": "50% 100%",
  "felix-wong": "100% 100%",
};

const feeLabelForTeacher = (teacher, lessonMode = "online") => {
  const normalized = normalizeLessonMode(lessonMode);
  if (normalized === "physical" && teacher?.physicalFee) return teacher.physicalFee;
  if (normalized === "both") return teacher?.onlineFee || teacher?.physicalFee || "-";
  return teacher?.onlineFee || teacher?.physicalFee || "-";
};

const teacherRatingLabel = (teacher) =>
  Number(teacher?.reviews || 0) > 0 ? `${Number(teacher.rating || 0).toFixed(1)} ★` : "New tutor";

const tutorAvatarMarkup = (teacher, className = "") => {
  const portraitPosition = TEACHER_PORTRAIT_POSITIONS[teacher?.id] || "50% 50%";
  const classes = ["portrait-avatar", className].filter(Boolean).join(" ");
  if (teacher?.avatarUrl) {
    return `<img class="${classes} portrait-avatar-img" src="${escapeHtml(teacher.avatarUrl)}" alt="${escapeHtml(teacher.name || "Teacher")}">`;
  }
  return `
    <div
      class="${classes}"
      style="background:${avatarBackground(teacher?.name || "")}; --portrait-url:url('${PORTRAIT_SHEET_URL}'); --portrait-position:${portraitPosition}; --portrait-size:300% 200%;"
      aria-hidden="true"
    >
      <span>${escapeHtml(teacherInitials(teacher?.name || ""))}</span>
    </div>
  `;
};

const studentAvatarMarkup = (index = 0, className = "") => `
  <div
    class="portrait-avatar student-portrait-avatar ${escapeHtml(className)}"
    style="--portrait-url:url('${STUDENT_PORTRAIT_SHEET_URL}'); --portrait-position:${STUDENT_PORTRAIT_POSITIONS[index % STUDENT_PORTRAIT_POSITIONS.length]}; --portrait-size:300% 200%;"
    aria-hidden="true"
  ><span>Student</span></div>
`;

const SUBJECT_META = {
  mathematics: { icon: "icon-subject-mathematics", tone: "maths" },
  physics: { icon: "icon-subject-physics", tone: "physics" },
  chemistry: { icon: "icon-subject-chemistry", tone: "chemistry" },
  biology: { icon: "icon-subject-biology", tone: "biology" },
  english: { icon: "icon-subject-english", tone: "english" },
};

const subjectMetaFor = (subject = "") => {
  const normalized = normalizeText(subject);
  if (normalized.includes("math")) return SUBJECT_META.mathematics;
  if (normalized.includes("phys")) return SUBJECT_META.physics;
  if (normalized.includes("chem")) return SUBJECT_META.chemistry;
  if (normalized.includes("bio")) return SUBJECT_META.biology;
  if (normalized.includes("eng")) return SUBJECT_META.english;
  return { icon: "icon-subject-english", tone: "default" };
};

const subjectPillMarkup = (subject, className = "subject-pill") => {
  const meta = subjectMetaFor(subject);
  return `
    <span class="${escapeHtml(className)} subject-tone-${escapeHtml(meta.tone)}">
      <svg class="subject-pill-icon" aria-hidden="true"><use href="#${escapeHtml(meta.icon)}"></use></svg>
      <span>${escapeHtml(subject)}</span>
    </span>
  `;
};

const studentPhotoImgMarkup = (photoDataUrl, className = "", alt = "Student photo") =>
  `<img class="portrait-avatar portrait-avatar-img student-photo-img ${escapeHtml(className)}" src="${escapeHtml(photoDataUrl)}" alt="${escapeHtml(alt)}">`;

const studentProfileAvatarMarkup = (profile, className = "") =>
  profile?.photoDataUrl
    ? studentPhotoImgMarkup(profile.photoDataUrl, className, `${profile?.name || "Student"} photo`)
    : studentAvatarMarkup(0, className);

const studentPhotoPreviewMarkup = (photoDataUrl, name = "Student") =>
  photoDataUrl
    ? studentPhotoImgMarkup(photoDataUrl, "student-photo-preview-frame", `${name || "Student"} preview`)
    : studentAvatarMarkup(0, "student-photo-preview-frame");

const applyStudentPhotoPreview = (photoDataUrl = "", name = "Student") => {
  if (!studentPhotoPreviewEl) return;
  studentPhotoPreviewEl.innerHTML = studentPhotoPreviewMarkup(photoDataUrl, name);
  studentPhotoPreviewEl.classList.toggle("has-photo", Boolean(photoDataUrl));
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("We could not read that image."));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("We could not process that photo."));
    image.src = src;
  });

const normalizeStudentPhotoFile = async (file) => {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const square = Math.min(image.width || 0, image.height || 0);
  if (!square) throw new Error("That photo could not be processed.");
  const sourceX = Math.max(0, Math.round(((image.width || square) - square) / 2));
  const sourceY = Math.max(0, Math.round(((image.height || square) - square) / 2));
  const canvas = document.createElement("canvas");
  const size = 480;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas preview is unavailable in this browser.");
  context.drawImage(image, sourceX, sourceY, square, square, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.84);
};

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

const requestContactPhoneCache = new Map();
const rememberRequestContactPhone = (request) => {
  const requestId = request?.id || "";
  if (!requestId) return;
  const digits = String(request.phone || request.contactPhone || "").replace(/\D+/g, "");
  if (digits) requestContactPhoneCache.set(requestId, digits);
};
const forgetRequestContactPhones = () => requestContactPhoneCache.clear();
const contactPhoneForRequest = (request) => requestContactPhoneCache.get(request?.id || "") || "";
const sanitizeStoredTutorRequest = (request) => {
  if (!request || typeof request !== "object") return request;
  const { phone, contactPhone, ...storedRequest } = request;
  return {
    ...storedRequest,
    hasContactPhone: Boolean(phone || contactPhone || storedRequest.hasContactPhone),
  };
};
const sanitizeStoredMarketplaceLead = (lead) => {
  if (!lead || typeof lead !== "object") return lead;
  const { phone, contactPhone, ...storedLead } = lead;
  return {
    ...storedLead,
    hasContactPhone: Boolean(phone || contactPhone || storedLead.hasContactPhone),
  };
};
const readStoredTutorRequests = () => {
  const stored = readJson(REQUESTS_STORAGE_KEY, []);
  const sanitized = stored.map(sanitizeStoredTutorRequest);
  if (stored.some((request) => request?.phone || request?.contactPhone)) {
    writeJson(REQUESTS_STORAGE_KEY, sanitized);
  }
  return sanitized;
};
const writeStoredTutorRequests = (requests) => writeJson(REQUESTS_STORAGE_KEY, requests.map(sanitizeStoredTutorRequest));
const readStoredMarketplaceLeads = () => {
  const stored = readJson(MARKETPLACE_STORAGE_KEY, []);
  const sanitized = stored.map(sanitizeStoredMarketplaceLead);
  if (stored.some((lead) => lead?.phone || lead?.contactPhone)) {
    writeJson(MARKETPLACE_STORAGE_KEY, sanitized);
  }
  return sanitized;
};
const writeStoredMarketplaceLeads = (leads) => writeJson(MARKETPLACE_STORAGE_KEY, leads.map(sanitizeStoredMarketplaceLead));

const createPrivateToken = () => {
  if (window.crypto?.randomUUID) return `${window.crypto.randomUUID()}${window.crypto.randomUUID()}`;
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
};

const readStoredMarketplaceSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SUPABASE_SESSION_KEY) || "null");
    const isQaIdentity = session?.user?.id === QA_STUDENT_USER_ID && session?.user?.email === QA_STUDENT_EMAIL;
    if (isQaIdentity && !isAllowedQaRuntime()) {
      localStorage.removeItem(SUPABASE_SESSION_KEY);
      return null;
    }
    return session?.access_token ? session : null;
  } catch {
    return null;
  }
};

const saveStoredMarketplaceSession = (session) => {
  try {
    if (session) localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SUPABASE_SESSION_KEY);
  } catch {
    // Account sync remains optional when storage is unavailable.
  }
};

let marketplaceSession = readStoredMarketplaceSession();
let marketplaceProfileRow = null;
let pendingStudentPhotoDataUrl = "";

const marketplaceUser = () => marketplaceSession?.user || null;
const marketplaceAccessToken = () => marketplaceSession?.access_token || SUPABASE_ANON_KEY;
const marketplaceBackendConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const marketplaceIsLocalQaIdentity = () => {
  const user = marketplaceUser();
  return user?.id === QA_STUDENT_USER_ID && user?.email === QA_STUDENT_EMAIL;
};
const marketplaceIsLocalQaSession = () => marketplaceIsLocalQaIdentity() && isAllowedQaRuntime();
const marketplaceIsSignedIn = () =>
  Boolean(marketplaceSession?.access_token && marketplaceUser()?.id)
  && (!marketplaceIsLocalQaIdentity() || marketplaceIsLocalQaSession());
const marketplaceUserId = () => (marketplaceIsSignedIn() ? marketplaceUser()?.id || "" : "");

const setMarketplaceBackendStatus = (label, mode = "warn") => {
  if (!marketplaceBackendStatusEl) return;
  marketplaceBackendStatusEl.textContent = label;
  marketplaceBackendStatusEl.classList.remove("online", "offline", "warn");
  marketplaceBackendStatusEl.classList.add(mode);
};

const setMarketplaceAuthMessage = (message) => {
  if (marketplaceAuthMessageEl) marketplaceAuthMessageEl.textContent = message;
};

const marketplaceRequest = async (path, { method = "GET", body, auth = true, prefer, timeout = 8000, accessToken = "" } = {}) => {
  if (!marketplaceBackendConfigured()) throw new Error("Supabase is not configured");
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${auth ? accessToken || marketplaceAccessToken() : SUPABASE_ANON_KEY}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : await response.text().catch(() => "");
    if (!response.ok) {
      const message = typeof payload === "string" ? payload : payload?.msg || payload?.message || payload?.error_description || payload?.error;
      throw new Error(message || `HTTP ${response.status}`);
    }
    return payload;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const storeAuthPayload = (payload) => {
  if (!payload?.access_token) return null;
  marketplaceSession = {
    ...payload,
    expires_at: payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
  };
  saveStoredMarketplaceSession(marketplaceSession);
  return marketplaceSession;
};

const refreshMarketplaceSession = async () => {
  if (!marketplaceSession?.access_token || !marketplaceBackendConfigured()) return marketplaceSession;
  const expiresAt = Number(marketplaceSession.expires_at || 0);
  const expiresAtMs = expiresAt > 1e12 ? expiresAt : expiresAt * 1000;
  if (!expiresAtMs || expiresAtMs > Date.now() + 60_000) return marketplaceSession;
  if (!marketplaceSession.refresh_token) {
    marketplaceSession = null;
    saveStoredMarketplaceSession(null);
    return null;
  }
  try {
    const payload = await marketplaceRequest("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      auth: false,
      body: { refresh_token: marketplaceSession.refresh_token },
    });
    return storeAuthPayload(payload);
  } catch {
    marketplaceSession = null;
    saveStoredMarketplaceSession(null);
    return null;
  }
};

const signOutMarketplace = async () => {
  const signOutAccessToken = marketplaceSession?.access_token || "";
  const shouldRevokeRemote = Boolean(signOutAccessToken && marketplaceBackendConfigured() && !marketplaceIsLocalQaSession());
  forgetRequestContactPhones();
  marketplaceSession = null;
  marketplaceProfileRow = null;
  saveStoredMarketplaceSession(null);
  if (shouldRevokeRemote) {
    await marketplaceRequest("/auth/v1/logout", { method: "POST", accessToken: signOutAccessToken }).catch(() => null);
  }
};

const renderMarketplaceAccount = () => {
  const user = marketplaceIsSignedIn() ? marketplaceUser() : null;
  const accountRole = marketplaceProfileRow?.preferences?.account_role || readStudentProfile().accountRole || "student";
  const localQaSession = marketplaceIsLocalQaSession();
  if (marketplaceAccountPanelEl) marketplaceAccountPanelEl.hidden = !user;
  if (marketplaceGuestUtilitiesEl) marketplaceGuestUtilitiesEl.hidden = Boolean(user);
  if (marketplaceSignOutBtn) marketplaceSignOutBtn.hidden = !user;
  if (user && localQaSession) {
    if (marketplaceAccountSummaryEl) marketplaceAccountSummaryEl.textContent = `${user.email || "IC Educate account"} · ${accountRole === "teacher" ? "Teacher" : "Student"}`;
    setMarketplaceBackendStatus("Local QA", "warn");
    setMarketplaceAuthMessage("Localhost QA session active.");
  } else if (user) {
    if (marketplaceAccountSummaryEl) marketplaceAccountSummaryEl.textContent = `${user.email || "IC Educate account"} · ${accountRole === "teacher" ? "Teacher" : "Student"}`;
    setMarketplaceBackendStatus("Synced", "online");
    setMarketplaceAuthMessage(`Signed in as ${user.email || marketplaceProfileRow?.display_name || "student"}.`);
  } else if (marketplaceBackendConfigured()) {
    if (marketplaceAccountSummaryEl) marketplaceAccountSummaryEl.textContent = "Sign in to open your account";
    setMarketplaceBackendStatus("Device mode", "warn");
    setMarketplaceAuthMessage("Signed-out activity stays on this device. Tutor requests are still sent to IC Educate.");
  } else {
    if (marketplaceAccountSummaryEl) marketplaceAccountSummaryEl.textContent = "Local profile";
    setMarketplaceBackendStatus("Local only", "offline");
    setMarketplaceAuthMessage("Backend is not configured. Activity stays on this device.");
  }
};

const loadMarketplaceProfile = async () => {
  if (marketplaceIsLocalQaSession()) {
    const localProfile = readStudentProfile();
    marketplaceProfileRow = {
      id: QA_STUDENT_USER_ID,
      email: QA_STUDENT_EMAIL,
      display_name: localProfile.name || "QA Student",
      level: localProfile.level || "IGCSE",
      preferences: {
        account_role: localProfile.accountRole || "student",
        subjects: localProfile.subjects || DEFAULT_STUDENT_PROFILE.subjects,
        photo_data_url: localProfile.photoDataUrl || "",
      },
    };
    return marketplaceProfileRow;
  }
  if (!marketplaceUserId()) return null;
  const rows = await marketplaceRequest(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(marketplaceUserId())}&limit=1`);
  marketplaceProfileRow = Array.isArray(rows) ? rows[0] || null : null;
  if (marketplaceProfileRow) {
    const preferences = marketplaceProfileRow.preferences || {};
    writeStudentProfile({
      name: marketplaceProfileRow.display_name || marketplaceUser()?.email?.split("@")[0] || "Student",
      level: marketplaceProfileRow.level || "IGCSE",
      subjects: Array.isArray(preferences.subjects) && preferences.subjects.length ? preferences.subjects : DEFAULT_STUDENT_PROFILE.subjects,
      accountRole: preferences.account_role || "student",
      photoDataUrl: typeof preferences.photo_data_url === "string" ? preferences.photo_data_url : "",
    });
  }
  return marketplaceProfileRow;
};

const saveMarketplaceProfile = async (profile) => {
  if (marketplaceIsLocalQaSession()) {
    writeStudentProfile(profile);
    marketplaceProfileRow = {
      id: QA_STUDENT_USER_ID,
      email: QA_STUDENT_EMAIL,
      display_name: profile.name || "QA Student",
      level: profile.level || "IGCSE",
      preferences: {
        account_role: profile.accountRole || "student",
        subjects: profile.subjects || DEFAULT_STUDENT_PROFILE.subjects,
        photo_data_url: profile.photoDataUrl || "",
      },
    };
    return marketplaceProfileRow;
  }
  if (!marketplaceUserId()) return null;
  const preferences = {
    ...(marketplaceProfileRow?.preferences || {}),
    subjects: profile.subjects || [],
    account_role: profile.accountRole || "student",
    photo_data_url: profile.photoDataUrl || "",
  };
  const payload = {
    id: marketplaceUserId(),
    email: marketplaceUser()?.email || "",
    display_name: profile.name || marketplaceProfileRow?.display_name || "Student",
    level: profile.level || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    preferences,
    updated_at: new Date().toISOString(),
  };
  const rows = await marketplaceRequest("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    body: [payload],
    prefer: "resolution=merge-duplicates,return=representation",
  });
  marketplaceProfileRow = Array.isArray(rows) ? rows[0] || payload : payload;
  return marketplaceProfileRow;
};

const requestBackendPayload = (request) => ({
  client_request_id: request.id,
  email: marketplaceUser()?.email || request.email || "",
  name: request.studentName || "",
  phone: request.phone || "",
  subject: request.subject || "",
  topic: request.topic || "",
  syllabus: request.syllabus || "",
  level: request.level || "",
  area: request.area || "",
  mode: request.mode || "online",
  budget: request.budget || "",
  preferred_time: request.preferredTime || "",
  selected_tutor_key: request.selectedTutorId || "",
  selected_tutor_name: request.selectedTutorName || "",
  booking_day: request.bookingDay || "",
  booking_slot: request.bookingSlot || "",
  booking_mode: request.bookingMode || "",
  booking_venue: request.bookingVenue || "",
  consent_whatsapp: Boolean(request.consentWhatsapp),
  market: request.market || "malaysia",
  note: request.note || "",
  page: request.page || window.location.href,
});

const deriveStudentRequestStatus = ({ selectedTutorId = "", selectedTutorName = "", bookingDay = "", bookingSlot = "" } = {}) => {
  if (bookingDay || bookingSlot) return "booked";
  if (selectedTutorId || selectedTutorName) return "matched";
  return "new";
};

const syncTutorRequestBackend = async (request) => {
  if (marketplaceIsLocalQaSession()) return { synced: false, reason: "local-qa" };
  if (!marketplaceBackendConfigured()) return { synced: false, reason: "not-configured" };
  const remoteId = await marketplaceRequest("/rest/v1/rpc/save_ic_educate_tutor_request", {
    method: "POST",
    body: { p_payload: requestBackendPayload(request), p_edit_token: request.editToken },
  });
  return { synced: true, remoteId: String(remoteId || "").replaceAll('"', "") };
};

const requestFromBackendRow = (row, local = null) => ({
  id: row.client_request_id || local?.id || row.id,
  remoteId: row.id,
  editToken: local?.editToken || createPrivateToken(),
  studentName: row.name || local?.studentName || "",
  phone: row.phone || local?.phone || "",
  email: row.email || marketplaceUser()?.email || "",
  subject: row.subject || "",
  topic: row.topic || "",
  syllabus: row.syllabus || "",
  level: row.level || "",
  area: row.area || "",
  mode: row.mode || "online",
  schedule: row.preferred_time || "",
  preferredTime: row.preferred_time || "",
  budget: row.budget || "",
  note: row.note || "",
  consentWhatsapp: Boolean(row.consent_whatsapp),
  market: row.market || "malaysia",
  selectedTutorId: row.selected_tutor_key || "",
  selectedTutorName: row.selected_tutor_name || "",
  bookingDay: row.booking_day || "",
  bookingSlot: row.booking_slot || "",
  bookingMode: row.booking_mode || "",
  bookingVenue: row.booking_venue || "",
  status: deriveStudentRequestStatus({
    selectedTutorId: row.selected_tutor_key || "",
    selectedTutorName: row.selected_tutor_name || "",
    bookingDay: row.booking_day || "",
    bookingSlot: row.booking_slot || "",
  }),
  createdAt: row.created_at || new Date().toISOString(),
  page: row.page || window.location.href,
});

const loadMarketplaceRequests = async () => {
  if (!marketplaceUserId()) return [];
  const rows = await marketplaceRequest(
    `/rest/v1/ic_educate_leads?select=*&user_id=eq.${encodeURIComponent(marketplaceUserId())}&source=eq.tutor-finder&order=created_at.desc&limit=100`
  );
  const localRows = readStoredTutorRequests();
  const localById = new Map(localRows.map((request) => [request.id, request]));
  const remoteRows = (Array.isArray(rows) ? rows : []).map((row) => {
    const request = requestFromBackendRow(row, localById.get(row.client_request_id));
    rememberRequestContactPhone(request);
    return request;
  });
  const merged = new Map(localRows.map((request) => [request.id, request]));
  remoteRows.forEach((request) => merged.set(request.id, { ...merged.get(request.id), ...request }));
  writeStoredTutorRequests([...merged.values()].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  return remoteRows;
};

const syncSavedTutorBackend = async (teacher) => {
  if (marketplaceIsLocalQaSession()) return null;
  if (!marketplaceUserId()) return null;
  return marketplaceRequest("/rest/v1/ic_educate_saved_tutors?on_conflict=user_id,teacher_key", {
    method: "POST",
    body: [{
      user_id: marketplaceUserId(),
      teacher_key: teacher.id,
      teacher_name: teacher.name,
      snapshot: teacher,
    }],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
};

const loadSavedTutorsBackend = async () => {
  if (!marketplaceUserId()) return [];
  const rows = await marketplaceRequest(
    `/rest/v1/ic_educate_saved_tutors?select=*&user_id=eq.${encodeURIComponent(marketplaceUserId())}&order=updated_at.desc&limit=50`
  );
  const remote = (Array.isArray(rows) ? rows : []).map((row) => ({
    ...(row.snapshot || {}),
    id: row.teacher_key,
    name: row.teacher_name,
    focus: row.snapshot?.focus || row.snapshot?.subjects?.join(", ") || "Tutor",
    area: row.snapshot?.area || row.snapshot?.location || "Online",
    remoteSynced: true,
  }));
  const local = readJson(MY_TEACHERS_STORAGE_KEY, []);
  const merged = new Map([...local, ...remote].map((teacher) => [teacher.id, teacher]));
  writeJson(MY_TEACHERS_STORAGE_KEY, [...merged.values()]);
  return remote;
};

const loadMarketplaceMessages = async () => {
  if (!marketplaceUserId()) return [];
  const rows = await marketplaceRequest(
    `/rest/v1/ic_educate_marketplace_messages?select=*&user_id=eq.${encodeURIComponent(marketplaceUserId())}&order=created_at.asc&limit=300`
  );
  const requests = readStoredTutorRequests();
  const clientIdByRemoteId = new Map(requests.filter((request) => request.remoteId).map((request) => [request.remoteId, request.id]));
  const remote = (Array.isArray(rows) ? rows : []).map((row) => ({
    id: row.id,
    requestId: clientIdByRemoteId.get(row.request_id) || row.request_id,
    remoteRequestId: row.request_id,
    from: row.sender_role === "student" ? "Student" : row.sender_role === "tutor" ? "Tutor" : "Operator",
    text: row.body,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: row.created_at,
    remoteSubmitted: true,
  }));
  const local = readJson(MARKETPLACE_MESSAGES_STORAGE_KEY, []);
  const merged = new Map([...local, ...remote].map((message) => [message.id, message]));
  writeJson(MARKETPLACE_MESSAGES_STORAGE_KEY, [...merged.values()].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)));
  return remote;
};

const syncMarketplaceMessageBackend = async (message) => {
  if (marketplaceIsLocalQaSession()) return null;
  if (!marketplaceUserId() || !message.remoteRequestId) return null;
  return marketplaceRequest("/rest/v1/ic_educate_marketplace_messages", {
    method: "POST",
    body: [{
      user_id: marketplaceUserId(),
      request_id: message.remoteRequestId,
      sender_role: "student",
      body: message.text,
    }],
    prefer: "return=minimal",
  });
};

const migrateLocalMarketplaceState = async () => {
  if (!marketplaceUserId()) return;

  const localRequests = readStoredTutorRequests();
  for (const request of localRequests) {
    if (!request.editToken) continue;
    try {
      const result = await syncTutorRequestBackend(request);
      if (result.remoteId) {
        request.remoteId = result.remoteId;
      }
    } catch {
      // One failed local item must not block the rest of the account sync.
    }
  }
  writeStoredTutorRequests(localRequests);

  const localTutors = readJson(MY_TEACHERS_STORAGE_KEY, []);
  await Promise.allSettled(
    localTutors
      .filter((teacher) => !teacher.remoteSynced && !DEMO_MY_TEACHER_IDS.has(teacher.id))
      .map((teacher) => syncSavedTutorBackend(teacher))
  );

  const requestById = new Map(localRequests.map((request) => [request.id, request]));
  const localMessages = readJson(MARKETPLACE_MESSAGES_STORAGE_KEY, []);
  for (const message of localMessages) {
    if (message.remoteSubmitted) continue;
    const request = requestById.get(message.requestId);
    message.remoteRequestId = message.remoteRequestId || request?.remoteId || "";
    if (!message.remoteRequestId) continue;
    try {
      await syncMarketplaceMessageBackend(message);
      message.remoteSubmitted = true;
    } catch {
      // Keep it queued locally for the next session refresh.
    }
  }
  writeJson(MARKETPLACE_MESSAGES_STORAGE_KEY, localMessages);
};

const initializeMarketplaceBackend = async () => {
  renderMarketplaceAccount();
  if (marketplaceIsLocalQaSession()) {
    await loadMarketplaceProfile();
    renderMarketplaceAccount();
    syncStudentLearningEditor();
    refreshApp();
    return;
  }
  if (!marketplaceBackendConfigured()) return;
  try {
    await refreshMarketplaceSession();
    if (marketplaceUserId()) {
      await loadMarketplaceProfile();
      const localProfile = readStudentProfile();
      const remoteSubjects = marketplaceProfileRow?.preferences?.subjects;
      if (!marketplaceProfileRow?.level && !(Array.isArray(remoteSubjects) && remoteSubjects.length)) {
        await saveMarketplaceProfile(localProfile);
      }
      await migrateLocalMarketplaceState();
      await loadMarketplaceRequests();
      await Promise.all([loadSavedTutorsBackend(), loadMarketplaceMessages()]);
      setMarketplaceBackendStatus("Synced", "online");
    }
    renderMarketplaceAccount();
    syncStudentLearningEditor();
    refreshApp();
  } catch (error) {
    renderMarketplaceAccount();
    setMarketplaceBackendStatus("Local fallback", "offline");
    setMarketplaceAuthMessage(`Account sync unavailable: ${error.message}`);
  }
};

const splitProfileList = (value = "") => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(/[\n,;]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
};

const teacherModes = (value = "both") => {
  if (Array.isArray(value)) return value.filter((item) => ["online", "physical"].includes(item));
  return value === "both" ? ["online", "physical"] : [value || "online"];
};

const teacherFromProfile = (profile, source = "local") => {
  const subjects = splitProfileList(profile.subjects || profile.subject);
  const syllabuses = splitProfileList(profile.syllabuses || profile.syllabus || profile.level);
  const levels = splitProfileList(profile.levels || profile.level);
  const languages = splitProfileList(profile.languages);
  const availability = splitProfileList(profile.availability || profile.time);
  const modes = teacherModes(profile.lesson_modes || profile.mode);
  const experienceYears = Number(profile.experience_years ?? profile.experienceYears ?? 0);
  const fee = profile.fee_label || profile.fee || "Contact for fee";
  const area = profile.area || "Online";
  const profileId = String(profile.submission_id || profile.id || `profile-${Date.now()}`);

  return {
    id: profileId,
    submissionId: profile.submission_id || profile.id || profileId,
    name: profile.display_name || profile.name || "IC Educate teacher",
    subjects: subjects.length ? subjects : ["General tutoring"],
    syllabus: syllabuses.join(" / ") || "Flexible syllabus",
    level: levels.join(" / ") || "Multiple levels",
    rating: Number(profile.rating || 0),
    reviews: Number(profile.reviews || 0),
    mode: modes,
    onlineFee: modes.includes("online") ? fee : null,
    physicalFee: modes.includes("physical") ? fee : null,
    location: area,
    coordinates: buildLocationCoords(area) || null,
    availability,
    responseTime: "New",
    intro: profile.bio || profile.note || `Teaches ${subjects.slice(0, 3).join(", ")}.`,
    gender: profile.gender || "unspecified",
    avatarUrl: source === "local" ? profile.photoDataUrl || profile.avatar_url || "" : profile.avatar_url || "",
    isCommunityProfile: true,
    isLocalProfile: source === "local",
    createdAt: profile.published_at || profile.updatedAt || profile.createdAt || profile.created_at || "",
    profileDetails: {
      yearsExperience: experienceYears === 1 ? "1 year" : `${experienceYears || 0} years`,
      lessonsCompleted: "New on IC Educate",
      languages: languages.length ? languages : ["Ask teacher"],
      districts: splitProfileList(area),
      bestFor: subjects.slice(0, 3),
      credentials: profile.qualifications || "Subject specialist tutor",
      reviewQuote: "New teacher profile. Reviews will appear after completed lessons.",
    },
  };
};

let remoteTeacherProfiles = [];

const localTeacherProfiles = () =>
  readJson(TEACHER_PROFILES_STORAGE_KEY, [])
    .filter((profile) => profile && profile.profileStatus === "published")
    .map((profile) => teacherFromProfile(profile, "local"));

const mergeTeacherProfiles = () => {
  const bySubmission = new Map();
  [...localTeacherProfiles(), ...remoteTeacherProfiles].forEach((teacher) => {
    const key = String(teacher.submissionId || teacher.id);
    if (!bySubmission.has(key)) bySubmission.set(key, teacher);
  });
  teacherDirectory = [...bySubmission.values(), ...seedTeacherDirectory];
};

const loadPublishedTeacherProfiles = async () => {
  if (!PUBLIC_TEACHER_PROFILES_ENABLED || !SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  const columns = [
    "id",
    "submission_id",
    "display_name",
    "market",
    "subjects",
    "syllabuses",
    "levels",
    "experience_years",
    "qualifications",
    "languages",
    "area",
    "lesson_modes",
    "availability",
    "fee_label",
    "bio",
    "avatar_url",
    "published_at",
  ].join(",");
  try {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${PUBLIC_PROFILE_TABLE}?select=${encodeURIComponent(columns)}&status=eq.published&order=published_at.desc&limit=24`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    if (!response.ok) return;
    const rows = await response.json();
    remoteTeacherProfiles = Array.isArray(rows) ? rows.map((profile) => teacherFromProfile(profile, "remote")) : [];
    mergeTeacherProfiles();
    refreshApp();
  } catch {
    // The seeded directory remains available when the public profile service is offline.
  }
};

const DEFAULT_STUDENT_PROFILE = {
  name: "Aisha Lim",
  level: "IGCSE",
  subjects: ["Mathematics", "Physics", "English"],
  accountRole: "student",
  photoDataUrl: "",
};

const readStudentProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STUDENT_PROFILE_STORAGE_KEY) || "null");
    return {
      ...DEFAULT_STUDENT_PROFILE,
      ...(stored && typeof stored === "object" ? stored : {}),
      subjects: Array.isArray(stored?.subjects) && stored.subjects.length ? stored.subjects : DEFAULT_STUDENT_PROFILE.subjects,
      photoDataUrl: typeof stored?.photoDataUrl === "string" ? stored.photoDataUrl : "",
    };
  } catch {
    return { ...DEFAULT_STUDENT_PROFILE };
  }
};

const writeStudentProfile = (profile) => {
  try {
    localStorage.setItem(STUDENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Local persistence is optional in demo mode.
  }
};

const ensureDemoCollection = (key, seed) => {
  const stored = readJson(key, []);
  if (stored.length) return stored;
  writeJson(key, seed);
  return seed;
};

const buildLocationCoords = (text = "") => {
  const value = normalizeText(text);
  const hit = LOCATION_LOOKUP.find((item) => item.match.some((needle) => value.includes(needle)));
  return hit ? { ...hit.coords, label: hit.label, market: hit.market } : null;
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

const responseTimeMinutes = (teacher) => {
  const match = String(teacher?.responseTime || "").match(/(\d+)/);
  return match ? Number(match[1]) : 999;
};

const nearestSupportedArea = (coords) => {
  if (!coords) return null;
  const ranked = LOCATION_LOOKUP.map((item) => ({
    ...item,
    distanceKm: haversineKm(coords, item.coords),
  })).sort((a, b) => a.distanceKm - b.distanceKm);
  const best = ranked[0] || null;
  return best && Number.isFinite(best.distanceKm) && best.distanceKm <= 240 ? best : null;
};

const buildFallbackWeeklyAvailability = (teacher) => {
  const slots = new Set(teacher?.availability || []);
  const rawSlots = Array.from(slots).map((slot) => normalizeText(slot));
  const mapped = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
  const dayMatches = {
    Mon: ["monday", "mon"],
    Tue: ["tuesday", "tue", "tues"],
    Wed: ["wednesday", "wed"],
    Thu: ["thursday", "thu", "thur", "thurs"],
    Fri: ["friday", "fri"],
    Sat: ["saturday", "sat"],
    Sun: ["sunday", "sun"],
  };
  const slotLabel = (slot) => {
    if (slot.includes("morning")) return "Morning";
    if (slot.includes("afternoon")) return "Afternoon";
    if (slot.includes("evening")) return "Evening";
    return slot.replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  rawSlots.forEach((slot) => {
    const label = slotLabel(slot);
    const matchingDays = Object.entries(dayMatches)
      .filter(([, aliases]) => aliases.some((alias) => new RegExp(`\\b${alias}\\b`).test(slot)))
      .map(([day]) => day);
    if (matchingDays.length) {
      matchingDays.forEach((day) => mapped[day].push(label));
      return;
    }
    if (slot.includes("weekday")) {
      ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((day) => mapped[day].push(label));
    }
    if (slot.includes("weekend")) {
      ["Sat", "Sun"].forEach((day) => mapped[day].push(label));
    }
  });

  if (Object.values(mapped).some((daySlots) => daySlots.length)) {
    return Object.fromEntries(Object.entries(mapped).map(([day, daySlots]) => [day, [...new Set(daySlots)]]));
  }
  return {
    Mon: slots.has("Morning") ? ["10:00 am"] : slots.has("Evening") ? ["7:30 pm"] : [],
    Tue: slots.has("Afternoon") ? ["2:30 pm"] : [],
    Wed: slots.has("Morning") ? ["10:00 am"] : slots.has("Evening") ? ["7:30 pm"] : [],
    Thu: slots.has("Afternoon") ? ["2:30 pm"] : [],
    Fri: slots.has("Evening") ? ["7:30 pm"] : [],
    Sat: slots.has("Weekend") ? ["10:30 am", "2:00 pm"] : [],
    Sun: slots.has("Weekend") ? ["11:00 am"] : [],
  };
};

const profileDetailsFor = (teacher) => {
  const stored = teacher?.profileDetails || TEACHER_PROFILE_DETAILS[teacher?.id] || {};
  return {
    yearsExperience: stored.yearsExperience || "5+ years",
    lessonsCompleted: stored.lessonsCompleted || "500+ lessons",
    languages: stored.languages || ["English"],
    districts: stored.districts || [teacher?.location || "Online"],
    bestFor: stored.bestFor || ["Topic recovery", "Exam preparation", "Steady weekly progress"],
    credentials: stored.credentials || "Subject specialist tutor",
    reviewQuote: stored.reviewQuote || `${teacher?.name || "This tutor"} is structured, warm, and strong at building confidence over time.`,
    weeklyAvailability: stored.weeklyAvailability || buildFallbackWeeklyAvailability(teacher),
  };
};

const buildRequestBookingFields = (overrides = {}) => {
  const effectiveTutorId = overrides.selectedTutorId || selectedTutorId || "";
  const shouldPersistBooking = Boolean(
    bookingState.isExplicit &&
      bookingState.tutorId &&
      (!effectiveTutorId || bookingState.tutorId === effectiveTutorId)
  );
  return {
    bookingDay: overrides.bookingDay ?? (shouldPersistBooking ? bookingState.day || "" : ""),
    bookingSlot: overrides.bookingSlot ?? (shouldPersistBooking ? bookingState.slot || "" : ""),
    bookingMode: overrides.bookingMode ?? (shouldPersistBooking ? normalizeLessonMode(bookingState.mode || tutorModeInput.value || "online") : ""),
    bookingVenue: overrides.bookingVenue ?? (shouldPersistBooking ? bookingState.venue || "" : ""),
  };
};

const buildRequestPayload = (overrides = {}) => ({
  id: overrides.id || `tutor-${Date.now()}`,
  remoteId: overrides.remoteId || "",
  editToken: overrides.editToken || "",
  studentName: tutorNameInput.value.trim(),
  phone: tutorPhoneInput.value.trim(),
  email: marketplaceUser()?.email || overrides.email || "",
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
  createdAt: overrides.createdAt || new Date().toISOString(),
  page: window.location.href,
  selectedTutorId: overrides.selectedTutorId || "",
  selectedTutorName: overrides.selectedTutorName || "",
  ...buildRequestBookingFields(overrides),
  status: overrides.status || "new",
});

const currentRequest = () => {
  if (!currentRequestEditToken) currentRequestEditToken = createPrivateToken();
  return buildRequestPayload({
    id: currentRequestId || `tutor-${Date.now()}`,
    remoteId: currentRequestRemoteId,
    editToken: currentRequestEditToken,
  });
};

const shouldPreviewRequest = (request) => Boolean(request.subject || request.topic || request.syllabus || request.level || request.area);

const formatRequestHeadline = (request) =>
  [request.subject || "Subject", request.level || "Level", request.area || "Area", lessonModeLabel(request.mode)].join(" · ");

const summaryLessonMode = (request, booking = {}) =>
  normalizeLessonMode(booking.mode || request.bookingMode || request.mode || "online");

const buildWhatsAppMessage = (request, tutor = null, booking = {}) => {
  const lessonMode = summaryLessonMode(request, booking);
  const lines = [
    "Hi IC Educate, I need a tutor match.",
    `Name: ${request.studentName || ""}`,
    `Subject: ${request.subject || ""}`,
    request.topic ? `Topic: ${request.topic}` : "",
    request.syllabus ? `Syllabus: ${request.syllabus}` : "",
    request.level ? `Level: ${request.level}` : "",
    request.area ? `Area: ${request.area}` : "",
    `Lesson type: ${lessonModeLabel(lessonMode)}`,
    request.preferredTime ? `Preferred time: ${request.preferredTime}` : "",
    request.budget ? `Budget: ${request.budget}` : "",
    request.note ? `Note: ${request.note}` : "",
    tutor ? `Selected tutor: ${tutor.name}` : "",
    booking.day ? `Preferred day: ${booking.day}` : "",
    booking.slot ? `Preferred slot: ${booking.slot}` : "",
    booking.venue ? `Location / link: ${booking.venue}` : "",
  ].filter(Boolean);
  return lines.join("\n");
};

const buildTutorBrief = (request, tutor = null, booking = {}) => {
  const lessonMode = summaryLessonMode(request, booking);
  const lines = [
    "Tutor request",
    `Name: ${request.studentName || "-"}`,
    `Subject: ${request.subject || "-"}`,
    `Topic: ${request.topic || "-"}`,
    `Syllabus: ${request.syllabus || "-"}`,
    `Level: ${request.level || "-"}`,
    `Area: ${request.area || "-"}`,
    `Lesson type: ${lessonModeLabel(lessonMode)}`,
    `Preferred time: ${request.preferredTime || "-"}`,
    `Budget: ${request.budget || "-"}`,
    `Selected tutor: ${tutor ? tutor.name : "None yet"}`,
    `Booking day: ${booking.day || "-"}`,
    `Booking slot: ${booking.slot || "-"}`,
    `Venue / link: ${booking.venue || "-"}`,
    `Note: ${request.note || "-"}`,
  ];
  return lines.join("\n");
};

const saveTutorRequest = async (request) => {
  rememberRequestContactPhone(request);
  const stored = readStoredTutorRequests();
  const next = [request, ...stored.filter((item) => item.id !== request.id)].slice(0, 100);
  writeStoredTutorRequests(next);

  const leadQueue = readStoredMarketplaceLeads();
  const leadEntry = {
    id: request.id,
    market: request.market,
    status: request.status || "new",
    type: "student",
    name: request.studentName,
    hasContactPhone: Boolean(request.phone),
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
    selectedTutorId: request.selectedTutorId || "",
    selectedTutorName: request.selectedTutorName || "",
    bookingDay: request.bookingDay || "",
    bookingSlot: request.bookingSlot || "",
  };
  writeStoredMarketplaceLeads([leadEntry, ...leadQueue.filter((item) => item.id !== request.id)].slice(0, 120));
  try {
    const result = await syncTutorRequestBackend(request);
    if (result.synced && result.remoteId) {
      request.remoteId = result.remoteId;
      currentRequestRemoteId = result.remoteId;
      const syncedRequests = readStoredTutorRequests().map((item) => (item.id === request.id ? { ...item, remoteId: result.remoteId } : item));
      writeStoredTutorRequests(syncedRequests);
      return result;
    }
    return result;
  } catch (error) {
    return { synced: false, error };
  }
};

const ensureDemoLeadQueue = () => {
  const stored = readStoredMarketplaceLeads();
  if (stored.length) return;
  writeStoredMarketplaceLeads(demoMarketplaceLeads);
};

const saveTeacherPromo = (promo) => {
  const stored = readJson(TEACHER_PROMOS_STORAGE_KEY, []);
  writeJson(TEACHER_PROMOS_STORAGE_KEY, [promo, ...stored.filter((item) => item.id !== promo.id)].slice(0, 24));
};

const saveMyTeacher = (teacher) => {
  const stored = readJson(MY_TEACHERS_STORAGE_KEY, []);
  writeJson(MY_TEACHERS_STORAGE_KEY, [teacher, ...stored.filter((item) => item.id !== teacher.id)].slice(0, 24));
  void syncSavedTutorBackend(teacher)
    .then(() => {
      const synced = readJson(MY_TEACHERS_STORAGE_KEY, []).map((item) => (item.id === teacher.id ? { ...item, remoteSynced: true } : item));
      writeJson(MY_TEACHERS_STORAGE_KEY, synced);
    })
    .catch(() => null);
};

const saveFriend = (friend) => {
  const stored = readJson(FRIENDS_STORAGE_KEY, []);
  writeJson(FRIENDS_STORAGE_KEY, [friend, ...stored.filter((item) => item.id !== friend.id)].slice(0, 24));
};

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
    reasons.push("Flexible lesson mode");
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

const featuredTeachers = () =>
  teacherDirectory
    .slice()
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .map((teacher) => ({
      teacher,
      score: teacher.rating * 10 + Math.round((teacher.reviews || 0) / 8),
      reasons: ["Popular tutor", `Replies in about ${teacher.responseTime}`, "Good for first shortlisting"],
      distanceKm: null,
    }));

const parseFeeNumber = (teacher, mode = "online") => {
  const label = feeLabelForTeacher(teacher, mode);
  const match = String(label || "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Infinity;
};

const filteredEntries = (entries = [], request = null) =>
  entries.filter((entry) => {
    const searchTerm = tutorDirectorySearchInput?.value.trim() || "";
    if (searchTerm && !matchesText(`${entry.teacher.name} ${(entry.teacher.subjects || []).join(" ")}`, searchTerm)) {
      return false;
    }
    if ((teacherFilters.minRating || 0) > 0 && (entry.teacher.rating || 0) < teacherFilters.minRating) {
      return false;
    }
    if (teacherFilters.lessonMode !== "any") {
      const lessonMode = teacherFilters.lessonMode;
      if (lessonMode === "both") {
        if ((entry.teacher.mode || []).length < 2) return false;
      } else if (!(entry.teacher.mode || []).includes(lessonMode)) {
        return false;
      }
    }
    if (teacherFilters.availability && !(entry.teacher.availability || []).some((slot) => matchesText(slot, teacherFilters.availability))) {
      return false;
    }
    if ((teacherFilters.budgetCap || 0) > 0) {
      const fee = parseFeeNumber(entry.teacher, request?.mode || teacherFilters.lessonMode || "online");
      if (fee > teacherFilters.budgetCap) return false;
    }
    if (teacherFilters.gender !== "any" && entry.teacher.gender !== teacherFilters.gender) {
      return false;
    }
    return true;
  });

const sortEntriesForResults = (entries) => {
  const list = [...entries];
  if (activeResultSort === "closest") {
    return list.sort(
      (a, b) =>
        (Number.isFinite(a.distanceKm) ? a.distanceKm : Infinity) - (Number.isFinite(b.distanceKm) ? b.distanceKm : Infinity) ||
        b.score - a.score ||
        b.teacher.rating - a.teacher.rating
    );
  }
  if (activeResultSort === "rating") {
    return list.sort((a, b) => b.teacher.rating - a.teacher.rating || b.teacher.reviews - a.teacher.reviews || b.score - a.score);
  }
  if (activeResultSort === "fastest") {
    return list.sort((a, b) => responseTimeMinutes(a.teacher) - responseTimeMinutes(b.teacher) || b.score - a.score || b.teacher.rating - a.teacher.rating);
  }
  if (activeResultSort === "price-low") {
    return list.sort((a, b) => parseFeeNumber(a.teacher, currentRequest().mode) - parseFeeNumber(b.teacher, currentRequest().mode));
  }
  if (activeResultSort === "price-high") {
    return list.sort((a, b) => parseFeeNumber(b.teacher, currentRequest().mode) - parseFeeNumber(a.teacher, currentRequest().mode));
  }
  return list;
};

const activeRequestRanked = () => {
  const request = currentRequest();
  if (!shouldPreviewRequest(request)) return [];
  return rankTeachers(request);
};

const getTeacherById = (teacherId) => teacherDirectory.find((teacher) => teacher.id === teacherId) || null;

const getSelectedTeacher = (request = currentRequest(), ranked = activeRequestRanked()) => {
  if (!ranked.length) return getTeacherById(selectedTutorId) || teacherDirectory[0] || null;
  return ranked.find((entry) => entry.teacher.id === selectedTutorId)?.teacher || ranked[0]?.teacher || null;
};

const getActiveProfileTeacher = (request = currentRequest(), ranked = activeRequestRanked()) => {
  if (!ranked.length) return getTeacherById(activeProfileTutorId) || teacherDirectory[0] || null;
  return ranked.find((entry) => entry.teacher.id === activeProfileTutorId)?.teacher || ranked[0]?.teacher || null;
};

const getActiveProfileEntry = (request = currentRequest(), ranked = activeRequestRanked()) =>
  ranked.find((entry) => entry.teacher.id === activeProfileTutorId) || ranked[0] || null;

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

const setLocationStatus = (message) => {
  if (locationStatusEl) locationStatusEl.textContent = message;
};

const setHomeStartStatus = (message) => {
  if (homeStartStatusEl) homeStartStatusEl.textContent = message;
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
  syncModeButtons(tutorModeInput.value);
  if (homeSubjectInput) homeSubjectInput.value = request.subject || "";
  if (homeSyllabusInput) homeSyllabusInput.value = request.syllabus || "";
  if (homeLevelInput) homeLevelInput.value = request.level || "";
  if (homeAreaInput) homeAreaInput.value = request.area || "";
  syncHomeModeButtons(tutorModeInput.value);
};

const syncModeButtons = (value = "online") => {
  const normalized = normalizeLessonMode(value);
  modeChoiceButtons.forEach((button) => {
    const active = normalizeLessonMode(button.dataset.modeChoice || "") === normalized;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
};

const syncHomeModeButtons = (value = "online") => {
  const normalized = normalizeLessonMode(value);
  homeModeButtons.forEach((button) => {
    const active = normalizeLessonMode(button.dataset.homeMode || "") === normalized;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (homeModeInput) homeModeInput.value = normalized;
};

const syncHomeStartFromMainForm = () => {
  if (homeSubjectInput && tutorSubjectInput.value && !homeSubjectInput.value) homeSubjectInput.value = tutorSubjectInput.value;
  if (homeSyllabusInput && tutorSyllabusInput.value && !homeSyllabusInput.value) homeSyllabusInput.value = tutorSyllabusInput.value;
  if (homeLevelInput && tutorLevelInput.value && !homeLevelInput.value) homeLevelInput.value = tutorLevelInput.value;
  if (homeAreaInput && tutorAreaInput.value && !homeAreaInput.value) homeAreaInput.value = tutorAreaInput.value;
  syncHomeModeButtons(tutorModeInput?.value || "online");
};

const applyHomeStart = () => {
  const subject = homeSubjectInput?.value.trim() || "";
  const syllabus = homeSyllabusInput?.value.trim() || "";
  const level = homeLevelInput?.value.trim() || "";
  const area = homeAreaInput?.value.trim() || "";
  const mode = normalizeLessonMode(homeModeInput?.value || "online");

  if (!subject || !level) {
    setHomeStartStatus("Add at least a subject and level to open the first shortlist.");
    return;
  }

  tutorSubjectInput.value = subject;
  tutorSyllabusInput.value = syllabus;
  tutorLevelInput.value = level;
  tutorAreaInput.value = area;
  tutorModeInput.value = mode;
  syncModeButtons(tutorModeInput.value);
  refreshApp();
  setHomeStartStatus("Shortlist ready. Compare the strongest tutor fits now.");
  activateScreen("results");
};

const syncResultSortButtons = () => {
  resultSortButtons.forEach((button) => {
    const active = button.dataset.resultSort === activeResultSort;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
};

const resolveRootScreen = (screenId) => {
  if (ROOT_SCREENS.has(screenId)) return screenId;
  let currentScreen = screenId;
  const visited = new Set();
  while (SCREEN_PARENT_TARGETS[currentScreen] && !visited.has(currentScreen)) {
    visited.add(currentScreen);
    currentScreen = SCREEN_PARENT_TARGETS[currentScreen];
    if (ROOT_SCREENS.has(currentScreen)) return currentScreen;
  }
  return "results";
};

const fallbackBackScreen = (screenId) => {
  if (CHILD_SCREENS.has(screenId)) return SCREEN_PARENT_TARGETS[screenId] || resolveRootScreen(screenId);
  return resolveRootScreen(screenId);
};

const buildScreenUrl = (screenId) => {
  const url = new URL(window.location.href);
  if (screenId === "results") {
    url.searchParams.delete("screen");
  } else {
    url.searchParams.set("screen", screenId);
  }
  return url.toString();
};

const screenNavTargets = (screenId) => {
  return new Set([resolveRootScreen(screenId)]);
};

const activateScreen = (screenId, options = {}) => {
  const nextScreen = APP_SCREEN_IDS.has(screenId) ? screenId : "results";
  const previousScreen = activeScreen;
  const {
    replaceHistory = false,
    scrollBehavior = "smooth",
    updateHistory = true,
  } = options;

  activeScreen = nextScreen;
  const activeTargets = screenNavTargets(nextScreen);
  appScreens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === nextScreen);
  });
  screenNavButtons.forEach((button) => {
    button.classList.toggle("active", activeTargets.has(button.dataset.screenTarget || ""));
  });

  if (updateHistory && window.history?.replaceState) {
    const nextUrl = buildScreenUrl(nextScreen);
    try {
      if (replaceHistory || nextScreen === previousScreen) {
        window.history.replaceState({ depth: appHistoryDepth, icEducateScreen: true, screenId: nextScreen }, "", nextUrl);
      } else if (window.history.pushState) {
        const nextDepth = appHistoryDepth + 1;
        window.history.pushState({ depth: nextDepth, icEducateScreen: true, screenId: nextScreen }, "", nextUrl);
        appHistoryDepth = nextDepth;
      }
    } catch (error) {
      appHistoryDepth = Math.max(0, appHistoryDepth);
    }
  }

  if (document.body.classList.contains("embedded-shell") || window.matchMedia("(max-width: 980px)").matches) {
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  }
};

const goBackScreen = () => {
  if (appHistoryDepth > 0 && window.history?.back) {
    window.history.back();
    return;
  }
  const fallbackScreen = fallbackBackScreen(activeScreen);
  if (fallbackScreen !== activeScreen) {
    activateScreen(fallbackScreen, { replaceHistory: true });
  }
};

const renderSummary = (request, selectedTutor, rankedTeachers) => {
  if (!tutorSummaryEl) return;
  if (!request) {
    tutorSummaryEl.innerHTML = `
      <span class="tag">Live brief</span>
      <h3>Start with subject, level, or area.</h3>
      <p class="hint">As you build the request, the shortlist and tutor fit will stay visible here.</p>
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
    <h3>${escapeHtml(formatRequestHeadline(request))}</h3>
    <p class="hint">Best live match: ${escapeHtml(targetTutor?.name || topMatch?.name || "TBD")}</p>
    <div class="result-links">
      ${summaryChips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}
    </div>
    <p class="hint">${escapeHtml(request.note || "Add a short goal or weak area to sharpen the shortlist.")}</p>
  `;
};

const renderRailTopTutor = (request, teacher, rankedEntry = null) => {
  if (!railTopTutorEl) return;
  if (!teacher) {
    railTopTutorEl.innerHTML = `
      <span class="tag">Top tutor</span>
      <h3>No tutor selected yet.</h3>
      <p class="hint">The strongest live tutor fit will appear here once the request has enough detail.</p>
    `;
    return;
  }

  const details = profileDetailsFor(teacher);
  const priceLabel =
    normalizeLessonMode(request?.mode) === "physical" && teacher.physicalFee ? teacher.physicalFee : teacher.onlineFee || teacher.physicalFee || "-";
  const distanceLabel = Number.isFinite(rankedEntry?.distanceKm) ? `${rankedEntry.distanceKm.toFixed(1)} km away` : teacher.location || "Online";

  railTopTutorEl.innerHTML = `
    <span class="tag">Top tutor</span>
    <div class="rail-tutor-head">
      <div class="rail-avatar" style="background:${avatarBackground(teacher.name)}">${escapeHtml(teacherInitials(teacher.name))}</div>
      <div>
        <h3>${escapeHtml(teacher.name)}</h3>
        <p class="hint">${escapeHtml(teacher.syllabus)} · ${escapeHtml(teacher.level)}</p>
      </div>
    </div>
    <div class="result-links">
      <span class="chip">${escapeHtml(teacherRatingLabel(teacher))}</span>
      <span class="chip">${escapeHtml(String(teacher.reviews || 0))} reviews</span>
      <span class="chip">${escapeHtml(priceLabel)}</span>
    </div>
    <p class="hint">${escapeHtml(details.bestFor[0])} · ${escapeHtml(distanceLabel)}</p>
    <button type="button" class="button small secondary rail-open-profile-btn" data-view-profile="${escapeHtml(teacher.id)}">Open tutor</button>
  `;
};

const renderSearchTopMatch = (request, ranked) => {
  if (!searchTopMatchEl) return;
  const teacher = ranked[0]?.teacher || null;
  if (!request || !teacher) {
    searchTopMatchEl.innerHTML = `
      <span class="tag">Search preview</span>
      <h3>Add the first few details to see the strongest live fit.</h3>
      <p class="hint">As soon as the request has enough context, the tutor preview updates here.</p>
    `;
    return;
  }

  const entry = ranked[0];
  const priceLabel =
    normalizeLessonMode(request.mode) === "physical" && teacher.physicalFee ? teacher.physicalFee : teacher.onlineFee || teacher.physicalFee || "-";
  searchTopMatchEl.innerHTML = `
    <span class="tag">Live top match</span>
    <div class="search-preview-head">
      <div class="rail-avatar" style="background:${avatarBackground(teacher.name)}">${escapeHtml(teacherInitials(teacher.name))}</div>
      <div>
        <h3>${escapeHtml(teacher.name)}</h3>
        <p class="hint">${escapeHtml(teacher.intro)}</p>
      </div>
    </div>
    <div class="result-links">
      <span class="chip">${escapeHtml(teacherRatingLabel(teacher))}</span>
      <span class="chip">${escapeHtml(priceLabel)}</span>
      <span class="chip">${escapeHtml(teacher.responseTime)}</span>
    </div>
    <ul class="search-preview-list">
      ${(entry.reasons || []).slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
    </ul>
  `;
};

const renderResultsRequestChips = (request) => {
  if (!resultsRequestChipsEl) return;
  if (!request) {
    resultsRequestChipsEl.innerHTML = "";
    resultsRequestChipsEl.hidden = true;
    return;
  }
  const chips = [
    request.subject || "Subject",
    request.topic || "Topic",
    request.syllabus || "Any syllabus",
    request.level || "Any level",
    request.area || "Any area",
    lessonModeLabel(request.mode),
    request.preferredTime || "Any time",
  ].filter(Boolean);
  resultsRequestChipsEl.hidden = chips.length === 0;
  resultsRequestChipsEl.innerHTML = chips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("");
};

const buildMiniTutorCard = (teacher, context = "") => {
  const details = profileDetailsFor(teacher);
  return `
    <article class="discover-mini-card">
      <div class="discover-mini-head">
        ${tutorAvatarMarkup(teacher, "discover-mini-avatar")}
        <div>
          <h3>${escapeHtml(teacher.name)}</h3>
          <p class="result-card-subtitle">${escapeHtml(teacher.syllabus)} · ${escapeHtml(teacher.level)}</p>
          <p class="hint">${escapeHtml(details.bestFor[0])}</p>
        </div>
      </div>
      <div class="result-links">
        <span class="chip">${escapeHtml(teacherRatingLabel(teacher))}</span>
        <span class="chip">${escapeHtml(teacher.responseTime)}</span>
        <span class="chip">${escapeHtml(teacher.location)}</span>
      </div>
      <div class="result-links result-links-soft">
        <span class="chip">${escapeHtml(teacher.onlineFee || teacher.physicalFee || "-")}</span>
        <span class="chip">${escapeHtml((teacher.mode || []).map((item) => lessonModeLabel(item)).join(" / "))}</span>
      </div>
      <p class="hint">${escapeHtml(context || details.bestFor[0])}</p>
      <div class="button-row discover-mini-actions">
        <button type="button" class="secondary-btn" data-view-profile="${escapeHtml(teacher.id)}">View tutor</button>
        <button type="button" class="secondary-btn" data-book-tutor="${escapeHtml(teacher.id)}">Book</button>
      </div>
    </article>
  `;
};

const renderDiscoverSubjectRail = () => {
  if (!discoverSubjectRailEl) return;
  discoverSubjectRailEl.innerHTML = discoverRoutes
    .map((route) => {
      const topTutor =
        teacherDirectory.find((teacher) => matchesText(teacher.subjects.join(" "), route.subject) && matchesText(teacher.level, route.level)) ||
        teacherDirectory.find((teacher) => matchesText(teacher.subjects.join(" "), route.subject)) ||
        teacherDirectory[0];
      return `
        <article class="discover-subject-card">
          <span class="tag">${escapeHtml(route.subject)}</span>
          <h3>${escapeHtml(route.subtitle)}</h3>
          <p>${escapeHtml(route.area)} · ${escapeHtml(route.level)}</p>
          <div class="result-links">
            <span class="chip">${escapeHtml(topTutor.name)}</span>
            <span class="chip">${escapeHtml(teacherRatingLabel(topTutor))}</span>
          </div>
          <button
            type="button"
            class="button small secondary"
            data-launch-subject="${escapeHtml(route.subject)}"
            data-launch-level="${escapeHtml(route.level)}"
            data-launch-area="${escapeHtml(route.area)}"
          >
            Search this route
          </button>
        </article>
      `;
    })
    .join("");
};

const renderDiscoverFeaturedTutors = (request, rankedTeachers) => {
  if (!discoverFeaturedTutorsEl) return;
  const source = rankedTeachers?.length ? rankedTeachers.slice(0, 4) : featuredTeachers().slice(0, 4);
  discoverFeaturedTutorsEl.innerHTML = source
    .map((entry) => buildMiniTutorCard(entry.teacher, (entry.reasons || [entry.teacher.intro])[0]))
    .join("");
};

const currentMarketplaceRole = () =>
  (marketplaceProfileRow?.preferences?.account_role || readStudentProfile().accountRole) === "teacher" ? "teacher" : "student";

const studentRequestContactHref = (request) => {
  if (!request?.consentWhatsapp) return "";
  const digits = contactPhoneForRequest(request);
  if (!digits) return "";
  const message = [
    `Hi ${request.studentName || "there"}, I’m an IC Educate teacher.`,
    `I saw your ${request.subject || "tutor"} request${request.level ? ` for ${request.level}` : ""}.`,
    request.area ? `I can help in ${request.area}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};

const renderTeacherDiscoverRequests = () => {
  if (!discoverFeedGridEl) return;
  const requests = readStoredTutorRequests()
    .filter((request) => request && (request.subject || request.topic || request.level || request.area))
    .slice()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 4);

  if (!requests.length) {
    discoverFeedGridEl.innerHTML = `
      <article class="discover-feed-card discover-feed-card-rich">
        <span class="tag">Teacher view</span>
        <h3>No student requests yet.</h3>
        <p>When a student saves a request, it will appear here for teachers with consented WhatsApp contact or a copyable brief.</p>
        <div class="discover-feed-card-foot">
          <strong>Nothing to contact yet</strong>
          <button type="button" class="button small secondary" data-screen-target="search">Create a sample request</button>
        </div>
      </article>
    `;
    return;
  }

  discoverFeedGridEl.innerHTML = requests
    .map((request) => {
      const contactHref = studentRequestContactHref(request);
      const summary = [request.subject, request.level, request.area, lessonModeLabel(request.mode || "online")].filter(Boolean).join(" · ");
      const detail = [
        request.topic ? `Topic: ${request.topic}` : "",
        request.syllabus ? `Syllabus: ${request.syllabus}` : "",
        request.preferredTime ? `Time: ${request.preferredTime}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return `
        <article class="discover-feed-card discover-feed-card-rich">
          <span class="tag">Student request</span>
          <h3>${escapeHtml(request.studentName || "Anonymous student")}</h3>
          <p>${escapeHtml(summary || "Tutor request")}</p>
          <div class="result-links">
            ${request.subject ? `<span class="chip">${escapeHtml(request.subject)}</span>` : ""}
            ${request.level ? `<span class="chip">${escapeHtml(request.level)}</span>` : ""}
            ${request.area ? `<span class="chip">${escapeHtml(request.area)}</span>` : ""}
            ${request.consentWhatsapp ? `<span class="chip">WhatsApp consent</span>` : `<span class="chip">No WhatsApp consent</span>`}
          </div>
          <p>${escapeHtml(detail || request.note || "Open the request to copy a brief.")}</p>
          <div class="discover-feed-card-foot">
            <strong>${escapeHtml(contactHref ? "Ready to contact" : "Copy the brief first")}</strong>
            <div class="button-row">
              ${contactHref ? `<a class="button small primary" href="${escapeHtml(contactHref)}" target="_blank" rel="noreferrer">Contact student</a>` : ""}
              <button type="button" class="button small secondary" data-copy-request="${escapeHtml(request.id)}">Copy brief</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderCommunityTeacherProfiles = () => {
  if (!communityTeacherPanelEl || !communityTeacherGridEl) return;
  const profiles = teacherDirectory
    .filter((teacher) => teacher.isCommunityProfile)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 4);
  communityTeacherPanelEl.hidden = profiles.length === 0;
  communityTeacherGridEl.innerHTML = profiles
    .map((teacher) => {
      const details = profileDetailsFor(teacher);
      const subjects = (teacher.subjects || []).slice(0, 3);
      return `
        <article class="community-teacher-card">
          <div class="community-teacher-head">
            ${tutorAvatarMarkup(teacher, "community-teacher-avatar")}
            <div>
              <span class="tag">${teacher.isLocalProfile ? "Your profile" : "New teacher"}</span>
              <h3>${escapeHtml(teacher.name)}</h3>
              <p>${escapeHtml(teacher.syllabus)} · ${escapeHtml(teacher.level)}</p>
            </div>
          </div>
          <div class="result-links">
            ${subjects.map((subject) => `<span class="chip">${escapeHtml(subject)}</span>`).join("")}
          </div>
          <dl class="community-teacher-facts">
            <div><dt>Experience</dt><dd>${escapeHtml(details.yearsExperience)}</dd></div>
            <div><dt>Teaches in</dt><dd>${escapeHtml(teacher.location)}</dd></div>
            <div><dt>Lessons</dt><dd>${escapeHtml((teacher.mode || []).map((mode) => lessonModeLabel(mode)).join(" / "))}</dd></div>
            <div><dt>From</dt><dd>${escapeHtml(teacher.onlineFee || teacher.physicalFee || "Ask teacher")}</dd></div>
          </dl>
          <p class="community-teacher-intro">${escapeHtml(teacher.intro)}</p>
          <button type="button" class="button small secondary" data-view-profile="${escapeHtml(teacher.id)}">View profile</button>
        </article>
      `;
    })
    .join("");
};

const renderDiscoverFeed = () => {
  if (!discoverFeedGridEl) return;
  const role = currentMarketplaceRole();
  if (discoverFeedTitleEl) {
    discoverFeedTitleEl.textContent =
      role === "teacher"
        ? "See the latest student requests."
        : "Browse teacher posts, saved tutors, and friend activity.";
  }

  if (role === "teacher") {
    renderTeacherDiscoverRequests();
  } else {
    const promos = readJson(TEACHER_PROMOS_STORAGE_KEY, []).slice(0, 2);
    const promoCards = promos.map(
      (promo) => `
        <article class="discover-feed-card discover-feed-card-rich">
          <div class="discover-feed-card-media">
            ${
              promo.mediaType === "video"
                ? `<video class="discover-feed-media" src="${escapeHtml(promo.mediaUrl)}" autoplay muted loop playsinline></video>`
                : `<img class="discover-feed-media" src="${escapeHtml(promo.mediaUrl)}" alt="${escapeHtml(promo.headline || promo.teacherName)}" />`
            }
          </div>
          <div class="discover-feed-card-body">
            <div class="result-links">
              <span class="chip">${escapeHtml(promo.market === "hongkong" ? "Hong Kong" : "Malaysia")}</span>
              <span class="chip">${escapeHtml(promo.subject || "Tutor")}</span>
            </div>
            <h3>${escapeHtml(promo.headline || "Teacher post")}</h3>
            <p>${escapeHtml(promo.caption || "")}</p>
            <div class="discover-feed-card-foot">
              <strong>${escapeHtml(promo.teacherName || "Teacher")}</strong>
              <button
                type="button"
                class="button small secondary"
                data-launch-subject="${escapeHtml(promo.subject || "")}"
                data-launch-area="${escapeHtml(promo.market === "hongkong" ? "Kowloon" : "Petaling Jaya")}"
              >
                Request match
              </button>
            </div>
          </div>
        </article>
      `
    );

    const routeCards = discoverFeedCards
      .map((card) => {
        if (card.href) {
          return `
            <article class="discover-feed-card">
              <span class="tag">${escapeHtml(card.meta)}</span>
              <h3>${escapeHtml(card.title)}</h3>
              <p>${escapeHtml(card.description)}</p>
              <a class="button small secondary" href="${escapeHtml(card.href)}">${escapeHtml(card.actionLabel)}</a>
            </article>
          `;
        }

        return `
          <article class="discover-feed-card">
            <span class="tag">${escapeHtml(card.meta)}</span>
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.description)}</p>
            <button
              type="button"
              class="button small secondary"
              data-launch-subject="${escapeHtml(card.subject || "")}"
              data-launch-level="${escapeHtml(card.level || "")}"
              data-launch-area="${escapeHtml(card.area || "")}"
            >
              ${escapeHtml(card.actionLabel)}
            </button>
          </article>
        `;
      })
      .join("");

    discoverFeedGridEl.innerHTML = [...promoCards, routeCards].join("");
  }

  if (discoverSavedTutorStripEl) {
    const tutors = readJson(MY_TEACHERS_STORAGE_KEY, []).slice(0, 4);
    discoverSavedTutorStripEl.innerHTML = tutors
      .map(
        (teacher) => `
          <article class="discover-saved-card">
            <strong>${escapeHtml(teacher.name)}</strong>
            <p>${escapeHtml(teacher.focus)}</p>
            <div class="result-links">
              <span class="chip">${escapeHtml(teacher.area)}</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  if (discoverFriendActivityEl) {
    const friends = readJson(FRIENDS_STORAGE_KEY, []).slice(0, 4);
    discoverFriendActivityEl.innerHTML = friends
      .map(
        (friend) => `
          <article class="discover-activity-card">
            <strong>${escapeHtml(friend.name)}</strong>
            <p>${escapeHtml(friend.focus)}</p>
            <span class="chip">${escapeHtml(friend.note)}</span>
          </article>
        `
      )
      .join("");
  }
};

const renderTeacherPromoFeed = () => {
  if (!teacherPromoFeedEl) return;
  const promos = readJson(TEACHER_PROMOS_STORAGE_KEY, []);
  teacherPromoFeedEl.innerHTML = promos
    .map((promo) => {
      const mediaMarkup =
        promo.mediaType === "video"
          ? `<video class="teacher-promo-media" src="${escapeHtml(promo.mediaUrl)}" autoplay muted loop playsinline></video>`
          : `<img class="teacher-promo-media" src="${escapeHtml(promo.mediaUrl)}" alt="${escapeHtml(promo.headline || promo.teacherName)}" style="object-position:${escapeHtml(
              promo.coverPosition || "center center"
            )};" />`;
      const actionSubject = promo.subject || "";
      const actionArea = promo.market === "hongkong" ? "Kowloon" : "Petaling Jaya";
      return `
        <article class="teacher-promo-card">
          <div class="teacher-promo-media-wrap">
            ${mediaMarkup}
          </div>
          <div class="teacher-promo-body">
            <div class="result-links">
              <span class="chip">${escapeHtml(promo.market === "hongkong" ? "Hong Kong" : "Malaysia")}</span>
              <span class="chip">${escapeHtml(promo.subject || "Tutor")}</span>
            </div>
            <h3>${escapeHtml(promo.headline || "Teacher promo")}</h3>
            <p class="hint">${escapeHtml(promo.caption || "")}</p>
            <div class="teacher-promo-foot">
              <strong>${escapeHtml(promo.teacherName || "Teacher")}</strong>
              <button
                type="button"
                class="button small secondary"
                data-launch-subject="${escapeHtml(actionSubject)}"
                data-launch-area="${escapeHtml(actionArea)}"
                data-screen-target="search"
              >
                Request this tutor
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
};

const renderNetworkLists = () => {
  if (myTeachersListEl) {
    const myTeachers = readJson(MY_TEACHERS_STORAGE_KEY, []);
    myTeachersListEl.innerHTML = myTeachers
      .map(
        (teacher) => `
          <article class="network-item-card">
            <strong>${escapeHtml(teacher.name)}</strong>
            <p>${escapeHtml(teacher.focus)}</p>
            <div class="result-links">
              <span class="chip">${escapeHtml(teacher.area)}</span>
              <button type="button" class="secondary-btn" data-launch-subject="${escapeHtml(teacher.focus.split(" ")[0] || "")}" data-launch-area="${escapeHtml(teacher.area)}">Open route</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  if (friendsListEl) {
    const friends = readJson(FRIENDS_STORAGE_KEY, []);
    friendsListEl.innerHTML = friends
      .map(
        (friend) => `
          <article class="network-item-card">
            <strong>${escapeHtml(friend.name)}</strong>
            <p>${escapeHtml(friend.focus)}</p>
            <div class="result-links">
              <span class="chip">${escapeHtml(friend.note)}</span>
            </div>
          </article>
        `
      )
      .join("");
  }
};

const renderTutorCard = (entry, request, rank, mode = "matched") => {
  const { teacher, score, reasons, distanceKm } = entry;
  const selected = teacher.id === selectedTutorId;
  const requestMode = normalizeLessonMode(request.mode);
  const feeLabel = feeLabelForTeacher(teacher, requestMode);
  const availabilityLabel = (teacher.availability || []).slice(0, 2).join(" / ") || "Flexible";
  const modeLabel = (teacher.mode || []).map((item) => lessonModeLabel(item)).join(" / ");
  const distanceLabel = Number.isFinite(distanceKm) ? `${distanceKm.toFixed(1)} km away` : teacher.location;
  const primaryTag = mode === "featured" ? "Featured tutor" : `#${rank + 1} match`;

  return `
    <article class="marketplace-result-card ${selected ? "featured" : ""}">
      <div class="marketplace-result-top">
        <div class="result-card-identity">
          ${tutorAvatarMarkup(teacher, "result-card-avatar")}
          <div class="result-card-copy">
            <div class="result-card-row">
              <span class="tag">${escapeHtml(primaryTag)}</span>
              <span class="chip">${escapeHtml(teacherRatingLabel(teacher))}</span>
              <span class="chip">${escapeHtml(String(teacher.reviews || 0))} reviews</span>
            </div>
            <h3>${escapeHtml(teacher.name)}</h3>
            <p class="result-card-subtitle">${escapeHtml(teacher.syllabus || "Any syllabus")} · ${escapeHtml(teacher.level || "Any level")} · ${escapeHtml(distanceLabel)}</p>
            <p class="hint">${escapeHtml(teacher.intro)}</p>
          </div>
        </div>
        <div class="result-price-stack">
          <strong>${escapeHtml(feeLabel)}</strong>
          <span>${escapeHtml(lessonModeLabel(requestMode))}</span>
        </div>
      </div>
      <div class="result-stat-grid">
        <div>
          <span>Match score</span>
          <strong>${escapeHtml(String(Math.max(1, Math.round(score))))}</strong>
        </div>
        <div>
          <span>Reply speed</span>
          <strong>${escapeHtml(teacher.responseTime || "fast")}</strong>
        </div>
        <div>
          <span>Availability</span>
          <strong>${escapeHtml(availabilityLabel)}</strong>
        </div>
      </div>
      <div class="result-links result-primary-meta">
        <span class="chip">Replies ${escapeHtml(teacher.responseTime || "fast")}</span>
        <span class="chip">${escapeHtml(distanceLabel)}</span>
        <span class="chip">${escapeHtml(teacher.syllabus || "Any syllabus")}</span>
        <span class="chip">${escapeHtml(modeLabel || lessonModeLabel(requestMode))}</span>
        <span class="chip">${escapeHtml(teacher.level || "Any level")}</span>
      </div>
      <ul class="marketplace-result-list">
        ${(reasons.length ? reasons : ["Good overall fit"]).slice(0, 3).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
      <div class="marketplace-result-actions">
        <button type="button" data-view-profile="${escapeHtml(teacher.id)}">View profile</button>
        <button type="button" class="secondary-btn" data-book-tutor="${escapeHtml(teacher.id)}">${selected ? "Continue request" : "Request tutor"}</button>
        <button type="button" class="secondary-btn result-action-aux" data-select-tutor="${escapeHtml(teacher.id)}">${selected ? "Selected" : "Shortlist"}</button>
        <button type="button" class="secondary-btn result-action-aux" data-copy-tutor="${escapeHtml(teacher.id)}">Copy brief</button>
      </div>
    </article>
  `;
};

const renderTuitionCentres = () => {
  if (!tutorMatchesEl) return;
  const query = tutorDirectorySearchInput?.value.trim() || "";
  const modeFilter = teacherFilters.lessonMode || "any";
  let centres = tuitionCentres.filter((centre) => {
    if (query && !matchesText(`${centre.name} ${centre.subjects.join(" ")} ${centre.area}`, query)) return false;
    if (modeFilter !== "any" && modeFilter !== "both" && !centre.mode.includes(modeFilter)) return false;
    if ((teacherFilters.minRating || 0) > 0 && centre.rating < teacherFilters.minRating) return false;
    if ((teacherFilters.budgetCap || 0) > 0 && centre.price > teacherFilters.budgetCap) return false;
    return true;
  });

  if (activeResultSort === "closest") centres.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  if (activeResultSort === "rating") centres.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  if (activeResultSort === "price-low") centres.sort((a, b) => a.price - b.price);
  if (activeResultSort === "price-high") centres.sort((a, b) => b.price - a.price);

  if (!centres.length) {
    tutorMatchesEl.innerHTML = `<article class="request-card empty"><h3>No tuition centres match these filters.</h3><p class="hint">Try another subject, area, lesson mode, or budget.</p></article>`;
    return;
  }

  tutorMatchesEl.innerHTML = centres
    .map(
      (centre) => `
        <article class="marketplace-result-card tuition-centre-card">
          <div class="tuition-centre-head">
            <div class="tuition-centre-icon" aria-hidden="true">IC</div>
            <div>
              <span class="tag">Tuition centre</span>
              <h3>${escapeHtml(centre.name)}</h3>
              <p class="result-card-subtitle">${escapeHtml(centre.area)}${Number.isFinite(centre.distanceKm) ? ` · ${centre.distanceKm.toFixed(1)} km away` : ""}</p>
            </div>
            <strong>${escapeHtml(centre.priceLabel)}</strong>
          </div>
          <div class="result-links">
            <span class="chip">${escapeHtml(centre.rating.toFixed(1))} ★</span>
            <span class="chip">${escapeHtml(String(centre.reviews))} reviews</span>
            <span class="chip">${escapeHtml(centre.mode.map(lessonModeLabel).join(" / "))}</span>
          </div>
          <div class="result-links">${centre.subjects.map((subject) => `<span class="chip">${escapeHtml(subject)}</span>`).join("")}</div>
          <p class="hint">${escapeHtml(centre.levels.join(" · "))} · ${escapeHtml(centre.nextIntake)}</p>
          <div class="marketplace-result-actions">
            <a class="button primary" href="https://wa.me/60178265300?text=${encodeURIComponent(`Hi IC Educate, I would like details for ${centre.name}.`)}" target="_blank" rel="noreferrer">Ask about classes</a>
          </div>
        </article>
      `
    )
    .join("");
};

const renderResults = (request, rankedTeachers) => {
  if (!tutorMatchesEl) return;
  if (activeDirectoryType === "centres") {
    renderTuitionCentres();
    return;
  }
  const base = rankedTeachers?.length ? sortEntriesForResults(rankedTeachers) : sortEntriesForResults(featuredTeachers());
  const source = filteredEntries(base, request || sampleRequest).slice(0, rankedTeachers?.length ? 6 : 4);
  tutorMatchesEl.innerHTML = source.map((entry, index) => renderTutorCard(entry, request || sampleRequest, index, request ? "matched" : "featured")).join("");
};

const marketplaceInboxThreads = () => {
  const requests = readStoredTutorRequests();
  if (!requests.length) return demoInboxThreads;
  const messages = readJson(MARKETPLACE_MESSAGES_STORAGE_KEY, []);
  return requests.map((request) => {
    const tutor = getTeacherById(request.selectedTutorId) || teacherDirectory.find((teacher) => teacher.name === request.selectedTutorName) || null;
    const requestMessages = messages.filter((message) => message.requestId === request.id);
    const status = request.bookingSlot ? "Booking requested" : request.selectedTutorId ? "Tutor selected" : "Request received";
    return {
      id: `request-thread-${request.id}`,
      requestId: request.id,
      remoteRequestId: request.remoteId || "",
      title: `${request.studentName || "Student"} / ${tutor?.name || "IC Educate"}`,
      subtitle: [request.subject, request.level, request.area].filter(Boolean).join(" · ") || "Tutor request",
      status,
      unread: requestMessages.filter((message) => message.from === "Operator" && !message.readAt).length,
      messages: requestMessages.length
        ? requestMessages
        : [{
            from: "IC Educate",
            text: request.bookingSlot
              ? `Your preferred ${request.bookingDay} ${request.bookingSlot} slot was added to the request.`
              : "Your tutor request is in the matching queue.",
            time: "Now",
          }],
    };
  });
};

const renderInbox = () => {
  if (!inboxThreadListEl || !inboxMessageViewEl) return;
  const inboxThreads = marketplaceInboxThreads();
  inboxThreadListEl.innerHTML = inboxThreads
    .map(
      (thread, index) => `
        <button type="button" class="inbox-thread-btn ${thread.id === activeInboxThreadId ? "active" : ""}" data-thread-id="${escapeHtml(thread.id)}">
          ${studentAvatarMarkup(index + 1, "message-student-avatar")}
          <div class="inbox-thread-copy">
            <strong>${escapeHtml(thread.title)}</strong>
            <p>${escapeHtml(thread.subtitle)}</p>
          </div>
          <div class="inbox-thread-meta">
            <span class="chip">${escapeHtml(thread.status)}</span>
            ${thread.unread ? `<span class="chip warn">${escapeHtml(String(thread.unread))} new</span>` : ""}
          </div>
        </button>
      `
    )
    .join("");

  const activeThread = inboxThreads.find((thread) => thread.id === activeInboxThreadId) || inboxThreads[0];
  if (!activeThread) {
    inboxMessageViewEl.innerHTML = `
      <span class="tag">Inbox</span>
      <h3>No conversations yet.</h3>
      <p class="hint">Matched requests and tutor follow-ups will appear here.</p>
    `;
    return;
  }

  inboxMessageViewEl.innerHTML = `
    <div class="inbox-message-head">
      <div>
        <span class="tag">Conversation</span>
        <h3>${escapeHtml(activeThread.title)}</h3>
        <p class="hint">${escapeHtml(activeThread.subtitle)}</p>
      </div>
      <span class="chip">${escapeHtml(activeThread.status)}</span>
    </div>
    <div class="inbox-message-stack">
      ${activeThread.messages
        .map(
          (message) => `
            <article class="inbox-bubble ${normalizeText(message.from) === "operator" ? "operator" : ""}">
              <strong>${escapeHtml(message.from)}</strong>
              <p>${escapeHtml(message.text)}</p>
              <span>${escapeHtml(message.time)}</span>
            </article>
          `
        )
        .join("")}
    </div>
    <div class="button-row booking-actions">
      <button type="button" class="button primary" data-screen-target="book">Continue booking</button>
      <button type="button" class="secondary-btn" data-screen-target="admin">Open admin queue</button>
    </div>
    ${
      activeThread.requestId
        ? `<form id="marketplaceMessageForm" class="inbox-compose-form" data-request-id="${escapeHtml(activeThread.requestId)}" data-remote-request-id="${escapeHtml(activeThread.remoteRequestId || "")}">
            <input name="message" type="text" maxlength="4000" placeholder="Message IC Educate" required />
            <button type="submit">Send</button>
          </form>`
        : ""
    }
  `;

  if (inboxSocialRailEl) {
    const friends = readJson(FRIENDS_STORAGE_KEY, []).slice(0, 3);
    const teachers = readJson(MY_TEACHERS_STORAGE_KEY, []).slice(0, 3);
    inboxSocialRailEl.innerHTML = `
      <div class="inbox-social-block">
        <span class="tag">Shared circle</span>
        <h3>People around this match</h3>
        <div class="inbox-social-stack">
          ${teachers
            .map(
              (teacher) => `
                <article class="inbox-social-card">
                  <strong>${escapeHtml(teacher.name)}</strong>
                  <p>${escapeHtml(teacher.focus)}</p>
                  <span class="chip">${escapeHtml(teacher.area)}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="inbox-social-block">
        <span class="tag">Referrals</span>
        <h3>Friends and parent intros</h3>
        <div class="inbox-social-stack">
          ${friends
            .map(
              (friend) => `
                <article class="inbox-social-card">
                  <strong>${escapeHtml(friend.name)}</strong>
                  <p>${escapeHtml(friend.focus)}</p>
                  <span class="chip">${escapeHtml(friend.note)}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="inbox-social-block">
        <span class="tag">Action</span>
        <h3>What to do next</h3>
        <ul class="profile-fit-list">
          <li>Confirm the preferred slot and lesson mode.</li>
          <li>Send the structured tutor brief into WhatsApp.</li>
          <li>Link a resource pack if the parent wants materials before class.</li>
        </ul>
      </div>
    `;
  }
};

const renderTeachBoard = () => {
  if (!teachLeadBoardEl) return;
  teachLeadBoardEl.innerHTML = teacherDemandCards
    .map(
      (card) => `
        <article class="teach-lead-card">
          <div class="teach-lead-head">
            <div>
              <span class="tag">${escapeHtml(card.subject)}</span>
              <h3>${escapeHtml(card.teacher)}</h3>
            </div>
            <span class="chip">${escapeHtml(lessonModeLabel(card.mode))}</span>
          </div>
          <div class="result-links">
            <span class="chip">${escapeHtml(card.level)}</span>
            <span class="chip">${escapeHtml(card.area)}</span>
            <span class="chip">${escapeHtml(card.timing)}</span>
          </div>
          <p class="hint">${escapeHtml(card.fit)}</p>
          <div class="marketplace-result-actions">
            <button type="button" class="secondary-btn" data-screen-target="inbox">Open inbox</button>
            <button type="button" class="secondary-btn" data-screen-target="admin">Open queue</button>
            <a class="button small secondary" href="./teachers.html">Teacher intake</a>
          </div>
        </article>
      `
    )
    .join("");
};

const renderTutorProfile = (request, teacher, rankedEntry = null) => {
  if (!tutorProfileEl) return;
  if (!teacher) {
    tutorProfileEl.innerHTML = `
      <article class="screen-panel">
        <span class="tag">Tutor profile</span>
        <h3>Pick a tutor to open the full profile.</h3>
        <p class="hint">You’ll get teaching fit, availability, districts served, and review context here.</p>
      </article>
    `;
    return;
  }

  const details = profileDetailsFor(teacher);
  const activeRequest = request || sampleRequest;
  const requestMode = normalizeLessonMode(activeRequest.mode);
  const feeLabel = feeLabelForTeacher(teacher, requestMode);
  const distanceLabel = Number.isFinite(rankedEntry?.distanceKm) ? `${rankedEntry.distanceKm.toFixed(1)} km away` : teacher.location || "Online";
  const fitReasons = (rankedEntry?.reasons || ["Strong general fit", "Responsive tutor", "Good availability"]).slice(0, 4);
  const weeklyAvailability = details.weeklyAvailability || {};
  const selected = teacher.id === selectedTutorId;

  tutorProfileEl.innerHTML = `
    <div class="profile-layout">
      <article class="profile-hero-card">
        <div class="profile-hero-head">
          ${tutorAvatarMarkup(teacher, "profile-hero-avatar")}
          <div class="profile-hero-copy">
            <span class="tag">${selected ? "Selected tutor" : "Tutor profile"}</span>
            <h3>${escapeHtml(teacher.name)}</h3>
            <p class="result-card-subtitle">${escapeHtml(teacher.syllabus || "Any syllabus")} · ${escapeHtml(teacher.level || "Any level")} · ${escapeHtml(distanceLabel)}</p>
            <p>${escapeHtml(teacher.intro)}</p>
          </div>
        </div>
        <div class="profile-metrics-grid">
          <div><span>Rating</span><strong>${escapeHtml(teacherRatingLabel(teacher))}</strong></div>
          <div><span>Reviews</span><strong>${escapeHtml(String(teacher.reviews || 0))}</strong></div>
          <div><span>Experience</span><strong>${escapeHtml(details.yearsExperience)}</strong></div>
          <div><span>Lessons</span><strong>${escapeHtml(details.lessonsCompleted)}</strong></div>
        </div>
        <div class="result-links">
          <span class="chip">${escapeHtml(teacher.syllabus || "Any syllabus")}</span>
          <span class="chip">${escapeHtml(teacher.level || "Any level")}</span>
          <span class="chip">${escapeHtml(distanceLabel)}</span>
          <span class="chip">${escapeHtml(feeLabel)}</span>
          <span class="chip">Replies ${escapeHtml(teacher.responseTime || "fast")}</span>
        </div>
      </article>

      <article class="profile-fit-card">
        <span class="tag">Why this tutor fits</span>
        <h3>Best for this request</h3>
        <ul class="profile-fit-list">
          ${fitReasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
        </ul>
        <div class="profile-detail-block">
          <strong>Teaching style</strong>
          <p>${escapeHtml(details.credentials)}</p>
        </div>
        <div class="profile-detail-block">
          <strong>Best for</strong>
          <div class="result-links">
            ${details.bestFor.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
        <blockquote class="profile-quote">"${escapeHtml(details.reviewQuote)}"</blockquote>
      </article>

      <article class="profile-side-card">
        <span class="tag">Areas served</span>
        <h3>Where lessons can happen</h3>
        <div class="result-links">
          ${details.districts.map((district) => `<span class="chip">${escapeHtml(district)}</span>`).join("")}
        </div>
        <div class="profile-detail-block">
          <strong>Languages</strong>
          <p>${escapeHtml(details.languages.join(" · "))}</p>
        </div>
      </article>
    </div>

    <article class="profile-schedule-card">
      <span class="tag">Weekly availability</span>
      <h3>Slots parents can request</h3>
      <div class="profile-availability-grid">
        ${dayOrder
          .map((day) => {
            const slots = weeklyAvailability[day] || [];
            return `
              <div class="profile-day-card ${slots.length ? "open" : "closed"}">
                <strong>${escapeHtml(day)}</strong>
                <div>
                  ${slots.length ? slots.map((slot) => `<span>${escapeHtml(slot)}</span>`).join("") : `<span>Full</span>`}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
};

const subjectCardFor = (subject) => {
  const stored = studentSubjectCards.find((card) => matchesText(card.subject, subject));
  if (stored) return stored;
  const tutor = teacherDirectory.find((teacher) => (teacher.subjects || []).some((item) => matchesText(item, subject))) || teacherDirectory[0];
  return {
    subject,
    tutorId: tutor.id,
    cadence: "Weekly",
    nextGoal: `Build a focused ${subject} study plan`,
    progress: "Starting",
    streak: "New plan",
  };
};

const calendarItemForSubject = (subject) => {
  const scheduled = upcomingClasses.find((item) => matchesText(item.subject, subject));
  if (scheduled) return scheduled;
  const tutor = teacherDirectory.find((teacher) => (teacher.subjects || []).some((item) => matchesText(item, subject))) || teacherDirectory[0];
  return {
    ...upcomingClasses[0],
    id: `subject-${subject}`,
    subject,
    tutorId: tutor.id,
    focus: `${subject} learning-plan consultation`,
  };
};

const nextUpcomingClass = () => upcomingClasses[0] || null;

const googleCalendarUrlFor = (item) => {
  const tutor = getTeacherById(item?.tutorId);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${item?.subject || "Lesson"} lesson with ${tutor?.name || "IC Educate tutor"}`,
    dates: `${item?.startUtc || ""}/${item?.endUtc || ""}`,
    details: item?.focus || "IC Educate lesson",
    location: item?.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const calendarActionsMarkup = (item) => `
  <div class="calendar-actions" aria-label="Add ${escapeHtml(item?.subject || "lesson")} to calendar">
    <button
      type="button"
      class="icon-action-btn calendar-icon-btn"
      data-add-calendar="${escapeHtml(item?.id || "")}"
      aria-label="Add ${escapeHtml(item?.subject || "lesson")} to Google Calendar"
      title="Add to Google Calendar"
    >
      <svg class="icon" aria-hidden="true"><use href="#icon-calendar-plus"></use></svg>
    </button>
  </div>
`;

const addCalendarEvent = async (item) => {
  if (!item) return;
  const calendarUrl = googleCalendarUrlFor(item);
  const popup = window.open(calendarUrl, "_blank", "noopener,noreferrer");
  if (!popup) {
    window.location.assign(calendarUrl);
  }
};

const syncStudentLearningEditor = () => {
  const profile = readStudentProfile();
  if (studentNameInput) studentNameInput.value = profile.name || "";
  if (profileRoleInput) profileRoleInput.value = profile.accountRole || "student";
  if (studentLevelInput) studentLevelInput.value = profile.level;
  pendingStudentPhotoDataUrl = profile.photoDataUrl || "";
  applyStudentPhotoPreview(pendingStudentPhotoDataUrl, profile.name || "Student");
  if (studentPhotoRemoveBtn) studentPhotoRemoveBtn.disabled = !pendingStudentPhotoDataUrl;
  document.querySelectorAll('input[name="studentSubject"]').forEach((input) => {
    input.checked = profile.subjects.includes(input.value);
  });
};

const renderStudentProfile = () => {
  if (!studentProfilePanelEl) return;
  const profile = readStudentProfile();
  const signedIn = marketplaceIsSignedIn();
  if (studentProfileEditBtn) studentProfileEditBtn.hidden = !signedIn;
  if (!signedIn) {
    if (studentLearningEditor) studentLearningEditor.hidden = true;
    studentProfilePanelEl.innerHTML = lockedMarketplaceCardMarkup({
      title: "Your profile details stay private until you sign in.",
      hint: "Photo uploads, study subjects, and upcoming lessons only appear after account sign-in.",
      returnTo: "student-profile",
    });
    return;
  }

  const learningCards = profile.subjects.map(subjectCardFor);
  const matchingClasses = profile.subjects
    .map(calendarItemForSubject)
    .filter((item, index, list) => item && list.findIndex((entry) => entry.id === item.id) === index);
  const nextClass = matchingClasses[0] || nextUpcomingClass();
  const activeTutors = new Set(learningCards.map((card) => card.tutorId).filter(Boolean));
  const completedCount = Math.max(1, Math.min(3, profile.subjects.length - 1 || 1));
  const resourceCount = Math.max(4, profile.subjects.length * 2 + 2);
  studentProfilePanelEl.innerHTML = `
    <div class="student-profile-layout">
      <article class="profile-hero-card student-profile-header-card">
        <div class="student-profile-head">
          ${studentProfileAvatarMarkup(profile, "profile-hero-avatar student-profile-photo")}
          <div class="student-profile-identity">
            <div class="result-links">
              <span class="tag">${escapeHtml(profile.level)}</span>
              <span class="chip">${profile.accountRole === "teacher" ? "Teacher" : "Student"}</span>
            </div>
            <div class="student-profile-title-row">
              <div>
                <h3>${escapeHtml(profile.name)}</h3>
                <p class="hint">Keep your account photo, study subjects, and next lessons synced in one place.</p>
              </div>
              <div class="student-profile-hero-actions">
                <button type="button" class="secondary-btn" data-edit-learning="true">Update profile</button>
                <button type="button" class="secondary-btn" data-screen-target="upcoming">Upcoming</button>
              </div>
            </div>
            <div class="student-profile-stats" aria-label="Student activity">
              <div><strong>${escapeHtml(String(activeTutors.size || 1))}</strong><span>Active tutors</span></div>
              <div><strong>${escapeHtml(String(matchingClasses.length || 1))}</strong><span>Upcoming</span></div>
              <div><strong>${escapeHtml(String(completedCount))}</strong><span>Done this week</span></div>
              <div><strong>${escapeHtml(String(resourceCount))}</strong><span>Resources</span></div>
            </div>
          </div>
        </div>
        <div class="student-subject-chips">
          ${profile.subjects.map((subject) => subjectPillMarkup(subject)).join("")}
        </div>
      </article>

      <article class="profile-fit-card student-learning-stack">
        <div class="panel-heading">
          <div>
            <span class="tag">Subjects taken</span>
            <h3>Current learning stack</h3>
          </div>
          <button type="button" class="secondary-btn" data-screen-target="upcoming">All classes</button>
        </div>
        <div class="requests-grid">
          ${learningCards
            .map((card) => {
              const tutor = getTeacherById(card.tutorId);
              const calendarItem = calendarItemForSubject(card.subject);
              return `
                <article class="request-card learning-card">
                  <div class="request-card-head">
                    <div class="learning-card-title-block">
                      <span class="tag">${escapeHtml(card.progress)}</span>
                      <h3>${escapeHtml(card.subject)}</h3>
                    </div>
                    <div class="request-card-head-actions">
                      <span class="chip">${escapeHtml(card.cadence)}</span>
                      ${calendarActionsMarkup(calendarItem)}
                    </div>
                  </div>
                  <div class="result-links">
                    ${subjectPillMarkup(card.subject)}
                    <span class="chip">${escapeHtml(calendarItem.day)} ${escapeHtml(calendarItem.time)}</span>
                  </div>
                  <div class="learning-tutor-row">
                    ${tutorAvatarMarkup(tutor, "learning-tutor-avatar")}
                    <div><strong>${escapeHtml(tutor?.name || "Tutor assigned")}</strong><span>${escapeHtml(card.streak)}</span></div>
                  </div>
                  <p class="hint">${escapeHtml(card.nextGoal)}</p>
                  <div class="next-class-row"><span>Next class</span><strong>${escapeHtml(calendarItem.day)} ${escapeHtml(calendarItem.time)}</strong></div>
                  <div class="request-card-actions">
                    <button type="button" class="secondary-btn" data-view-profile="${escapeHtml(card.tutorId)}">Tutor details</button>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </article>

      <article class="profile-side-card student-upcoming-glance">
        <div class="panel-heading">
          <div>
            <span class="tag">Next class</span>
            <h3>${escapeHtml(nextClass?.subject || "Upcoming lesson")}</h3>
          </div>
          ${nextClass ? calendarActionsMarkup(nextClass) : ""}
        </div>
        <p class="hint">${escapeHtml(nextClass?.focus || "Lock the next checkpoint and keep the tutor relationship moving.")}</p>
        <div class="result-links">
          <span class="chip">${escapeHtml(nextClass?.day || "TBA")}</span>
          <span class="chip">${escapeHtml(nextClass?.time || "Choose a slot")}</span>
          <span class="chip">${escapeHtml(nextClass?.location || "Online")}</span>
        </div>
        <button type="button" class="secondary-btn" data-screen-target="upcoming">Open schedule</button>
      </article>

      <article class="profile-side-card student-focus-card">
        <span class="tag">Next focus</span>
        <ul class="profile-fit-list">
          ${learningCards.slice(0, 3).map((card) => `<li>${escapeHtml(card.nextGoal)}</li>`).join("")}
        </ul>
      </article>
    </div>
  `;
};

const renderRecommended = () => {
  if (!recommendedPanelEl) return;
  const profile = readStudentProfile();
  const matchingTeachers = teacherDirectory.filter((teacher) =>
    profile.subjects.some((subject) => (teacher.subjects || []).some((item) => matchesText(item, subject)))
  );
  const matchingClasses = profile.subjects.map(calendarItemForSubject).filter((item, index, list) => item && list.findIndex((entry) => entry.id === item.id) === index);
  recommendedPanelEl.innerHTML = `
    <div class="recommended-grid">
      <section class="screen-panel recommended-section">
        <div class="panel-heading"><div><span class="tag">Teachers</span><h3>Best fits for ${escapeHtml(profile.level)}</h3></div></div>
        <div class="recommended-teacher-list">
          ${matchingTeachers.slice(0, 4).map((teacher) => `
            <article class="recommended-teacher-card">
              ${tutorAvatarMarkup(teacher, "result-card-avatar")}
              <div><h3>${escapeHtml(teacher.name)}</h3><p>${escapeHtml(teacher.subjects.slice(0, 2).join(" · "))}</p><strong>${escapeHtml(teacher.onlineFee)}</strong></div>
              <button type="button" class="secondary-btn" data-view-profile="${escapeHtml(teacher.id)}">View</button>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="screen-panel recommended-section">
        <div class="panel-heading"><div><span class="tag">Classes</span><h3>Suggested next sessions</h3></div></div>
        <div class="recommended-class-list">
          ${matchingClasses.map((item) => `
            <article class="recommended-class-card">
              <div><span class="tag">${escapeHtml(item.dateLabel)}</span><h3>${escapeHtml(item.subject)} · ${escapeHtml(item.time)}</h3><p>${escapeHtml(item.focus)}</p></div>
              ${calendarActionsMarkup(item)}
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
};

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const resourceFileType = (name = "") => {
  const extension = name.split(".").pop()?.toUpperCase() || "FILE";
  return extension.length <= 5 ? extension : "FILE";
};

const renderResourceFiles = () => {
  if (!resourceFileListEl) return;
  const query = resourceSearchInput?.value.trim().toLowerCase() || "";
  const filtered = resourceFiles.filter((file) => !query || (file.webkitRelativePath || file.name).toLowerCase().includes(query));
  if (!resourceFiles.length) return;
  if (!filtered.length) {
    resourceFileListEl.innerHTML = `<article class="resource-empty-state"><h3>No files match “${escapeHtml(resourceSearchInput?.value.trim() || "")}”.</h3><p>Try a subject, year, level, or file type.</p></article>`;
    return;
  }
  resourceFileListEl.innerHTML = filtered
    .slice(0, 300)
    .map((file) => {
      const index = resourceFiles.indexOf(file);
      const path = file.webkitRelativePath || file.name;
      const folder = path.includes("/") ? path.split("/").slice(1, -1).join(" / ") : "StudioPrime";
      return `
        <article class="resource-file-card">
          <span class="resource-file-type">${escapeHtml(resourceFileType(file.name))}</span>
          <div class="resource-file-copy">
            <h3>${escapeHtml(file.name)}</h3>
            <p>${escapeHtml(folder || "StudioPrime")} · ${escapeHtml(formatFileSize(file.size))}</p>
          </div>
          <div class="resource-file-actions">
            <button type="button" class="secondary-btn" data-resource-open="${index}">Open</button>
            <button type="button" class="secondary-btn" data-resource-download="${index}">Download</button>
          </div>
        </article>
      `;
    })
    .join("");
};

const useResourceFile = (index, shouldDownload = false) => {
  const file = resourceFiles[Number(index)];
  if (!file) return;
  const url = URL.createObjectURL(file);
  if (shouldDownload) {
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const renderUpcomingClasses = () => {
  if (!upcomingClassesPanelEl) return;
  const signedIn = marketplaceIsSignedIn();
  if (upcomingGuestUtilitiesEl) upcomingGuestUtilitiesEl.hidden = signedIn;
  if (upcomingCalendarBtn) {
    const nextClass = nextUpcomingClass();
    upcomingCalendarBtn.hidden = !signedIn || !nextClass;
    if (nextClass) upcomingCalendarBtn.dataset.addCalendar = nextClass.id;
  }
  if (!signedIn) {
    upcomingClassesPanelEl.innerHTML = lockedMarketplaceCardMarkup({
      title: "Upcoming classes only appear after sign-in.",
      hint: "Once you sign in, this screen becomes your weekly schedule with fast Google Calendar handoff.",
      returnTo: "upcoming",
    });
    return;
  }
  upcomingClassesPanelEl.innerHTML = upcomingClasses
    .map((item) => {
      const tutor = getTeacherById(item.tutorId);
      return `
        <article class="request-card upcoming-card">
          <div class="request-card-head">
            <div>
              <span class="tag">${escapeHtml(item.dateLabel)}</span>
              <h3>${escapeHtml(item.subject)} · ${escapeHtml(item.time)}</h3>
            </div>
            <div class="request-card-head-actions">
              <span class="chip">${escapeHtml(lessonModeLabel(item.mode))}</span>
              ${calendarActionsMarkup(item)}
            </div>
          </div>
          <div class="result-links">
            ${subjectPillMarkup(item.subject)}
            <span class="chip">${escapeHtml(item.day)}</span>
            <span class="chip">${escapeHtml(tutor?.name || "Tutor")}</span>
            <span class="chip">${escapeHtml(item.location)}</span>
          </div>
          <p class="hint">${escapeHtml(item.focus)}</p>
          <div class="learning-tutor-row upcoming-tutor-row">
            ${tutorAvatarMarkup(tutor, "learning-tutor-avatar")}
            <div><strong>${escapeHtml(tutor?.name || "Tutor assigned")}</strong><span>${escapeHtml(item.time)} · ${escapeHtml(item.location)}</span></div>
          </div>
          <div class="request-card-actions">
            <button type="button" class="secondary-btn" data-view-profile="${escapeHtml(item.tutorId)}">Tutor details</button>
          </div>
        </article>
      `;
    })
    .join("");
};

const syncBookingDefaults = (teacher, request) => {
  if (!teacher) return;
  const tutorChanged = Boolean(bookingState.tutorId && bookingState.tutorId !== teacher.id);
  if (tutorChanged) {
    bookingState.day = "";
    bookingState.slot = "";
    bookingState.venue = "";
    bookingState.isExplicit = false;
    bookingState.mode = normalizeLessonMode(request?.mode || teacher.mode?.[0] || "online");
  }
  bookingState.tutorId = teacher.id;
  if (!bookingState.mode) bookingState.mode = normalizeLessonMode(request?.mode || teacher.mode?.[0] || "online");
  if (bookLessonModeInput) {
    bookLessonModeInput.value = bookingState.mode;
  }

  const weeklyAvailability = profileDetailsFor(teacher).weeklyAvailability || {};
  const availableDays = dayOrder.filter((day) => (weeklyAvailability[day] || []).length);
  if (!availableDays.length) {
    bookingState.day = "";
    bookingState.slot = "";
    return;
  }
  if (!availableDays.includes(bookingState.day)) {
    bookingState.day = availableDays[0];
  }
  const slots = weeklyAvailability[bookingState.day] || [];
  if (!slots.includes(bookingState.slot)) {
    bookingState.slot = slots[0] || "";
  }
};

const renderBookingPanel = (request, teacher) => {
  if (!bookingTutorCardEl || !bookingDayPickerEl || !bookingSlotGridEl || !bookingSummaryEl) return;
  if (!teacher) {
    bookingTutorCardEl.innerHTML = `
      <span class="tag">Tutor booking</span>
      <h3>Select a tutor first.</h3>
      <p class="hint">Open a tutor profile or choose a card from the results screen to continue.</p>
    `;
    bookingDayPickerEl.innerHTML = "";
    bookingSlotGridEl.innerHTML = "";
    bookingSummaryEl.innerHTML = `
      <span class="tag">Booking summary</span>
      <h3>No slot selected yet.</h3>
      <p class="hint">The saved slot, venue, and tutor will appear here.</p>
    `;
    return;
  }

  syncBookingDefaults(teacher, request);
  const details = profileDetailsFor(teacher);
  const weeklyAvailability = details.weeklyAvailability || {};
  const priceLabel = feeLabelForTeacher(teacher, bookingState.mode || request?.mode);
  const availableDays = dayOrder.filter((day) => (weeklyAvailability[day] || []).length);
  const activeSlots = weeklyAvailability[bookingState.day] || [];

  bookingTutorCardEl.innerHTML = `
    <span class="tag">Selected tutor</span>
    <div class="booking-tutor-head">
      ${tutorAvatarMarkup(teacher, "result-card-avatar")}
      <div>
        <h3>${escapeHtml(teacher.name)}</h3>
        <p class="result-card-subtitle">${escapeHtml(teacher.syllabus)} · ${escapeHtml(teacher.level)}</p>
        <p class="hint">${escapeHtml(details.credentials)}</p>
      </div>
    </div>
    <div class="result-links">
      <span class="chip">${escapeHtml(teacherRatingLabel(teacher))}</span>
      <span class="chip">${escapeHtml(priceLabel)}</span>
      <span class="chip">${escapeHtml(teacher.location)}</span>
    </div>
    <div class="booking-progress-strip">
      <span class="chip">${escapeHtml((teacher.mode || []).map((item) => lessonModeLabel(item)).join(" / "))}</span>
      <span class="chip">Replies ${escapeHtml(teacher.responseTime)}</span>
      <span class="chip">${escapeHtml(details.bestFor[0])}</span>
    </div>
  `;

  bookingDayPickerEl.innerHTML = availableDays
    .map(
      (day) => `
        <button type="button" class="booking-day-btn ${day === bookingState.day ? "active" : ""}" data-book-day="${escapeHtml(day)}">
          ${escapeHtml(day)}
        </button>
      `
    )
    .join("");

  bookingSlotGridEl.innerHTML = activeSlots.length
    ? activeSlots
        .map(
          (slot) => `
            <button type="button" class="booking-slot-btn ${slot === bookingState.slot ? "active" : ""}" data-book-slot="${escapeHtml(slot)}">
              ${escapeHtml(slot)}
            </button>
          `
        )
        .join("")
    : `<span class="hint">No open slots on this day.</span>`;

  if (bookingVenueInput && bookingVenueInput.value !== bookingState.venue) {
    bookingVenueInput.value = bookingState.venue || "";
  }

  bookingSummaryEl.innerHTML = `
    <span class="tag">Booking summary</span>
    <h3>${escapeHtml(teacher.name)} · ${escapeHtml(bookingState.day || "Choose day")} · ${escapeHtml(bookingState.slot || "Choose slot")}</h3>
    <div class="result-links">
      <span class="chip">${escapeHtml(lessonModeLabel(bookingState.mode || request?.mode || "online"))}</span>
      <span class="chip">${escapeHtml(bookingState.venue || teacher.location || "Add venue or link")}</span>
    </div>
    <div class="result-stat-grid booking-summary-stats">
      <div>
        <span>Subject</span>
        <strong>${escapeHtml(request?.subject || "Pending")}</strong>
      </div>
      <div>
        <span>Level</span>
        <strong>${escapeHtml(request?.level || "Pending")}</strong>
      </div>
      <div>
        <span>Preferred time</span>
        <strong>${escapeHtml(request?.preferredTime || "Any")}</strong>
      </div>
    </div>
    <p class="hint">${escapeHtml(details.reviewQuote)}</p>
  `;
};

const renderSavedRequests = () => {
  if (!savedRequestsListEl) return;
  const stored = readStoredTutorRequests();
  if (!stored.length) {
    savedRequestsListEl.innerHTML = `
      <article class="request-card empty">
        <span class="tag">No saved requests</span>
        <h3>Create your first tutor request.</h3>
        <p class="hint">Saved requests appear here with the selected tutor, current status, and booking progress.</p>
      </article>
    `;
    return;
  }

  savedRequestsListEl.innerHTML = stored
    .map((request) => {
      const tutor = getTeacherById(request.selectedTutorId) || teacherDirectory.find((teacher) => teacher.name === request.selectedTutorName) || null;
      const statusLabel = request.bookingSlot ? "Booked" : request.selectedTutorId ? "Matched" : "New";
      return `
        <article class="request-card">
          <div class="request-card-head">
            <div>
              <span class="tag">${escapeHtml(statusLabel)}</span>
              <h3>${escapeHtml(request.subject || "Tutor request")} · ${escapeHtml(request.level || "Level")}</h3>
            </div>
            <span class="chip">${escapeHtml(request.area || "Area pending")}</span>
          </div>
          <div class="result-links">
            <span class="chip">${escapeHtml(lessonModeLabel(request.mode || "online"))}</span>
            <span class="chip">${escapeHtml(request.preferredTime || "Any time")}</span>
            ${tutor ? `<span class="chip">${escapeHtml(tutor.name)}</span>` : ""}
          </div>
          <p class="hint">${escapeHtml(request.note || "No extra notes added.")}</p>
          <div class="request-card-actions">
            <button type="button" class="secondary-btn" data-load-request="${escapeHtml(request.id)}">Open request</button>
            ${tutor ? `<button type="button" class="secondary-btn" data-view-profile="${escapeHtml(tutor.id)}">Tutor profile</button>` : ""}
            <button type="button" class="secondary-btn" data-copy-request="${escapeHtml(request.id)}">Copy brief</button>
          </div>
        </article>
      `;
    })
    .join("");
};

const normalizeAdminStatus = (status = "") => {
  const text = normalizeText(status);
  if (text === "booked" || text === "closed") return "closed";
  if (text === "matched") return "matched";
  if (text === "contacted") return "contacted";
  return "new";
};

const renderAdminQueue = () => {
  if (!adminQueueBoardEl) return;
  const allLeads = readStoredMarketplaceLeads();
  const grouped = {
    new: [],
    contacted: [],
    matched: [],
    closed: [],
  };

  allLeads.forEach((lead) => {
    grouped[normalizeAdminStatus(lead.status)].push(lead);
  });

  if (adminNewCountEl) adminNewCountEl.textContent = String(grouped.new.length);
  if (adminContactedCountEl) adminContactedCountEl.textContent = String(grouped.contacted.length);
  if (adminMatchedCountEl) adminMatchedCountEl.textContent = String(grouped.matched.length);
  if (adminClosedCountEl) adminClosedCountEl.textContent = String(grouped.closed.length);

  adminQueueBoardEl.innerHTML = ["new", "contacted", "matched", "closed"]
    .map((status) => {
      const leads = grouped[status];
      return `
        <section class="admin-lane">
          <div class="admin-lane-head">
            <div>
              <span class="tag">${escapeHtml(status)}</span>
              <h3>${escapeHtml(status.charAt(0).toUpperCase() + status.slice(1))}</h3>
            </div>
            <span class="chip">${escapeHtml(String(leads.length))}</span>
          </div>
          <div class="admin-lane-stack">
            ${
              leads.length
                ? leads
                    .map(
                      (lead) => `
                        <article class="admin-lead-card">
                          <strong>${escapeHtml(lead.name || "Lead")}</strong>
                          <p>${escapeHtml([lead.subject, lead.level, lead.area].filter(Boolean).join(" · ") || "Tutor request")}</p>
                          <div class="result-links">
                            <span class="chip">${escapeHtml(lessonModeLabel(lead.mode || "online"))}</span>
                            <span class="chip">${escapeHtml(lead.preferredTime || lead.schedule || "Any time")}</span>
                          </div>
                          <p class="hint">${escapeHtml(lead.note || "No extra notes added.")}</p>
                        </article>
                      `
                    )
                    .join("")
                : `<article class="admin-lead-card empty"><p class="hint">No leads here yet.</p></article>`
            }
          </div>
        </section>
      `;
    })
    .join("");
};

const applySelectedTutorToOutboundLinks = (request, teacher) => {
  if (!request || !teacher) {
    if (copyTutorBriefBtn) copyTutorBriefBtn.hidden = true;
    if (tutorWhatsappLink) tutorWhatsappLink.href = `https://wa.me/${routePhoneForMarket("malaysia")}`;
    return;
  }

  const booking = {
    day: bookingState.day || request.bookingDay || "",
    slot: bookingState.slot || request.bookingSlot || "",
    mode: bookingState.mode || request.bookingMode || "",
    venue: bookingState.venue || request.bookingVenue || "",
  };
  const brief = buildTutorBrief(request, teacher, booking);
  if (copyTutorBriefBtn) {
    copyTutorBriefBtn.hidden = false;
    copyTutorBriefBtn.dataset.brief = brief;
  }
  if (tutorWhatsappLink) {
    tutorWhatsappLink.href = `https://wa.me/${routePhoneForMarket(request.market)}?text=${encodeURIComponent(buildWhatsAppMessage(request, teacher, booking))}`;
  }
};

const refreshApp = () => {
  const request = currentRequest();
  const hasRequest = shouldPreviewRequest(request);
  const rankedTeachers = hasRequest ? rankTeachers(request) : [];

  if (rankedTeachers.length) {
    if (!selectedTutorId || !rankedTeachers.some((entry) => entry.teacher.id === selectedTutorId)) {
      selectedTutorId = rankedTeachers[0]?.teacher?.id || "";
    }
    if (!activeProfileTutorId || !rankedTeachers.some((entry) => entry.teacher.id === activeProfileTutorId)) {
      activeProfileTutorId = selectedTutorId;
    }
  }

  const selectedTutor = hasRequest ? getSelectedTeacher(request, rankedTeachers) : teacherDirectory[0];
  const activeTeacher = hasRequest ? getActiveProfileTeacher(request, rankedTeachers) : getTeacherById(activeProfileTutorId) || teacherDirectory[0];
  const activeEntry = hasRequest ? getActiveProfileEntry(request, rankedTeachers) : null;

  renderSummary(hasRequest ? request : null, selectedTutor, rankedTeachers);
  renderRailTopTutor(hasRequest ? request : null, activeTeacher, activeEntry);
  renderSearchTopMatch(hasRequest ? request : null, rankedTeachers);
  renderResultsRequestChips(hasRequest ? request : null);
  renderDiscoverSubjectRail();
  renderDiscoverFeaturedTutors(hasRequest ? request : null, rankedTeachers);
  renderCommunityTeacherProfiles();
  renderDiscoverFeed();
  renderTeacherPromoFeed();
  renderNetworkLists();
  renderResults(hasRequest ? request : null, rankedTeachers);
  renderMarketplaceAccount();
  renderStudentProfile();
  renderRecommended();
  renderTeachBoard();
  renderInbox();
  renderTutorProfile(hasRequest ? request : null, activeTeacher, activeEntry);
  renderBookingPanel(hasRequest ? request : null, activeTeacher);
  renderSavedRequests();
  renderUpcomingClasses();
  renderAdminQueue();
  applySelectedTutorToOutboundLinks(hasRequest ? request : null, selectedTutor);
  if (resultsFilterPanelEl) {
    resultsFilterPanelEl.hidden = !resultsFilterOpen;
  }
};

const detectNearestLocation = () => {
  if (!navigator.geolocation) {
    setLocationStatus("Location detection is not available in this browser. You can type your area manually.");
    return;
  }

  if (detectLocationBtn) detectLocationBtn.disabled = true;
  if (findDetectLocationBtn) findDetectLocationBtn.disabled = true;
  setLocationStatus("Checking your nearest supported area...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const nearest = nearestSupportedArea({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      if (detectLocationBtn) detectLocationBtn.disabled = false;
      if (findDetectLocationBtn) findDetectLocationBtn.disabled = false;

      if (!nearest) {
        setLocationStatus("We could not map your location to one of the supported areas. Add it manually.");
        return;
      }

      tutorAreaInput.value = nearest.label;
      if (homeAreaInput) homeAreaInput.value = nearest.label;
      setLocationStatus(`Using ${nearest.label} to improve tutor ranking.`);
      setHomeStartStatus(`Using ${nearest.label}. Add subject and level to see nearby tutors.`);
      refreshApp();
    },
    () => {
      if (detectLocationBtn) detectLocationBtn.disabled = false;
      if (findDetectLocationBtn) findDetectLocationBtn.disabled = false;
      setLocationStatus("Location access was blocked, so manual area entry is still the fallback.");
    },
    {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 600000,
    }
  );
};

const handleSubmit = async (event) => {
  event.preventDefault();
  if (!currentRequestId) currentRequestId = `tutor-${Date.now()}`;
  const request = currentRequest();
  if (!request.studentName || !request.subject || !request.level) {
    setRequestStatus("Add your name, subject, and level so we can match the right tutors.");
    activateScreen("search");
    return;
  }

  const ranked = rankTeachers(request);
  const selectedTutor = ranked[0]?.teacher || null;
  selectedTutorId = selectedTutor?.id || "";
  activeProfileTutorId = selectedTutorId;
  const payload = buildRequestPayload({
    id: currentRequestId,
    remoteId: request.remoteId,
    editToken: request.editToken,
    createdAt: request.createdAt,
    selectedTutorId: selectedTutor?.id || "",
    selectedTutorName: selectedTutor?.name || "",
    status: "matched",
  });
  const backendResult = await saveTutorRequest(payload);
  setRequestStatus(
    backendResult.synced
      ? "Request synced. Your tutor shortlist is ready."
      : "Request saved on this device. Your tutor shortlist is ready."
  );
  refreshApp();
  activateScreen("results");
};

const applySample = () => {
  fillForm(sampleRequest);
  currentRequestId = `tutor-${Date.now()}`;
  currentRequestRemoteId = "";
  currentRequestEditToken = createPrivateToken();
  selectedTutorId = "maya-lim";
  activeProfileTutorId = "maya-lim";
  bookingState = {
    tutorId: "maya-lim",
    day: "Sat",
    slot: "10:00 am",
    venue: "",
    mode: "physical",
    isExplicit: true,
  };
  setRequestStatus("Sample details loaded. Edit them to match your own request.");
  refreshApp();
  activateScreen("search");
};

const clearForm = () => {
  tutorRequestForm.reset();
  currentRequestId = "";
  currentRequestRemoteId = "";
  currentRequestEditToken = "";
  selectedTutorId = teacherDirectory[0]?.id || "";
  activeProfileTutorId = teacherDirectory[0]?.id || "";
  bookingState = {
    tutorId: selectedTutorId,
    day: "",
    slot: "",
    venue: "",
    mode: "online",
    isExplicit: false,
  };
  syncModeButtons(tutorModeInput.value);
  if (homeSubjectInput) homeSubjectInput.value = "";
  if (homeSyllabusInput) homeSyllabusInput.value = "";
  if (homeLevelInput) homeLevelInput.value = "";
  if (homeAreaInput) homeAreaInput.value = "";
  syncHomeModeButtons("online");
  setHomeStartStatus("Pick a subject and level to open the first shortlist.");
  setLocationStatus(DEFAULT_LOCATION_HINT);
  setRequestStatus("Form cleared. Add your details to see tutor matches.");
  refreshApp();
  activateScreen("results");
};

const loadExistingRequest = () => readStoredTutorRequests()[0] || null;

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
  return {
    screen: params.get("screen") || "",
    tutor: params.get("tutor") || "",
    demo: params.get("demo") === "1",
  };
};

const loadRequestIntoForm = (request) => {
  fillForm(request);
  currentRequestId = request.id || "";
  currentRequestRemoteId = request.remoteId || "";
  currentRequestEditToken = request.editToken || createPrivateToken();
  selectedTutorId = request.selectedTutorId || teacherDirectory.find((teacher) => teacher.name === request.selectedTutorName)?.id || teacherDirectory[0]?.id || "";
  activeProfileTutorId = selectedTutorId;
  bookingState = {
    tutorId: selectedTutorId,
    day: request.bookingDay || "",
    slot: request.bookingSlot || "",
    venue: request.bookingVenue || "",
    mode: normalizeLessonMode(request.bookingMode || request.mode || "online"),
    isExplicit: Boolean(request.bookingDay || request.bookingSlot || request.bookingVenue || request.bookingMode),
  };
  if (bookingVenueInput) bookingVenueInput.value = bookingState.venue || "";
  refreshApp();
};

const saveBookingToRequest = async () => {
  const teacher = getTeacherById(activeProfileTutorId);
  const request = currentRequest();
  if (!shouldPreviewRequest(request)) {
    if (bookingStatusEl) bookingStatusEl.textContent = "Save a tutor request first so we know who this booking is for.";
    activateScreen("search");
    return;
  }
  if (!teacher) {
    if (bookingStatusEl) bookingStatusEl.textContent = "Select a tutor first.";
    activateScreen("results");
    return;
  }
  if (!bookingState.day || !bookingState.slot) {
    if (bookingStatusEl) bookingStatusEl.textContent = "Choose a day and slot first.";
    return;
  }

  bookingState.venue = bookingVenueInput?.value.trim() || "";
  bookingState.isExplicit = true;
  const payload = {
    ...request,
    id: currentRequestId || `tutor-${Date.now()}`,
    selectedTutorId: teacher.id,
    selectedTutorName: teacher.name,
    bookingDay: bookingState.day,
    bookingSlot: bookingState.slot,
    bookingMode: bookingState.mode,
    bookingVenue: bookingState.venue,
    status: "booked",
  };
  currentRequestId = payload.id;
  const backendResult = await saveTutorRequest(payload);
  if (bookingStatusEl) {
    bookingStatusEl.textContent = backendResult.synced
      ? "Booking request synced. You can continue in WhatsApp or adjust the slot here."
      : "Booking saved on this device. You can continue in WhatsApp or adjust the slot here.";
  }
  refreshApp();
  activateScreen("book");
};

mergeTeacherProfiles();

let activeResultSort = "match";
let activeDirectoryType = "tutors";
let activeScreen = "discover";
let appHistoryDepth = 0;
let currentRequestId = "";
let currentRequestRemoteId = "";
let currentRequestEditToken = "";
let selectedTutorId = teacherDirectory[0]?.id || "";
let activeProfileTutorId = teacherDirectory[0]?.id || "";
let activeInboxThreadId = demoInboxThreads[0]?.id || "";
let resultsFilterOpen = false;
let resourceFiles = [];
let teacherFilters = {
  minRating: 0,
  lessonMode: "any",
  availability: "",
  budgetCap: 0,
  gender: "any",
};
let bookingState = {
  tutorId: selectedTutorId,
  day: "",
  slot: "",
  venue: "",
  mode: "online",
  isExplicit: false,
};

const urlBootstrap = prefillFromUrl();
syncModeButtons(tutorModeInput.value);
syncHomeStartFromMainForm();
syncResultSortButtons();
setLocationStatus(DEFAULT_LOCATION_HINT);
ensureDemoLeadQueue();
ensureDemoCollection(TEACHER_PROMOS_STORAGE_KEY, demoTeacherPromos);
ensureDemoCollection(MY_TEACHERS_STORAGE_KEY, demoMyTeachers);
ensureDemoCollection(FRIENDS_STORAGE_KEY, demoFriends);

const storedRequest = loadExistingRequest();
const initialScreen = APP_SCREEN_IDS.has(urlBootstrap.screen) ? urlBootstrap.screen : activeScreen;
if (urlBootstrap.demo) {
  applySample();
  if (urlBootstrap.tutor && getTeacherById(urlBootstrap.tutor)) {
    selectedTutorId = urlBootstrap.tutor;
    activeProfileTutorId = urlBootstrap.tutor;
    bookingState.tutorId = urlBootstrap.tutor;
    refreshApp();
  }
} else if (storedRequest) {
  loadRequestIntoForm(storedRequest);
  setRequestStatus("Loaded your latest saved request.");
  if (urlBootstrap.tutor && getTeacherById(urlBootstrap.tutor)) {
    selectedTutorId = urlBootstrap.tutor;
    activeProfileTutorId = urlBootstrap.tutor;
    bookingState.tutorId = urlBootstrap.tutor;
    refreshApp();
  }
} else {
  refreshApp();
}

activateScreen(initialScreen, { replaceHistory: true, scrollBehavior: "auto" });
loadPublishedTeacherProfiles();
initializeMarketplaceBackend();

window.addEventListener("popstate", (event) => {
  const state = event.state;
  if (state?.icEducateScreen && typeof state.depth === "number") {
    appHistoryDepth = Math.max(0, state.depth);
  } else {
    appHistoryDepth = Math.max(0, appHistoryDepth - 1);
  }
  const stateScreen = state?.icEducateScreen ? state.screenId : new URLSearchParams(window.location.search).get("screen");
  activateScreen(stateScreen || "results", { scrollBehavior: "auto", updateHistory: false });
});

tutorRequestForm?.addEventListener("submit", handleSubmit);
tutorSampleBtn?.addEventListener("click", applySample);
tutorResetBtn?.addEventListener("click", clearForm);
detectLocationBtn?.addEventListener("click", detectNearestLocation);
findDetectLocationBtn?.addEventListener("click", detectNearestLocation);
tutorDirectorySearchBtn?.addEventListener("click", refreshApp);
tutorDirectorySearchInput?.addEventListener("search", refreshApp);
tutorDirectorySearchInput?.addEventListener("input", refreshApp);
resourceSearchInput?.addEventListener("input", renderResourceFiles);
studioPrimeFolderInput?.addEventListener("change", () => {
  const supportedExtensions = /\.(pdf|docx?|pptx?|xlsx?|txt|md|html?|png|jpe?g|webp|zip)$/i;
  resourceFiles = Array.from(studioPrimeFolderInput.files || [])
    .filter((file) => supportedExtensions.test(file.name))
    .filter((file) => !/(^|\/)(node_modules|\.git|dist|build)(\/|$)/i.test(file.webkitRelativePath || ""));
  if (resourceSearchInput) {
    resourceSearchInput.disabled = !resourceFiles.length;
    resourceSearchInput.value = "";
  }
  const firstPath = studioPrimeFolderInput.files?.[0]?.webkitRelativePath || "";
  const folderName = firstPath.split("/")[0] || "StudioPrime";
  if (resourceFolderStatusEl) {
    resourceFolderStatusEl.textContent = resourceFiles.length ? `${folderName} · ${resourceFiles.length} files` : "No supported files found";
  }
  renderResourceFiles();
});
studentLearningEditor?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const subjects = Array.from(document.querySelectorAll('input[name="studentSubject"]:checked')).map((input) => input.value);
  const profile = readStudentProfile();
  const nextProfile = {
    ...profile,
    name: studentNameInput?.value.trim() || profile.name,
    accountRole: profileRoleInput?.value || profile.accountRole || "student",
    level: studentLevelInput?.value || profile.level,
    subjects: subjects.length ? subjects : profile.subjects,
    photoDataUrl: pendingStudentPhotoDataUrl || "",
  };
  writeStudentProfile(nextProfile);
  if (marketplaceUserId()) {
    try {
      await saveMarketplaceProfile(nextProfile);
      setMarketplaceAuthMessage("Learning profile synced.");
    } catch (error) {
      setMarketplaceAuthMessage(`Saved on this device; sync failed: ${error.message}`);
    }
  }
  studentLearningEditor.hidden = true;
  refreshApp();
});

studentPhotoInput?.addEventListener("change", async () => {
  const file = studentPhotoInput.files?.[0];
  if (!file) return;
  try {
    pendingStudentPhotoDataUrl = await normalizeStudentPhotoFile(file);
    applyStudentPhotoPreview(pendingStudentPhotoDataUrl, studentNameInput?.value.trim() || readStudentProfile().name);
    if (studentPhotoRemoveBtn) studentPhotoRemoveBtn.disabled = false;
    setMarketplaceAuthMessage("Photo ready to save.");
  } catch (error) {
    pendingStudentPhotoDataUrl = readStudentProfile().photoDataUrl || "";
    applyStudentPhotoPreview(pendingStudentPhotoDataUrl, readStudentProfile().name);
    setMarketplaceAuthMessage(error.message || "We could not process that photo.");
  } finally {
    studentPhotoInput.value = "";
  }
});

studentPhotoRemoveBtn?.addEventListener("click", () => {
  pendingStudentPhotoDataUrl = "";
  applyStudentPhotoPreview("", studentNameInput?.value.trim() || readStudentProfile().name);
  studentPhotoRemoveBtn.disabled = true;
  setMarketplaceAuthMessage("Photo removed. Save the profile to keep this change.");
});

studentNameInput?.addEventListener("input", () => {
  applyStudentPhotoPreview(pendingStudentPhotoDataUrl, studentNameInput.value.trim() || "Student");
});

marketplaceSignOutBtn?.addEventListener("click", async () => {
  await signOutMarketplace();
  renderMarketplaceAccount();
  setMarketplaceAuthMessage("Signed out. Private request contact details were cleared from this device.");
  refreshApp();
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("#marketplaceMessageForm");
  if (!form) return;
  event.preventDefault();
  const input = form.elements.message;
  const text = input?.value.trim() || "";
  if (!text) return;
  const requestId = form.dataset.requestId || "";
  const request = readStoredTutorRequests().find((item) => item.id === requestId);
  const message = {
    id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    requestId,
    remoteRequestId: form.dataset.remoteRequestId || request?.remoteId || "",
    from: "Student",
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    createdAt: new Date().toISOString(),
  };
  const messages = readJson(MARKETPLACE_MESSAGES_STORAGE_KEY, []);
  writeJson(MARKETPLACE_MESSAGES_STORAGE_KEY, [...messages, message].slice(-300));
  if (input) input.value = "";
  renderInbox();
  if (marketplaceUserId() && message.remoteRequestId) {
    try {
      await syncMarketplaceMessageBackend(message);
      const syncedMessages = readJson(MARKETPLACE_MESSAGES_STORAGE_KEY, []).map((item) =>
        item.id === message.id ? { ...item, remoteSubmitted: true } : item
      );
      writeJson(MARKETPLACE_MESSAGES_STORAGE_KEY, syncedMessages);
      setMarketplaceAuthMessage("Message synced.");
    } catch (error) {
      setMarketplaceAuthMessage(`Message saved on this device; sync failed: ${error.message}`);
    }
  } else if (!marketplaceUserId()) {
    setMarketplaceAuthMessage("Message saved on this device. Sign in to send it to the shared inbox.");
  }
});
copyTutorBriefBtn?.addEventListener("click", async () => {
  const brief = copyTutorBriefBtn.dataset.brief || "";
  await copyText(brief);
  const previous = copyTutorBriefBtn.textContent;
  copyTutorBriefBtn.textContent = "Copied";
  window.setTimeout(() => {
    copyTutorBriefBtn.textContent = previous;
  }, 1200);
});
bookingConfirmBtn?.addEventListener("click", saveBookingToRequest);
bookLessonModeInput?.addEventListener("change", () => {
  bookingState.mode = normalizeLessonMode(bookLessonModeInput.value);
  bookingState.isExplicit = true;
  refreshApp();
});
bookingVenueInput?.addEventListener("input", () => {
  bookingState.venue = bookingVenueInput.value.trim();
  bookingState.isExplicit = true;
  refreshApp();
});

teacherPromoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const teacherName = promoTeacherNameInput?.value.trim() || "";
  const subject = promoSubjectInput?.value.trim() || "";
  const headline = promoHeadlineInput?.value.trim() || "";
  const caption = promoCaptionInput?.value.trim() || "";
  const file = promoMediaInput?.files?.[0] || null;

  if (!teacherName || !headline) return;

  let mediaUrl = "./assets/gradequest-role-teacher.png";
  let mediaType = "image";
  if (file) {
    mediaUrl = URL.createObjectURL(file);
    mediaType = file.type.startsWith("video/") ? "video" : "image";
  }

  saveTeacherPromo({
    id: `promo-${Date.now()}`,
    teacherName,
    subject,
    headline,
    caption,
    mediaType,
    mediaUrl,
    market: inferMarket(currentRequest().area || subject),
    coverPosition: "center center",
  });

  teacherPromoForm.reset();
  refreshApp();
});

myTeacherForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = myTeacherNameInput?.value.trim() || "";
  const focus = myTeacherFocusInput?.value.trim() || "";
  const area = myTeacherAreaInput?.value.trim() || "";
  if (!name || !focus) return;
  saveMyTeacher({
    id: `teacher-${Date.now()}`,
    name,
    focus,
    area: area || "Online",
  });
  myTeacherForm.reset();
  refreshApp();
});

friendsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = friendNameInput?.value.trim() || "";
  const focus = friendFocusInput?.value.trim() || "";
  const note = friendNoteInput?.value.trim() || "";
  if (!name || !focus) return;
  saveFriend({
    id: `friend-${Date.now()}`,
    name,
    focus,
    note: note || "Referral contact",
  });
  friendsForm.reset();
  refreshApp();
});

filterMinRatingInput?.addEventListener("change", () => {
  teacherFilters.minRating = Number(filterMinRatingInput.value || 0);
  refreshApp();
});
filterLessonModeInput?.addEventListener("change", () => {
  teacherFilters.lessonMode = filterLessonModeInput.value || "any";
  refreshApp();
});
filterAvailabilityInput?.addEventListener("change", () => {
  teacherFilters.availability = filterAvailabilityInput.value || "";
  refreshApp();
});
filterBudgetCapInput?.addEventListener("change", () => {
  teacherFilters.budgetCap = Number(filterBudgetCapInput.value || 0);
  refreshApp();
});
filterTutorGenderInput?.addEventListener("change", () => {
  teacherFilters.gender = filterTutorGenderInput.value || "any";
  refreshApp();
});

[
  tutorSubjectInput,
  tutorTopicInput,
  tutorSyllabusInput,
  tutorLevelInput,
  tutorAreaInput,
  tutorTimeInput,
  tutorBudgetInput,
  tutorNoteInput,
  tutorNameInput,
  tutorPhoneInput,
].forEach((input) => {
  input?.addEventListener("input", refreshApp);
  input?.addEventListener("change", refreshApp);
});

modeChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tutorModeInput.value = normalizeLessonMode(button.dataset.modeChoice || "online");
    syncModeButtons(tutorModeInput.value);
    refreshApp();
  });
});

tutorModeInput?.addEventListener("change", () => {
  syncModeButtons(tutorModeInput.value);
  refreshApp();
});

quickSubjectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tutorSubjectInput.value = button.dataset.quickSubject || "";
    activateScreen("search");
    refreshApp();
  });
});

homeModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.homeMode || "online";
    syncHomeModeButtons(mode);
    if (mode === "physical" && !homeAreaInput?.value.trim()) detectNearestLocation();
  });
});

homeSubjectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (homeSubjectInput) homeSubjectInput.value = button.dataset.homeSubject || "";
  });
});

resultSortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeResultSort = button.dataset.resultSort || "match";
    syncResultSortButtons();
    refreshApp();
  });
});

directoryTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeDirectoryType = button.dataset.directoryType || "tutors";
    directoryTypeButtons.forEach((item) => item.classList.toggle("active", item === button));
    if (directorySearchLabelEl) directorySearchLabelEl.textContent = activeDirectoryType === "centres" ? "Centre name, subject, or area" : "Tutor name or subject";
    if (tutorDirectorySearchInput) {
      tutorDirectorySearchInput.value = "";
      tutorDirectorySearchInput.placeholder = activeDirectoryType === "centres" ? "Search centres, Maths, Petaling Jaya..." : "Search Maya, Physics, English...";
    }
    refreshApp();
  });
});

document.addEventListener("click", async (event) => {
  const screenBackButton = event.target.closest("[data-screen-back]");
  const screenTargetButton = event.target.closest("[data-screen-target]");
  const homeSubmitButton = event.target.closest("[data-home-submit]");
  const selectButton = event.target.closest("[data-select-tutor]");
  const viewProfileButton = event.target.closest("[data-view-profile]");
  const bookButton = event.target.closest("[data-book-tutor]");
  const copyButton = event.target.closest("[data-copy-tutor]");
  const loadRequestButton = event.target.closest("[data-load-request]");
  const copyRequestButton = event.target.closest("[data-copy-request]");
  const dayButton = event.target.closest("[data-book-day]");
  const slotButton = event.target.closest("[data-book-slot]");
  const launchSubjectButton = event.target.closest("[data-launch-subject]");
  const launchAreaButton = event.target.closest("[data-launch-area]");
  const filterOpenButton = event.target.closest("[data-filter-open]");
  const filterResetButton = event.target.closest("[data-filter-reset]");
  const inboxThreadButton = event.target.closest("[data-thread-id]");
  const seedPromoButton = event.target.closest("[data-seed-promo]");
  const editLearningButton = event.target.closest("[data-edit-learning]");
  const closeLearningButton = event.target.closest("[data-close-learning]");
  const addCalendarButton = event.target.closest("[data-add-calendar]");
  const resourceOpenButton = event.target.closest("[data-resource-open]");
  const resourceDownloadButton = event.target.closest("[data-resource-download]");

  if (screenBackButton) {
    goBackScreen();
    return;
  }

  if (screenTargetButton) {
    activateScreen(screenTargetButton.dataset.screenTarget || "results");
  }

  if (editLearningButton) {
    if (!marketplaceIsSignedIn()) {
      setMarketplaceAuthMessage("Sign in to view and edit your profile.");
      activateScreen("student-profile");
      activeMarketplaceLoginLink()?.focus();
      return;
    }
    syncStudentLearningEditor();
    if (studentLearningEditor) studentLearningEditor.hidden = false;
    activateScreen("student-profile");
  }

  if (closeLearningButton && studentLearningEditor) {
    studentLearningEditor.hidden = true;
  }

  if (addCalendarButton) {
    const calendarId = addCalendarButton.dataset.addCalendar || "";
    const calendarItem = (calendarId === "next-upcoming" ? nextUpcomingClass() : null) ||
      upcomingClasses.find((item) => item.id === calendarId) ||
      (calendarId.startsWith("subject-") ? calendarItemForSubject(calendarId.slice(8)) : null);
    await addCalendarEvent(calendarItem);
  }

  if (resourceOpenButton) {
    useResourceFile(resourceOpenButton.dataset.resourceOpen, false);
  }

  if (resourceDownloadButton) {
    useResourceFile(resourceDownloadButton.dataset.resourceDownload, true);
  }

  if (homeSubmitButton) {
    applyHomeStart();
  }

  if (filterOpenButton) {
    resultsFilterOpen = !resultsFilterOpen;
    refreshApp();
  }

  if (filterResetButton) {
    teacherFilters = {
      minRating: 0,
      lessonMode: "any",
      availability: "",
      budgetCap: 0,
      gender: "any",
    };
    if (filterMinRatingInput) filterMinRatingInput.value = "0";
    if (filterLessonModeInput) filterLessonModeInput.value = "any";
    if (filterAvailabilityInput) filterAvailabilityInput.value = "";
    if (filterBudgetCapInput) filterBudgetCapInput.value = "0";
    if (filterTutorGenderInput) filterTutorGenderInput.value = "any";
    refreshApp();
  }

  if (selectButton) {
    selectedTutorId = selectButton.dataset.selectTutor || selectedTutorId;
    activeProfileTutorId = selectedTutorId;
    bookingState.tutorId = selectedTutorId;
    const savedTutor = getTeacherById(selectedTutorId);
    if (savedTutor) {
      saveMyTeacher({
        id: savedTutor.id,
        name: savedTutor.name,
        focus: (savedTutor.subjects || []).join(", ") || savedTutor.syllabus,
        area: savedTutor.location || "Online",
        subjects: savedTutor.subjects || [],
        syllabus: savedTutor.syllabus || "",
        level: savedTutor.level || "",
        fee: savedTutor.onlineFee || savedTutor.physicalFee || "",
      });
    }
    refreshApp();
    setRequestStatus("Tutor shortlisted. You can compare, open the profile, or continue to booking.");
  }

  if (viewProfileButton) {
    activeProfileTutorId = viewProfileButton.dataset.viewProfile || activeProfileTutorId;
    bookingState.tutorId = activeProfileTutorId;
    refreshApp();
    activateScreen("profile");
  }

  if (bookButton) {
    activeProfileTutorId = bookButton.dataset.bookTutor || activeProfileTutorId;
    selectedTutorId = activeProfileTutorId;
    bookingState.tutorId = activeProfileTutorId;
    refreshApp();
    activateScreen("book");
  }

  if (copyButton) {
    const request = currentRequest();
    const ranked = activeRequestRanked();
    const tutor = ranked.find((item) => item.teacher.id === copyButton.dataset.copyTutor)?.teacher || getTeacherById(copyButton.dataset.copyTutor);
    const brief = buildTutorBrief(request, tutor || ranked[0]?.teacher || null, bookingState);
    await copyText(brief);
    setRequestStatus(`Copied a brief for ${tutor?.name || "the tutor"}.`);
  }

  if (loadRequestButton) {
    const request = readStoredTutorRequests().find((item) => item.id === loadRequestButton.dataset.loadRequest);
    if (request) {
      loadRequestIntoForm(request);
      setRequestStatus("Saved request loaded back into the app.");
      activateScreen(request.bookingSlot ? "requests" : "results");
    }
  }

  if (copyRequestButton) {
    const request = readStoredTutorRequests().find((item) => item.id === copyRequestButton.dataset.copyRequest);
    if (request) {
      const tutor = getTeacherById(request.selectedTutorId) || null;
      await copyText(
        buildTutorBrief(request, tutor, {
          day: request.bookingDay || "",
          slot: request.bookingSlot || "",
          mode: request.bookingMode || "",
          venue: request.bookingVenue || "",
        })
      );
    }
  }

  if (dayButton) {
    bookingState.day = dayButton.dataset.bookDay || "";
    bookingState.slot = "";
    bookingState.isExplicit = true;
    refreshApp();
  }

  if (slotButton) {
    bookingState.slot = slotButton.dataset.bookSlot || "";
    bookingState.isExplicit = true;
    refreshApp();
  }

  if (launchSubjectButton) {
    tutorSubjectInput.value = launchSubjectButton.dataset.launchSubject || "";
    tutorLevelInput.value = launchSubjectButton.dataset.launchLevel || tutorLevelInput.value;
    tutorAreaInput.value = launchSubjectButton.dataset.launchArea || tutorAreaInput.value;
    activateScreen("results");
    refreshApp();
  }

  if (launchAreaButton && !launchSubjectButton) {
    tutorAreaInput.value = launchAreaButton.dataset.launchArea || tutorAreaInput.value;
    activateScreen("results");
    refreshApp();
  }

  if (inboxThreadButton) {
    activeInboxThreadId = inboxThreadButton.dataset.threadId || activeInboxThreadId;
    refreshApp();
  }

  if (seedPromoButton) {
    if (promoTeacherNameInput) promoTeacherNameInput.value = "Nur Syahirah";
    if (promoSubjectInput) promoSubjectInput.value = "Biology";
    if (promoHeadlineInput) promoHeadlineInput.value = "Weekend biology topic reset sessions";
    if (promoCaptionInput) promoCaptionInput.value =
      "Best for students who need clearer topic flow, revision structure, and confidence before the next exam set.";
  }
});

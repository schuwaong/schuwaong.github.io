const SUPABASE_URL = window.IC_EDUCATE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";
const SESSION_KEY = "icEducateSupabaseSession";
const STUDENT_PROFILE_STORAGE_KEY = "ic-educate-student-profile";
const QA_STUDENT_USER_ID = "qa-student-localhost";
const QA_STUDENT_EMAIL = "qa-student@localhost.test";
const ALLOWED_RETURN_TO = new Set(["discover", "results", "student-profile", "upcoming"]);
const DEFAULT_QA_SUBJECTS = ["Mathematics", "Physics", "Chemistry"];

const authStep = document.getElementById("loginAuthStep");
const roleStep = document.getElementById("loginRoleStep");
const authForm = document.getElementById("loginAuthForm");
const nameInput = document.getElementById("loginName");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const signUpBtn = document.getElementById("loginSignUpBtn");
const loginStatus = document.getElementById("loginStatus");
const roleStatus = document.getElementById("roleStatus");
const roleAccountLabel = document.getElementById("roleAccountLabel");
const loginHomeLink = document.getElementById("loginHomeLink");
const loginBackLink = document.getElementById("loginBackLink");

const params = new URLSearchParams(window.location.search);
const returnTo = ALLOWED_RETURN_TO.has(params.get("returnTo") || "") ? params.get("returnTo") : "discover";
const embeddedRequested = params.has("embedded") || document.body.classList.contains("embedded-shell");
const qaAuthRequested = params.get("qaAuth") === "student";
const deletedRequested = params.get("deleted") === "1";
const DEMO_LOGIN_ID = "demo";
const DEMO_LOGIN_PASSWORD = "pass";

let session = null;
let profile = null;

const request = async (path, { method = "GET", body, auth = false, prefer } = {}) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured");
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${auth ? session?.access_token || SUPABASE_ANON_KEY : SUPABASE_ANON_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.msg || payload?.message || payload?.error_description || payload?.error || `HTTP ${response.status}`);
  return payload;
};

const withEmbeddedParam = (url) => {
  if (embeddedRequested) url.searchParams.set("embedded", "1");
  else url.searchParams.delete("embedded");
  return url;
};

const buildStudentAppUrl = (screenId = returnTo) => {
  const url = new URL("../find-tutor.html", window.location.href);
  url.searchParams.set("screen", ALLOWED_RETURN_TO.has(screenId || "") ? screenId : "discover");
  return withEmbeddedParam(url).toString();
};

const buildTeacherAppUrl = () => {
  const url = new URL("../find-tutor.html", window.location.href);
  url.searchParams.set("screen", "discover");
  return withEmbeddedParam(url).toString();
};

const applyHeaderLinks = () => {
  const appUrl = buildStudentAppUrl(returnTo);
  if (loginHomeLink) loginHomeLink.href = appUrl;
  if (loginBackLink) {
    loginBackLink.href = appUrl;
    loginBackLink.textContent = returnTo === "upcoming" ? "Back to upcoming" : returnTo === "discover" ? "Back to Discover" : "Back to profile";
  }
};

const isLocalQaAllowed = () =>
  ["http:", "https:"].includes(window.location.protocol)
  && !embeddedRequested
  && ["localhost", "127.0.0.1"].includes(window.location.hostname);

const isLocalQaSession = () =>
  session?.user?.id === QA_STUDENT_USER_ID && session?.user?.email === QA_STUDENT_EMAIL;

const isInstalledAppOrigin = () => ["file:", "capacitor:", "ionic:"].includes(window.location.protocol);

const isDemoCredential = (email, password) =>
  email.trim().toLowerCase() === DEMO_LOGIN_ID && password === DEMO_LOGIN_PASSWORD;

const readLocalQaProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STUDENT_PROFILE_STORAGE_KEY) || "null");
    const subjects = Array.isArray(stored?.subjects) && stored.subjects.length ? stored.subjects : DEFAULT_QA_SUBJECTS;
    const accountRole = stored?.accountRole === "teacher" ? "teacher" : "student";
    return {
      display_name: stored?.name || "QA Student",
      level: stored?.level || "IGCSE",
      preferences: {
        account_role: accountRole,
        subjects,
        photo_data_url: typeof stored?.photoDataUrl === "string" ? stored.photoDataUrl : "",
      },
    };
  } catch {
    return {
      display_name: "QA Student",
      level: "IGCSE",
      preferences: {
        account_role: "student",
        subjects: DEFAULT_QA_SUBJECTS,
        photo_data_url: "",
      },
    };
  }
};

const writeLocalQaProfile = (accountRole) => {
  const existing = readLocalQaProfile();
  const nextProfile = {
    name:
      existing.display_name
      || session?.user?.user_metadata?.full_name
      || session?.user?.user_metadata?.name
      || "QA Student",
    level: existing.level || "IGCSE",
    subjects: existing.preferences?.subjects || DEFAULT_QA_SUBJECTS,
    accountRole: accountRole === "teacher" ? "teacher" : "student",
    photoDataUrl: existing.preferences?.photo_data_url || "",
  };
  localStorage.setItem(STUDENT_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  profile = {
    display_name: nextProfile.name,
    level: nextProfile.level,
    preferences: {
      account_role: nextProfile.accountRole,
      subjects: nextProfile.subjects,
      photo_data_url: nextProfile.photoDataUrl,
    },
  };
  return profile;
};

const buildQaSession = () => {
  const now = Math.floor(Date.now() / 1000);
  const displayName = nameInput?.value.trim() || "QA Student";
  return {
    access_token: "qa-local-access-token",
    refresh_token: "qa-local-refresh-token",
    token_type: "bearer",
    expires_in: 24 * 60 * 60,
    expires_at: now + (24 * 60 * 60),
    user: {
      id: QA_STUDENT_USER_ID,
      email: QA_STUDENT_EMAIL,
      user_metadata: {
        demo_account: true,
        full_name: displayName,
        name: displayName,
      },
    },
  };
};

const storeSession = (payload) => {
  if (!payload?.access_token) return null;
  session = {
    ...payload,
    expires_at: payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

const clearSession = () => {
  session = null;
  localStorage.removeItem(SESSION_KEY);
};

const loadProfile = async () => {
  if (isLocalQaSession()) {
    profile = readLocalQaProfile();
    return profile;
  }
  const userId = session?.user?.id;
  if (!userId) return null;
  const rows = await request(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`, { auth: true });
  profile = Array.isArray(rows) ? rows[0] || null : null;
  return profile;
};

const showRoleStep = async () => {
  await loadProfile().catch(() => null);
  authStep.hidden = true;
  roleStep.hidden = false;
  roleAccountLabel.textContent = session?.user?.email || profile?.display_name || "";
};

const authenticate = async ({ createAccount = false } = {}) => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!createAccount && isDemoCredential(email, password) && (isLocalQaAllowed() || isInstalledAppOrigin())) {
    loginStatus.textContent = "Demo account ready. Choose student or teacher to continue.";
    storeSession(buildQaSession());
    passwordInput.value = "";
    await showRoleStep();
    return;
  }
  if (!email || password.length < 6) {
    loginStatus.textContent = "Add an email and a password with at least 6 characters.";
    return;
  }
  loginStatus.textContent = createAccount ? "Creating account..." : "Signing in...";
  const payload = await request(createAccount ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password", {
    method: "POST",
    body: createAccount ? { email, password, data: { full_name: name, name } } : { email, password },
  });
  if (!payload?.access_token) {
    loginStatus.textContent = "Account created. Confirm your email, then sign in.";
    return;
  }
  storeSession(payload);
  passwordInput.value = "";
  await showRoleStep();
};

const saveRole = async (accountRole) => {
  if (!session?.user?.id) return;
  roleStatus.textContent = "Saving account type...";
  if (isLocalQaSession()) {
    writeLocalQaProfile(accountRole);
    window.location.href = accountRole === "teacher" ? buildTeacherAppUrl() : buildStudentAppUrl(returnTo);
    return;
  }
  const preferences = { ...(profile?.preferences || {}), account_role: accountRole };
  const payload = {
    id: session.user.id,
    email: session.user.email || "",
    display_name: profile?.display_name || session.user.user_metadata?.full_name || nameInput.value.trim() || session.user.email?.split("@")[0] || "IC Educate user",
    level: profile?.level || "",
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    preferences,
    updated_at: new Date().toISOString(),
  };
  await request("/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    auth: true,
    body: [payload],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  window.location.href = accountRole === "teacher" ? buildTeacherAppUrl() : buildStudentAppUrl(returnTo);
};

const activateQaSessionIfRequested = async () => {
  if (!qaAuthRequested) return false;
  if (!isLocalQaAllowed()) {
    if (loginStatus) loginStatus.textContent = "Use the standard sign-in flow on this origin.";
    return false;
  }
  storeSession(buildQaSession());
  if (loginStatus) loginStatus.textContent = "Localhost QA session ready. Choose the student role to continue.";
  await showRoleStep();
  return true;
};

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await authenticate();
  } catch (error) {
    loginStatus.textContent = `Sign in failed: ${error.message}`;
  }
});

signUpBtn?.addEventListener("click", async () => {
  try {
    await authenticate({ createAccount: true });
  } catch (error) {
    loginStatus.textContent = `Account creation failed: ${error.message}`;
  }
});

document.addEventListener("click", async (event) => {
  const roleButton = event.target.closest("[data-account-role]");
  if (!roleButton) return;
  document.querySelectorAll("[data-account-role]").forEach((button) => {
    button.disabled = true;
  });
  try {
    await saveRole(roleButton.dataset.accountRole);
  } catch (error) {
    roleStatus.textContent = `Could not save account type: ${error.message}`;
    document.querySelectorAll("[data-account-role]").forEach((button) => {
      button.disabled = false;
    });
  }
});

applyHeaderLinks();

try {
  const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  if (stored?.access_token) {
    session = stored;
    if (isLocalQaSession() && !isLocalQaAllowed()) {
      clearSession();
    }
  }
} catch {
  clearSession();
}

if (deletedRequested && loginStatus) {
  loginStatus.textContent = "Account deleted on July 12, 2026. You can create a new account any time.";
}

activateQaSessionIfRequested().then((activated) => {
  if (!activated && session?.access_token) {
    showRoleStep().catch(() => null);
  }
});

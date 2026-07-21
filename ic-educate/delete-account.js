const DELETE_SESSION_KEY = "icEducateSupabaseSession";
const STUDENT_CACHE_PREFIX = "icEducateStudentCache";
const DELETE_LOCAL_KEYS = [
  "ic-educate-requests",
  "ic-educate-marketplace",
  "ic-educate-teacher-promos",
  "ic-educate-my-teachers",
  "ic-educate-friends",
  "ic-educate-student-profile",
  "ic-educate-marketplace-messages",
  "ic-educate-teacher-leads",
  DELETE_SESSION_KEY,
];

const deleteSummaryEl = document.getElementById("deleteAccountSummary");
const deleteStatusEl = document.getElementById("deleteAccountStatus");
const deleteForm = document.getElementById("deleteAccountForm");
const deleteReasonInput = document.getElementById("deleteAccountReason");
const deleteConfirmInput = document.getElementById("deleteAccountConfirm");
const deleteSubmitBtn = document.getElementById("deleteAccountSubmitBtn");

const DELETE_SUPABASE_URL = window.IC_EDUCATE_SUPABASE_URL || "";
const DELETE_SUPABASE_ANON_KEY = window.IC_EDUCATE_SUPABASE_ANON_KEY || "";

let deleteSession = null;

const readDeleteSession = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETE_SESSION_KEY) || "null");
    return parsed?.access_token ? parsed : null;
  } catch {
    localStorage.removeItem(DELETE_SESSION_KEY);
    return null;
  }
};

const writeDeleteSession = (session) => {
  try {
    if (session?.access_token) localStorage.setItem(DELETE_SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(DELETE_SESSION_KEY);
  } catch {
  }
};

const deleteEndpoint = () => {
  if (window.IC_EDUCATE_DELETE_ACCOUNT_ENDPOINT) return window.IC_EDUCATE_DELETE_ACCOUNT_ENDPOINT;
  if (!DELETE_SUPABASE_URL) return "";
  return `${DELETE_SUPABASE_URL.replace(/\/$/, "")}/functions/v1/delete-account`;
};

const deleteRequest = async (path, { method = "GET", body, auth = false } = {}) => {
  const response = await fetch(path, {
    method,
    headers: {
      apikey: DELETE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${auth ? deleteSession?.access_token || DELETE_SUPABASE_ANON_KEY : DELETE_SUPABASE_ANON_KEY}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || payload?.message || payload?.msg || `HTTP ${response.status}`);
  return payload;
};

const storeDeleteSession = (payload) => {
  if (!payload?.access_token) return null;
  deleteSession = {
    ...payload,
    expires_at: payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
  };
  writeDeleteSession(deleteSession);
  return deleteSession;
};

const refreshDeleteSession = async () => {
  if (!deleteSession?.refresh_token) return deleteSession;
  const expiresAt = Number(deleteSession.expires_at || 0);
  const expiresAtMs = expiresAt > 1e12 ? expiresAt : expiresAt * 1000;
  if (expiresAtMs && expiresAtMs > Date.now() + 60_000) return deleteSession;
  const payload = await deleteRequest(`${DELETE_SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    body: { refresh_token: deleteSession.refresh_token },
  });
  return storeDeleteSession(payload);
};

const clearDeleteData = () => {
  DELETE_LOCAL_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage failures
    }
  });
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(`${STUDENT_CACHE_PREFIX}:`)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore storage failures
  }
};

const setDeleteStatus = (message, tone = "") => {
  if (!deleteStatusEl) return;
  deleteStatusEl.textContent = message;
  deleteStatusEl.classList.remove("success", "error");
  if (tone) deleteStatusEl.classList.add(tone);
};

const renderDeleteState = () => {
  deleteSession = readDeleteSession();
  const email = deleteSession?.user?.email || "";
  if (deleteSummaryEl) {
    deleteSummaryEl.textContent = email
      ? `Signed in as ${email}.`
      : "No active IC Educate session found on this device.";
  }
  if (deleteSubmitBtn) deleteSubmitBtn.disabled = !email;
  setDeleteStatus(
    email
      ? "Type DELETE to confirm permanent deletion."
      : "Sign in first, then come back to this page to delete the account."
  );
};

deleteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!deleteSession?.access_token) {
    setDeleteStatus("Sign in first before deleting the account.", "error");
    return;
  }
  if ((deleteConfirmInput?.value || "").trim().toUpperCase() !== "DELETE") {
    setDeleteStatus("Type DELETE exactly to continue.", "error");
    return;
  }
  if (!DELETE_SUPABASE_URL || !DELETE_SUPABASE_ANON_KEY || !deleteEndpoint()) {
    setDeleteStatus("Account deletion is not configured yet. Deploy the delete-account endpoint first.", "error");
    return;
  }

  deleteSubmitBtn.disabled = true;
  setDeleteStatus("Deleting account...", "");

  try {
    await refreshDeleteSession();
    await deleteRequest(deleteEndpoint(), {
      method: "POST",
      auth: true,
      body: {
        reason: deleteReasonInput?.value.trim() || "",
      },
    });
    clearDeleteData();
    setDeleteStatus("Account deleted. Redirecting to sign in...", "success");
    const params = new URLSearchParams();
    params.set("deleted", "1");
    try {
      const current = new URLSearchParams(window.location.search);
      if (current.get("embedded") === "1") params.set("embedded", "1");
    } catch {
      // ignore malformed URLs
    }
    params.set("returnTo", "student-profile");
    window.setTimeout(() => {
      window.location.href = `./login/index.html?${params.toString()}`;
    }, 1200);
  } catch (error) {
    deleteSubmitBtn.disabled = false;
    setDeleteStatus(`Could not delete account: ${error.message}`, "error");
  }
});

renderDeleteState();

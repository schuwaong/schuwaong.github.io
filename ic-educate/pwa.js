let deferredInstallPrompt = null;

const EMBEDDED_QUERY_KEY = "embedded";

const currentPwaScriptUrl = (() => {
  try {
    const scripts = Array.from(document.scripts || []);
    const matchingScript = scripts
      .slice()
      .reverse()
      .find((script) => /\/pwa\.js(?:[?#].*)?$/.test(script.src || ""));
    return new URL(matchingScript?.src || "./pwa.js", window.location.href);
  } catch {
    return new URL("./pwa.js", window.location.href);
  }
})();

const isEmbeddedShell = () => {
  try {
    return new URLSearchParams(window.location.search).has(EMBEDDED_QUERY_KEY);
  } catch {
    return false;
  }
};

const preserveEmbeddedNavigation = () => {
  if (!isEmbeddedShell()) return;
  document.body.classList.add("embedded-shell");
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
      return;
    }
    try {
      const url = new URL(href, window.location.href);
      if (url.protocol !== "file:" && url.origin !== window.location.origin) return;
      if (url.hostname === "wa.me") return;
      url.searchParams.set(EMBEDDED_QUERY_KEY, "1");
      link.href = url.toString();
    } catch {
      // ignore malformed links
    }
  });
};

const registerIcEducatePwa = async () => {
  if (isEmbeddedShell()) return;
  if (!("serviceWorker" in navigator)) return;
  try {
    const serviceWorkerUrl = new URL("./sw.js", currentPwaScriptUrl);
    const serviceWorkerScope = new URL("./", serviceWorkerUrl);
    await navigator.serviceWorker.register(serviceWorkerUrl, { scope: serviceWorkerScope.pathname });
  } catch (error) {
    console.warn("IC Educate PWA registration failed", error);
  }
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const buildInstallPrompt = () => {
  if (isEmbeddedShell()) return null;
  if (isStandalone() || document.querySelector(".pwa-install-card")) return null;
  const card = document.createElement("aside");
  card.className = "pwa-install-card";
  card.innerHTML = `
    <div>
      <strong>Install IC Educate</strong>
      <p>Open tutor matching like a phone app.</p>
    </div>
    <div class="pwa-install-actions">
      <button type="button" class="secondary-btn" data-pwa-dismiss>Later</button>
      <button type="button" data-pwa-install>Install</button>
    </div>
  `;
  document.body.appendChild(card);
  return card;
};

if (!isEmbeddedShell()) {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const card = buildInstallPrompt();
    card?.querySelector("[data-pwa-install]")?.addEventListener("click", async () => {
      card.remove();
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => null);
      deferredInstallPrompt = null;
    });
    card?.querySelector("[data-pwa-dismiss]")?.addEventListener("click", () => card.remove());
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    document.querySelector(".pwa-install-card")?.remove();
  });
}

preserveEmbeddedNavigation();
registerIcEducatePwa();

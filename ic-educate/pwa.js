let deferredInstallPrompt = null;

const registerIcEducatePwa = async () => {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js", { scope: "./" });
  } catch (error) {
    console.warn("IC Educate PWA registration failed", error);
  }
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const buildInstallPrompt = () => {
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

registerIcEducatePwa();

const leadForm = document.querySelector("#leadForm");
const leadSummary = document.querySelector("#leadSummary");
const emptyState = document.querySelector("#emptyState");
const summaryActions = document.querySelector("#summaryActions");
const copySummary = document.querySelector("#copySummary");
const mailtoLink = document.querySelector("#mailtoLink");
const whatsappLink = document.querySelector("#whatsappLink");
const explainerVideo = document.querySelector(".explainer-video");

// Add digits only, including country code, to send directly to one business number.
// Example: "60123456789". Leave blank to open WhatsApp's chooser/share flow.
const WHATSAPP_NUMBER = "60178265300";

function formValue(data, key, fallback = "not provided") {
  const value = String(data.get(key) || "").trim();
  return value || fallback;
}

function yesNo(data, key) {
  return data.get(key) === "on" ? "yes" : "no";
}

function whatsappUrl(message) {
  const base = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : "https://wa.me/";

  return `${base}?text=${encodeURIComponent(message)}`;
}

function buildSummary(data) {
  return `Scheduled waste pickup quotation check

Company: ${formValue(data, "company")}
Contact: ${formValue(data, "contact")}
Phone / WhatsApp: ${formValue(data, "phone")}
Email: ${formValue(data, "email")}
Site area: ${formValue(data, "location")}
Industry: ${formValue(data, "industry")}

Waste code: ${formValue(data, "code")}
Estimated quantity: ${formValue(data, "quantity")}
Storage age: ${formValue(data, "storageAge")}
Pickup urgency: ${formValue(data, "urgency")}

Description / packaging notes:
${formValue(data, "description")}

Quick checks:
- Labelled: ${yesNo(data, "labelled")}
- Inventory available: ${yesNo(data, "inventory")}
- Photos available: ${yesNo(data, "photos")}
- eSWIS/documentation ready: ${yesNo(data, "eswis")}

Next step:
Confirm code, quantity, packaging condition, site access, photos, licence fit, vehicle/receiver availability, and documentation path before quoting or promising pickup.`;
}

async function copyText(text, button, successLabel) {
  const original = button.textContent;

  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successLabel;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    button.textContent = successLabel;
  }

  window.setTimeout(() => {
    button.textContent = original;
  }, 1600);
}

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(leadForm);
  const summary = buildSummary(data);

  leadSummary.textContent = summary;
  leadSummary.hidden = false;
  emptyState.hidden = true;
  summaryActions.hidden = false;

  const company = formValue(data, "company", "Scheduled waste lead");
  mailtoLink.href = `mailto:?subject=${encodeURIComponent(
    `Scheduled waste quote check - ${company}`,
  )}&body=${encodeURIComponent(summary)}`;
  whatsappLink.href = whatsappUrl(
    `${summary}\n\nI can send photos of the waste, label, packaging, and storage area in this WhatsApp chat.`,
  );
});

leadForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    leadSummary.textContent = "";
    leadSummary.hidden = true;
    emptyState.hidden = false;
    summaryActions.hidden = true;
    mailtoLink.href = "#";
    whatsappLink.href = "#";
  }, 0);
});

copySummary.addEventListener("click", () => {
  copyText(leadSummary.textContent, copySummary, "Copied");
});

document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  const message = link.dataset.whatsappMessage || "Hi 3R Quest, I want to check a scheduled waste pickup quotation.";
  link.href = whatsappUrl(message);
});

if (explainerVideo) {
  const video = explainerVideo.querySelector("video");
  const vimeoId = explainerVideo.dataset.vimeoId?.trim();

  if (vimeoId) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}?title=0&byline=0&portrait=0`;
    iframe.title = "3R Quest scheduled waste explainer video";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.allowFullscreen = true;
    video?.replaceWith(iframe);
    explainerVideo.classList.add("is-ready");
  } else if (video) {
    video.addEventListener("loadedmetadata", () => {
      explainerVideo.classList.add("is-ready");
    });
    video.addEventListener("error", () => {
      video.hidden = true;
      explainerVideo.classList.remove("is-ready");
    });
  }
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((section) => section.classList.add("is-visible"));
}

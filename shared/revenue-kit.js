(function () {
  const STORE_KEY = "icRevenueLeads";
  const EVENT_KEY = "icRevenueEvents";
  const DEFAULT_ENDPOINT = window.IC_REVENUE_ENDPOINT || "";
  const ENDPOINTS = window.IC_REVENUE_ENDPOINTS || {};
  const CHECKOUT_LINKS = window.IC_REVENUE_CHECKOUT_LINKS || {};

  function readList(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeList(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value.slice(0, 200)));
    } catch (error) {
      console.warn("Revenue kit could not write localStorage.", error);
    }
  }

  function saveRecord(key, payload) {
    writeList(key, [payload, ...readList(key)]);
  }

  function collectForm(form) {
    const data = new FormData(form);
    const fields = {};
    for (const [key, value] of data.entries()) {
      fields[key] = typeof value === "string" ? value.trim() : value;
    }
    return fields;
  }

  function endpointFor(project, form) {
    return form.dataset.endpoint || ENDPOINTS[project] || DEFAULT_ENDPOINT;
  }

  function statusFor(form) {
    return form.querySelector("[data-revenue-status]") || document.getElementById(form.dataset.statusId || "");
  }

  function setStatus(element, text, state) {
    if (!element) return;
    element.textContent = text;
    if (state) element.dataset.state = state;
  }

  function utmParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
      const value = params.get(key);
      if (value) result[key] = value;
    });
    return result;
  }

  async function postPayload(endpoint, payload) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }

  function checkoutUrl(key) {
    return CHECKOUT_LINKS[key] || "";
  }

  function initForms() {
    document.querySelectorAll("[data-revenue-form]").forEach((form) => {
      const status = statusFor(form);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const fields = collectForm(form);
        const project = form.dataset.project || "portfolio";
        const offer = form.dataset.offer || fields.offer || "lead";
        const payload = {
          project,
          offer,
          fields,
          page: window.location.href,
          utm: utmParams(),
          createdAt: new Date().toISOString(),
        };

        saveRecord(STORE_KEY, payload);
        const endpoint = endpointFor(project, form);
        const button = form.querySelector("button[type='submit']");
        const originalLabel = button?.textContent || "";
        if (button) {
          button.disabled = true;
          button.textContent = "Saving...";
        }

        try {
          if (endpoint) {
            await postPayload(endpoint, payload);
            setStatus(status, "Saved online. Follow up from the CRM next.", "success");
          } else {
            setStatus(status, "Saved locally. Add IC_REVENUE_ENDPOINT or a project endpoint to capture online.", "warning");
          }
          form.reset();
        } catch (error) {
          console.warn(error);
          setStatus(status, `Saved locally, but the endpoint failed: ${error.message}`, "warning");
        } finally {
          if (button) {
            button.disabled = false;
            button.textContent = originalLabel;
          }
        }
      });
    });
  }

  function initCheckoutButtons() {
    document.querySelectorAll("[data-revenue-checkout]").forEach((button) => {
      button.addEventListener("click", (event) => {
        const key = button.dataset.revenueCheckout;
        const url = button.dataset.checkoutUrl || checkoutUrl(key);
        const payload = {
          type: "checkout_click",
          project: button.dataset.project || "portfolio",
          offer: key,
          page: window.location.href,
          createdAt: new Date().toISOString(),
        };
        saveRecord(EVENT_KEY, payload);

        if (url) {
          window.location.href = url;
          return;
        }

        event.preventDefault();
        const status = button.dataset.statusTarget ? document.querySelector(button.dataset.statusTarget) : null;
        setStatus(status, "Checkout link not configured yet. Add it to IC_REVENUE_CHECKOUT_LINKS or data-checkout-url.", "warning");
      });
    });
  }

  function initAffiliateTracking() {
    document.querySelectorAll("[data-track-affiliate]").forEach((link) => {
      link.addEventListener("click", () => {
        saveRecord(EVENT_KEY, {
          type: "affiliate_click",
          project: link.dataset.project || "portfolio",
          label: link.dataset.trackAffiliate || link.textContent.trim(),
          href: link.href,
          page: window.location.href,
          createdAt: new Date().toISOString(),
        });
      });
    });
  }

  initForms();
  initCheckoutButtons();
  initAffiliateTracking();
})();

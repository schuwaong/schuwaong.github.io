// Static pages talk to the local Jobs Hunt agent running on this PC.
window.JOBS_HUNT_API_BASE = window.JOBS_HUNT_API_BASE || "http://127.0.0.1:3000";

// Optional live capture endpoint for the public paid-pilot funnel.
window.JOBS_HUNT_LEAD_ENDPOINT = window.JOBS_HUNT_LEAD_ENDPOINT || "/api/paid-pilot-leads";

// Public funnel should stay WhatsApp-first unless you intentionally set a public checkout.
window.JOBS_HUNT_PAYMENT_URL = window.JOBS_HUNT_PAYMENT_URL || "";

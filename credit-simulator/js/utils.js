/**
 * utils.js - DOM helpers and formatting utilities
 */

// DOM query helper
const $ = (id) => document.getElementById(id);

// Round to 2 decimal places
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

// Format number with 2 decimal places
const fmt = (x) => x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Set status message with optional type (success, error)
function setStatus(msg, type = "") {
  const el = $("status");
  el.textContent = msg || "";
  el.className = "status" + (type ? " status--" + type : "");
}

// Export for use in other modules
window.CreditSim = window.CreditSim || {};
window.CreditSim.utils = {
  $,
  round2,
  fmt,
  setStatus
};

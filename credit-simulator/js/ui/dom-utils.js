/**
 * ui/dom-utils.js - DOM utility functions
 */

// DOM query helper
const $ = (id) => document.getElementById(id);

// Set status message with optional type (success, error)
function setStatus(msg, type = "") {
  const el = $("status");
  el.textContent = msg || "";
  el.className = "status" + (type ? " status--" + type : "");
}

// Trigger file download
function downloadFile(filename, content, mimeType = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Export
window.CreditSim = window.CreditSim || {};
window.CreditSim.ui = window.CreditSim.ui || {};
window.CreditSim.ui.dom = {
  $,
  setStatus,
  downloadFile
};

/**
 * ui/bands-ui.js - Payment bands UI management
 */

(function() {
  const { $ } = window.CreditSim.ui.dom;
  const { validateBands } = window.CreditSim.core.bandsLogic;

  /**
   * Add a new band row to the table
   */
  function addBandRow(lower = 0, pct = 0.0, minPayment = 0, onRun) {
    const tr = document.createElement("tr");

    const tdLower = document.createElement("td");
    const tdPct = document.createElement("td");
    const tdMin = document.createElement("td");
    const tdRm = document.createElement("td");
    tdRm.className = "text-right";

    tdLower.innerHTML = `<input type="number" step="0.01" value="${lower}">`;
    tdPct.innerHTML   = `<input type="number" step="0.0001" value="${pct}">`;
    tdMin.innerHTML   = `<input type="number" step="0.01" value="${minPayment}">`;
    tdRm.innerHTML    = `<button class="btn-icon" title="Remove band">&times;</button>`;

    tdRm.querySelector("button").addEventListener("click", () => {
      tr.remove();
      if (onRun) onRun();
    });

    // Auto-run on edits
    [tdLower, tdPct, tdMin].forEach(td => {
      td.querySelector("input").addEventListener("input", () => {
        if (onRun) onRun();
      });
    });

    tr.appendChild(tdLower);
    tr.appendChild(tdPct);
    tr.appendChild(tdMin);
    tr.appendChild(tdRm);

    const table = $("bandsTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (tbody) tbody.appendChild(tr);
  }

  /**
   * Extract bands data from the table
   */
  function getBandsFromTable() {
    const table = $("bandsTable");
    if (!table) return [];
    const tbody = table.querySelector("tbody");
    if (!tbody) return [];
    const rows = [...tbody.querySelectorAll("tr")];
    const bands = rows.map(tr => {
      const inputs = tr.querySelectorAll("input");
      return {
        lower: parseFloat(inputs[0].value || "0"),
        pct: parseFloat(inputs[1].value || "0"),
        minPayment: parseFloat(inputs[2].value || "0")
      };
    });
    return validateBands(bands);
  }

  /**
   * Clear all bands from the table
   */
  function clearBands() {
    const table = $("bandsTable");
    if (!table) return;
    const tbody = table.querySelector("tbody");
    if (tbody) tbody.innerHTML = "";
  }

  // Export
  window.CreditSim.ui = window.CreditSim.ui || {};
  window.CreditSim.ui.bands = {
    addBandRow,
    getBandsFromTable,
    clearBands
  };
})();

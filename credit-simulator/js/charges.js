/**
 * charges.js - Advanced mode / monthly charges management
 */

(function() {
  const { $, setStatus } = window.CreditSim.utils;

  // State
  let advancedMode = false;
  // Persistent storage for monthly charges - survives month count changes
  let monthlyChargesStorage = {};

  function isAdvancedMode() {
    return advancedMode;
  }

  function setAdvancedMode(value) {
    advancedMode = value;
  }

  function getMonthlyChargesStorage() {
    return monthlyChargesStorage;
  }

  function setMonthlyChargesStorage(storage) {
    monthlyChargesStorage = storage;
  }

  function clearMonthlyChargesStorage() {
    monthlyChargesStorage = {};
  }

  function toggleAdvancedMode(onRun) {
    advancedMode = $("advancedModeToggle").checked;
    $("monthlyChargesSection").classList.toggle("section--hidden", !advancedMode);
    $("simpleChargesContainer").style.display = advancedMode ? "none" : "block";
    if (advancedMode) {
      rebuildMonthlyChargesGrid(onRun);
    }
    if (onRun) onRun();
  }

  function rebuildMonthlyChargesGrid(onRun) {
    const months = parseInt($("months").value || "0", 10);
    const grid = $("monthlyChargesGrid");
    const defaultCharge = parseFloat($("monthlyCharges").value || "0");

    // Update persistent storage with current values from the grid
    grid.querySelectorAll("input").forEach(inp => {
      const m = parseInt(inp.dataset.month, 10);
      monthlyChargesStorage[m] = parseFloat(inp.value || "0");
    });

    grid.innerHTML = "";

    for (let m = 1; m <= months; m++) {
      const div = document.createElement("div");
      div.className = "scrollable-grid-item";

      // Use stored value if available, otherwise default
      const value = monthlyChargesStorage[m] !== undefined ? monthlyChargesStorage[m] : defaultCharge;

      div.innerHTML = `
        <label>Month ${m}</label>
        <input type="number" step="0.01" value="${value}" data-month="${m}">
      `;

      if (onRun) {
        div.querySelector("input").addEventListener("input", onRun);
      }
      grid.appendChild(div);
    }
  }

  function getMonthlyChargesArray() {
    const charges = [];
    $("monthlyChargesGrid").querySelectorAll("input").forEach(inp => {
      charges.push(parseFloat(inp.value || "0"));
    });
    return charges;
  }

  function fillAllCharges(onRun) {
    const value = prompt("Enter charge amount to fill all months:", "0");
    if (value === null) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;

    $("monthlyChargesGrid").querySelectorAll("input").forEach(inp => {
      inp.value = num;
    });
    if (onRun) onRun();
  }

  function syncStorageFromGrid() {
    $("monthlyChargesGrid").querySelectorAll("input").forEach(inp => {
      const m = parseInt(inp.dataset.month, 10);
      monthlyChargesStorage[m] = parseFloat(inp.value || "0");
    });
  }

  // Export
  window.CreditSim = window.CreditSim || {};
  window.CreditSim.charges = {
    isAdvancedMode,
    setAdvancedMode,
    getMonthlyChargesStorage,
    setMonthlyChargesStorage,
    clearMonthlyChargesStorage,
    toggleAdvancedMode,
    rebuildMonthlyChargesGrid,
    getMonthlyChargesArray,
    fillAllCharges,
    syncStorageFromGrid
  };
})();

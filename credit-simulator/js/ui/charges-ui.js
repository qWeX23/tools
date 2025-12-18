/**
 * ui/charges-ui.js - Monthly charges UI management
 */

(function() {
  const { $ } = window.CreditSim.ui.dom;

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
    return { ...monthlyChargesStorage };
  }

  function setMonthlyChargesStorage(storage) {
    monthlyChargesStorage = { ...storage };
  }

  function clearMonthlyChargesStorage() {
    monthlyChargesStorage = {};
  }

  function toggleAdvancedMode(onRun) {
    const toggle = $("advancedModeToggle");
    const section = $("monthlyChargesSection");
    const simpleContainer = $("simpleChargesContainer");

    advancedMode = toggle ? toggle.checked : false;
    if (section) section.classList.toggle("section--hidden", !advancedMode);
    if (simpleContainer) simpleContainer.style.display = advancedMode ? "none" : "block";
    if (advancedMode) {
      rebuildMonthlyChargesGrid(onRun);
    }
    if (onRun) onRun();
  }

  function rebuildMonthlyChargesGrid(onRun) {
    const monthsEl = $("months");
    const grid = $("monthlyChargesGrid");
    const chargesEl = $("monthlyCharges");

    if (!grid) return;

    const months = monthsEl ? parseInt(monthsEl.value || "0", 10) : 0;
    const defaultCharge = chargesEl ? parseFloat(chargesEl.value || "0") : 0;

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
    const grid = $("monthlyChargesGrid");
    if (grid) {
      grid.querySelectorAll("input").forEach(inp => {
        charges.push(parseFloat(inp.value || "0"));
      });
    }
    return charges;
  }

  function fillAllCharges(onRun) {
    const value = prompt("Enter charge amount to fill all months:", "0");
    if (value === null) return;
    const num = parseFloat(value);
    if (isNaN(num)) return;

    const grid = $("monthlyChargesGrid");
    if (grid) {
      grid.querySelectorAll("input").forEach(inp => {
        inp.value = num;
      });
    }
    if (onRun) onRun();
  }

  function syncStorageFromGrid() {
    const grid = $("monthlyChargesGrid");
    if (grid) {
      grid.querySelectorAll("input").forEach(inp => {
        const m = parseInt(inp.dataset.month, 10);
        monthlyChargesStorage[m] = parseFloat(inp.value || "0");
      });
    }
  }

  function resetAdvancedModeUI() {
    advancedMode = false;
    const toggle = $("advancedModeToggle");
    const section = $("monthlyChargesSection");
    const simpleContainer = $("simpleChargesContainer");
    const grid = $("monthlyChargesGrid");

    if (toggle) toggle.checked = false;
    if (section) section.classList.add("section--hidden");
    if (simpleContainer) simpleContainer.style.display = "block";
    if (grid) grid.innerHTML = "";
  }

  function enableAdvancedModeUI() {
    advancedMode = true;
    const toggle = $("advancedModeToggle");
    const section = $("monthlyChargesSection");
    const simpleContainer = $("simpleChargesContainer");

    if (toggle) toggle.checked = true;
    if (section) section.classList.remove("section--hidden");
    if (simpleContainer) simpleContainer.style.display = "none";
  }

  // Export
  window.CreditSim.ui = window.CreditSim.ui || {};
  window.CreditSim.ui.charges = {
    isAdvancedMode,
    setAdvancedMode,
    getMonthlyChargesStorage,
    setMonthlyChargesStorage,
    clearMonthlyChargesStorage,
    toggleAdvancedMode,
    rebuildMonthlyChargesGrid,
    getMonthlyChargesArray,
    fillAllCharges,
    syncStorageFromGrid,
    resetAdvancedModeUI,
    enableAdvancedModeUI
  };
})();

/**
 * ui/config.js - Configuration import/export
 */

(function() {
  const { $, setStatus, downloadFile } = window.CreditSim.ui.dom;
  const { getBandsFromTable, addBandRow, clearBands } = window.CreditSim.ui.bands;
  const charges = window.CreditSim.ui.charges;

  function exportConfig() {
    // Sync monthly charges storage with current grid values
    if (charges.isAdvancedMode()) {
      charges.syncStorageFromGrid();
    }

    const startingBalanceEl = $("startingBalance");
    const aprEl = $("apr");
    const monthsEl = $("months");
    const monthlyChargesEl = $("monthlyCharges");

    const config = {
      version: "1.0",
      startingBalance: startingBalanceEl ? parseFloat(startingBalanceEl.value || "0") : 0,
      apr: aprEl ? parseFloat(aprEl.value || "0") : 0,
      months: monthsEl ? parseInt(monthsEl.value || "0", 10) : 0,
      monthlyCharges: monthlyChargesEl ? parseFloat(monthlyChargesEl.value || "0") : 0,
      advancedMode: charges.isAdvancedMode(),
      monthlyChargesStorage: charges.isAdvancedMode() ? charges.getMonthlyChargesStorage() : {},
      bands: getBandsFromTable()
    };

    const json = JSON.stringify(config, null, 2);
    downloadFile("credit_config.json", json, "application/json;charset=utf-8");
    setStatus("Configuration exported successfully.", "success");
  }

  function importConfig(file, onRun) {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const config = JSON.parse(e.target.result);

        // Validate required fields
        if (typeof config.startingBalance !== "number" ||
            typeof config.apr !== "number" ||
            typeof config.months !== "number" ||
            !Array.isArray(config.bands)) {
          throw new Error("Invalid config format");
        }

        // Apply basic inputs
        const startingBalanceEl = $("startingBalance");
        const aprEl = $("apr");
        const monthsEl = $("months");
        const monthlyChargesEl = $("monthlyCharges");

        if (startingBalanceEl) startingBalanceEl.value = config.startingBalance;
        if (aprEl) aprEl.value = config.apr;
        if (monthsEl) monthsEl.value = config.months;
        if (monthlyChargesEl) monthlyChargesEl.value = config.monthlyCharges || 0;

        // Clear existing bands
        clearBands();

        // Add bands from config
        for (const band of config.bands) {
          addBandRow(band.lower || 0, band.pct || 0, band.minPayment || 0, onRun);
        }

        // Handle advanced mode
        if (config.advancedMode && config.monthlyChargesStorage) {
          charges.setMonthlyChargesStorage(config.monthlyChargesStorage);
          charges.enableAdvancedModeUI();
          charges.rebuildMonthlyChargesGrid(onRun);
        } else {
          charges.clearMonthlyChargesStorage();
          charges.resetAdvancedModeUI();
        }

        if (onRun) onRun();
        setStatus("Configuration imported successfully.", "success");
      } catch (err) {
        console.error(err);
        setStatus("Failed to import configuration. Please check the file format.", "error");
      }
    };
    reader.onerror = function() {
      setStatus("Failed to read file.", "error");
    };
    reader.readAsText(file);
  }

  // Export
  window.CreditSim.ui = window.CreditSim.ui || {};
  window.CreditSim.ui.config = {
    exportConfig,
    importConfig
  };
})();

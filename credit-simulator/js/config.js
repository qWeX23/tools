/**
 * config.js - Import/export configuration
 */

(function() {
  const { $, setStatus } = window.CreditSim.utils;
  const { getBands, addBandRow, clearBands } = window.CreditSim.bands;
  const charges = window.CreditSim.charges;

  function exportConfig() {
    // Sync monthly charges storage with current grid values
    if (charges.isAdvancedMode()) {
      charges.syncStorageFromGrid();
    }

    const config = {
      version: "1.0",
      startingBalance: parseFloat($("startingBalance").value || "0"),
      apr: parseFloat($("apr").value || "0"),
      months: parseInt($("months").value || "0", 10),
      monthlyCharges: parseFloat($("monthlyCharges").value || "0"),
      advancedMode: charges.isAdvancedMode(),
      monthlyChargesStorage: charges.isAdvancedMode() ? { ...charges.getMonthlyChargesStorage() } : {},
      bands: getBands()
    };

    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "credit_config.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

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
        $("startingBalance").value = config.startingBalance;
        $("apr").value = config.apr;
        $("months").value = config.months;
        $("monthlyCharges").value = config.monthlyCharges || 0;

        // Clear existing bands
        clearBands();

        // Add bands from config
        for (const band of config.bands) {
          addBandRow(band.lower || 0, band.pct || 0, band.minPayment || 0, onRun);
        }

        // Handle advanced mode
        if (config.advancedMode && config.monthlyChargesStorage) {
          charges.setMonthlyChargesStorage({ ...config.monthlyChargesStorage });
          charges.setAdvancedMode(true);
          $("advancedModeToggle").checked = true;
          $("monthlyChargesSection").classList.remove("section--hidden");
          $("simpleChargesContainer").style.display = "none";
          charges.rebuildMonthlyChargesGrid(onRun);
        } else {
          charges.clearMonthlyChargesStorage();
          charges.setAdvancedMode(false);
          $("advancedModeToggle").checked = false;
          $("monthlyChargesSection").classList.add("section--hidden");
          $("simpleChargesContainer").style.display = "block";
          $("monthlyChargesGrid").innerHTML = "";
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
  window.CreditSim = window.CreditSim || {};
  window.CreditSim.config = {
    exportConfig,
    importConfig
  };
})();

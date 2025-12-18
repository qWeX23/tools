/**
 * app.js - Main application initialization and orchestration
 */

(function() {
  const { $, fmt, setStatus } = window.CreditSim.utils;
  const { addBandRow, getBands, clearBands } = window.CreditSim.bands;
  const { simulate } = window.CreditSim.simulation;
  const { renderChart, renderPaymentVsBalanceChart, renderBandChart } = window.CreditSim.charts;
  const { renderResults, toCsv, download } = window.CreditSim.results;
  const { exportConfig, importConfig } = window.CreditSim.config;
  const charges = window.CreditSim.charges;

  // Store last simulation results
  let lastRows = [];

  function run() {
    try {
      const startingBalance = parseFloat($("startingBalance").value || "0");
      const apr = parseFloat($("apr").value || "0");
      const months = parseInt($("months").value || "0", 10);
      const monthlyCharges = parseFloat($("monthlyCharges").value || "0");
      const bands = getBands();

      // Get per-month charges if in advanced mode
      let monthlyChargesArray = null;
      if (charges.isAdvancedMode()) {
        monthlyChargesArray = charges.getMonthlyChargesArray();
      }

      if (!bands.length) { setStatus("Add at least one band.", "error"); return; }
      if (!(months > 0)) { setStatus("Months must be > 0.", "error"); return; }
      if (!(startingBalance >= 0)) { setStatus("Starting balance must be >= 0.", "error"); return; }

      const rows = simulate({ startingBalance, apr, months, monthlyCharges, monthlyChargesArray, bands });
      renderChart(rows);
      renderPaymentVsBalanceChart(rows);
      // Use max balance from simulation (not just startingBalance) for band chart
      const maxBalanceInSim = Math.max(startingBalance, ...rows.map(r => r.startBalance), ...rows.map(r => r.endBalance));
      renderBandChart(bands, maxBalanceInSim);
      renderResults(rows);

      const finalBalance = rows[rows.length - 1]?.endBalance ?? 0;
      const totalPaid = rows.reduce((sum, r) => sum + r.payment, 0);
      const totalInterest = rows.reduce((sum, r) => sum + r.interest, 0);

      setStatus(
        `Simulated ${rows.length} month(s). Final balance: $${fmt(finalBalance)} | Total paid: $${fmt(totalPaid)} | Total interest: $${fmt(totalInterest)}`,
        "success"
      );
      lastRows = rows;
    } catch (e) {
      console.error(e);
      setStatus("Error running simulation (check inputs).", "error");
    }
  }

  function resetExample() {
    $("startingBalance").value = "5000";
    $("apr").value = "0.24";
    $("months").value = "24";
    $("monthlyCharges").value = "0";

    // Clear monthly charges storage and reset legendary mode
    charges.clearMonthlyChargesStorage();
    charges.setAdvancedMode(false);
    $("advancedModeToggle").checked = false;
    $("monthlyChargesSection").classList.add("section--hidden");
    $("simpleChargesContainer").style.display = "block";
    $("monthlyChargesGrid").innerHTML = "";

    clearBands();

    // Example bands that demonstrate different payment strategies based on balance
    addBandRow(0, 0.00, 0, run);        // $0+: No payment (grace period for zero balance)
    addBandRow(100, 0.05, 25, run);     // $100+: 5% or $25 min
    addBandRow(500, 0.04, 35, run);     // $500+: 4% or $35 min
    addBandRow(1000, 0.03, 40, run);    // $1000+: 3% or $40 min
    addBandRow(3000, 0.025, 50, run);   // $3000+: 2.5% or $50 min

    run();
  }

  function init() {
    // Event listeners
    $("runBtn").addEventListener("click", run);
    $("addBandBtn").addEventListener("click", () => addBandRow(0, 0.03, 35, run));
    $("resetBtn").addEventListener("click", resetExample);
    $("downloadCsvBtn").addEventListener("click", () => {
      if (!lastRows.length) return setStatus("Run simulation first.", "error");
      download("credit_sim.csv", toCsv(lastRows));
    });

    // Advanced mode toggle
    $("advancedModeToggle").addEventListener("change", () => charges.toggleAdvancedMode(run));
    $("fillAllChargesBtn").addEventListener("click", () => charges.fillAllCharges(run));

    // Import/Export config
    $("exportConfigBtn").addEventListener("click", exportConfig);
    $("importConfigBtn").addEventListener("click", () => $("importFileInput").click());
    $("importFileInput").addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        importConfig(e.target.files[0], run);
        e.target.value = ""; // Reset so same file can be imported again
      }
    });

    // Auto-run on input changes
    ["startingBalance", "apr", "monthlyCharges"].forEach(id => {
      $(id).addEventListener("input", run);
    });

    // Months input needs to rebuild the grid when in advanced mode
    $("months").addEventListener("input", () => {
      if (charges.isAdvancedMode()) {
        charges.rebuildMonthlyChargesGrid(run);
      }
      run();
    });

    // Initialize with example data
    resetExample();
  }

  // Export run function for other modules that need it
  window.CreditSim = window.CreditSim || {};
  window.CreditSim.app = {
    run,
    resetExample,
    init
  };

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

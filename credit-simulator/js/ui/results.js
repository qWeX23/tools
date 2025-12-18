/**
 * ui/results.js - Results table rendering
 */

(function() {
  const { $ } = window.CreditSim.ui.dom;
  const { fmt } = window.CreditSim.core.formatters;

  function renderResults(rows) {
    const tbody = $("resultsTable").querySelector("tbody");
    tbody.innerHTML = "";

    for (const r of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.month}</td>
        <td>$${fmt(r.startBalance)}</td>
        <td>$${fmt(r.interest)}</td>
        <td>$${fmt(r.charges)}</td>
        <td>$${fmt(r.payment)}</td>
        <td>$${fmt(r.endBalance)}</td>
        <td>${(r.pct * 100).toFixed(2)}%</td>
        <td>$${fmt(r.minPayment)}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  // Export
  window.CreditSim.ui = window.CreditSim.ui || {};
  window.CreditSim.ui.results = {
    renderResults
  };
})();

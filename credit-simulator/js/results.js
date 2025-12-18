/**
 * results.js - Results table and CSV export
 */

(function() {
  const { $, fmt } = window.CreditSim.utils;

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

  function toCsv(rows) {
    const header = ["month", "start_balance", "interest", "charges", "payment", "end_balance", "pct", "min_payment"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        r.month,
        r.startBalance,
        r.interest,
        r.charges,
        r.payment,
        r.endBalance,
        r.pct,
        r.minPayment
      ].join(","));
    }
    return lines.join("\n");
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
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
  window.CreditSim.results = {
    renderResults,
    toCsv,
    download
  };
})();

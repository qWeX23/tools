/**
 * bands.js - Payment bands UI management
 */

(function() {
  const { $ } = window.CreditSim.utils;

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

    // auto-run on edits
    [tdLower, tdPct, tdMin].forEach(td => {
      td.querySelector("input").addEventListener("input", () => {
        if (onRun) onRun();
      });
    });

    tr.appendChild(tdLower);
    tr.appendChild(tdPct);
    tr.appendChild(tdMin);
    tr.appendChild(tdRm);

    $("bandsTable").querySelector("tbody").appendChild(tr);
  }

  function getBands() {
    const rows = [...$("bandsTable").querySelector("tbody").querySelectorAll("tr")];
    const bands = rows.map(tr => {
      const inputs = tr.querySelectorAll("input");
      return {
        lower: parseFloat(inputs[0].value || "0"),
        pct: parseFloat(inputs[1].value || "0"),
        minPayment: parseFloat(inputs[2].value || "0")
      };
    }).filter(b => !Number.isNaN(b.lower) && !Number.isNaN(b.pct) && !Number.isNaN(b.minPayment));

    bands.sort((a, b) => a.lower - b.lower);
    return bands;
  }

  function pickBand(bands, balance) {
    let chosen = bands[0];
    for (const b of bands) {
      if (balance >= b.lower) chosen = b;
      else break;
    }
    return chosen;
  }

  function clearBands() {
    const tbody = $("bandsTable").querySelector("tbody");
    tbody.innerHTML = "";
  }

  // Export
  window.CreditSim = window.CreditSim || {};
  window.CreditSim.bands = {
    addBandRow,
    getBands,
    pickBand,
    clearBands
  };
})();

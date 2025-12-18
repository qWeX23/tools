/**
 * simulation.js - Core simulation engine
 */

(function() {
  const { round2 } = window.CreditSim.utils;
  const { pickBand } = window.CreditSim.bands;

  function simulate({ startingBalance, apr, months, monthlyCharges, monthlyChargesArray, bands }) {
    const r = apr / 12.0;
    let balance = startingBalance;
    const out = [];

    for (let m = 1; m <= months; m++) {
      const interest = balance * r;
      // Use per-month charges if available, otherwise use flat monthly charge
      const charges = monthlyChargesArray && monthlyChargesArray[m - 1] !== undefined
        ? monthlyChargesArray[m - 1]
        : monthlyCharges;

      // Calculate outstanding balance (before payment) for minimum payment calculation
      const outstanding = balance + interest + charges;
      const band = pickBand(bands, outstanding);
      const rawPayment = band.pct * outstanding;
      let payment = Math.max(rawPayment, band.minPayment);

      // cap payment so we never go negative
      payment = Math.min(payment, outstanding);

      const endBalance = Math.max(0, outstanding - payment);

      out.push({
        month: m,
        startBalance: round2(balance),
        pct: band.pct,
        minPayment: band.minPayment,
        interest: round2(interest),
        charges: round2(charges),
        payment: round2(payment),
        endBalance: round2(endBalance)
      });

      balance = endBalance;
      // Don't break early - continue simulation even if balance hits 0
      // because future charges may bring the balance back up
    }
    return out;
  }

  // Export
  window.CreditSim = window.CreditSim || {};
  window.CreditSim.simulation = {
    simulate
  };
})();

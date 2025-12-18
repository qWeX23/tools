/**
 * core/simulation.js - Pure simulation engine (no DOM dependencies)
 *
 * This module contains the core mathematical logic for credit simulation.
 * It can be tested independently without a browser environment.
 */

(function() {
  const { round2 } = window.CreditSim.core.formatters;
  const { pickBand } = window.CreditSim.core.bandsLogic;

  /**
   * Run a credit payment simulation
   * @param {Object} params - Simulation parameters
   * @param {number} params.startingBalance - Initial balance
   * @param {number} params.apr - Annual percentage rate (e.g., 0.24 for 24%)
   * @param {number} params.months - Number of months to simulate
   * @param {number} params.monthlyCharges - Flat monthly charge amount
   * @param {Array} params.monthlyChargesArray - Per-month charges (optional)
   * @param {Array} params.bands - Payment bands array
   * @returns {Array} Array of monthly result objects
   */
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

      // Cap payment so we never go negative
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

  /**
   * Calculate summary statistics from simulation results
   * @param {Array} rows - Simulation results
   * @returns {Object} Summary stats
   */
  function calculateSummary(rows) {
    if (!rows.length) return { finalBalance: 0, totalPaid: 0, totalInterest: 0, totalCharges: 0 };

    return {
      finalBalance: rows[rows.length - 1].endBalance,
      totalPaid: rows.reduce((sum, r) => sum + r.payment, 0),
      totalInterest: rows.reduce((sum, r) => sum + r.interest, 0),
      totalCharges: rows.reduce((sum, r) => sum + r.charges, 0)
    };
  }

  // Export
  window.CreditSim = window.CreditSim || {};
  window.CreditSim.core = window.CreditSim.core || {};
  window.CreditSim.core.simulation = {
    simulate,
    calculateSummary
  };
})();

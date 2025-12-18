/**
 * core/bands-logic.js - Pure band selection logic (no DOM dependencies)
 */

/**
 * Pick the appropriate band for a given balance
 * Bands are matched by "largest lower bound <= balance"
 * @param {Array} bands - Sorted array of {lower, pct, minPayment}
 * @param {number} balance - Current balance to match
 * @returns {Object} The matching band
 */
function pickBand(bands, balance) {
  let chosen = bands[0];
  for (const b of bands) {
    if (balance >= b.lower) chosen = b;
    else break;
  }
  return chosen;
}

/**
 * Validate and sort bands array
 * @param {Array} bands - Array of band objects
 * @returns {Array} Sorted, validated bands
 */
function validateBands(bands) {
  const valid = bands.filter(b =>
    !Number.isNaN(b.lower) &&
    !Number.isNaN(b.pct) &&
    !Number.isNaN(b.minPayment)
  );
  valid.sort((a, b) => a.lower - b.lower);
  return valid;
}

// Export
window.CreditSim = window.CreditSim || {};
window.CreditSim.core = window.CreditSim.core || {};
window.CreditSim.core.bandsLogic = {
  pickBand,
  validateBands
};

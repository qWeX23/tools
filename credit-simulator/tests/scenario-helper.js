/**
 * scenario-helper.js - Easy payment schedule testing
 *
 * Usage:
 *   const result = scenario({
 *     name: 'My test case',
 *     balance: 1000,
 *     apr: 0.24,
 *     months: 12,
 *     bands: [{ lower: 0, pct: 0.03, minPayment: 25 }]
 *   });
 */

const { simulate, calculateSummary } = CreditSim.core.simulation;
const { validateBands } = CreditSim.core.bandsLogic;

/**
 * Run a payment scenario with convenient defaults
 * @param {Object} options - Scenario configuration
 * @returns {Object} Scenario results with summary and analysis
 */
function scenario(options) {
  const {
    name = 'Unnamed scenario',
    balance = 1000,
    apr = 0.24,
    months = 12,
    charges = 0,
    chargesPerMonth = null,
    bands = [{ lower: 0, pct: 0.03, minPayment: 25 }]
  } = options;

  // Run simulation
  const results = simulate({
    startingBalance: balance,
    apr,
    months,
    monthlyCharges: charges,
    monthlyChargesArray: chargesPerMonth,
    bands: validateBands(bands)
  });

  // Calculate summary
  const summary = calculateSummary(results);

  // Find payoff month (if any)
  let paidOffMonth = null;
  for (const row of results) {
    if (row.endBalance === 0) {
      paidOffMonth = row.month;
      break;
    }
  }

  return {
    name,
    months: results,
    summary,
    paidOff: summary.finalBalance === 0,
    paidOffMonth,

    // Convenience accessors
    month: (n) => results[n - 1],
    finalBalance: summary.finalBalance,
    totalPaid: summary.totalPaid,
    totalInterest: summary.totalInterest
  };
}

/**
 * Create a simple single-band configuration
 */
function simpleBand(pct, minPayment = 0) {
  return [{ lower: 0, pct, minPayment }];
}

/**
 * Create standard tiered bands
 */
function tieredBands(tiers) {
  return tiers.map(([lower, pct, minPayment]) => ({
    lower,
    pct,
    minPayment
  }));
}

// Export for use in tests
if (typeof module !== 'undefined') {
  module.exports = { scenario, simpleBand, tieredBands };
}

// Also attach to global for test runner
global.scenario = scenario;
global.simpleBand = simpleBand;
global.tieredBands = tieredBands;

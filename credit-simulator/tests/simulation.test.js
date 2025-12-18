/**
 * simulation.test.js - Tests for core/simulation.js
 */

const { simulate, calculateSummary } = CreditSim.core.simulation;

describe('simulate', () => {
  const simpleBands = [
    { lower: 0, pct: 0.03, minPayment: 25 }
  ];

  it('runs simulation for specified months', () => {
    const result = simulate({
      startingBalance: 1000,
      apr: 0.24,
      months: 12,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: simpleBands
    });
    expect(result).toHaveLength(12);
  });

  it('calculates interest correctly', () => {
    const result = simulate({
      startingBalance: 1200,
      apr: 0.12, // 12% APR = 1% monthly
      months: 1,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: simpleBands
    });
    expect(result[0].interest).toBeCloseTo(12, 2); // 1% of 1200
  });

  it('applies monthly charges', () => {
    const result = simulate({
      startingBalance: 1000,
      apr: 0,
      months: 1,
      monthlyCharges: 50,
      monthlyChargesArray: null,
      bands: simpleBands
    });
    expect(result[0].charges).toBe(50);
  });

  it('uses per-month charges when provided', () => {
    const result = simulate({
      startingBalance: 1000,
      apr: 0,
      months: 3,
      monthlyCharges: 10, // should be ignored
      monthlyChargesArray: [100, 200, 300],
      bands: simpleBands
    });
    expect(result[0].charges).toBe(100);
    expect(result[1].charges).toBe(200);
    expect(result[2].charges).toBe(300);
  });

  it('applies minimum payment when percentage is too low', () => {
    const bandsWithMinimum = [
      { lower: 0, pct: 0.01, minPayment: 50 } // 1% of 1000 = 10, but min is 50
    ];
    const result = simulate({
      startingBalance: 1000,
      apr: 0,
      months: 1,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: bandsWithMinimum
    });
    expect(result[0].payment).toBe(50);
  });

  it('caps payment to outstanding balance', () => {
    const aggressiveBands = [
      { lower: 0, pct: 1.0, minPayment: 1000 } // 100% or $1000 min
    ];
    const result = simulate({
      startingBalance: 100,
      apr: 0,
      months: 1,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: aggressiveBands
    });
    expect(result[0].payment).toBe(100); // capped to outstanding
    expect(result[0].endBalance).toBe(0);
  });

  it('selects correct band based on outstanding balance', () => {
    const tieredBands = [
      { lower: 0, pct: 0.05, minPayment: 10 },
      { lower: 500, pct: 0.03, minPayment: 25 }
    ];
    const result = simulate({
      startingBalance: 600,
      apr: 0,
      months: 1,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: tieredBands
    });
    expect(result[0].pct).toBe(0.03); // should use 500+ band
  });

  it('reduces balance over time', () => {
    const result = simulate({
      startingBalance: 1000,
      apr: 0.12,
      months: 12,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: simpleBands
    });
    expect(result[11].endBalance).toBeLessThan(result[0].startBalance);
  });

  it('continues simulation even after balance reaches zero', () => {
    const result = simulate({
      startingBalance: 50,
      apr: 0,
      months: 5,
      monthlyCharges: 0,
      monthlyChargesArray: null,
      bands: simpleBands
    });
    expect(result).toHaveLength(5);
  });

  it('handles zero starting balance', () => {
    const result = simulate({
      startingBalance: 0,
      apr: 0.24,
      months: 3,
      monthlyCharges: 100,
      monthlyChargesArray: null,
      bands: simpleBands
    });
    expect(result).toHaveLength(3);
    expect(result[0].startBalance).toBe(0);
  });
});

describe('calculateSummary', () => {
  it('calculates final balance from last row', () => {
    const rows = [
      { endBalance: 900, payment: 100, interest: 20, charges: 0 },
      { endBalance: 800, payment: 100, interest: 18, charges: 0 },
      { endBalance: 700, payment: 100, interest: 16, charges: 0 }
    ];
    const summary = calculateSummary(rows);
    expect(summary.finalBalance).toBe(700);
  });

  it('sums total paid across all months', () => {
    const rows = [
      { endBalance: 900, payment: 100, interest: 20, charges: 10 },
      { endBalance: 800, payment: 120, interest: 18, charges: 10 },
      { endBalance: 700, payment: 80, interest: 16, charges: 10 }
    ];
    const summary = calculateSummary(rows);
    expect(summary.totalPaid).toBe(300);
  });

  it('sums total interest', () => {
    const rows = [
      { endBalance: 900, payment: 100, interest: 20, charges: 0 },
      { endBalance: 800, payment: 100, interest: 18, charges: 0 },
      { endBalance: 700, payment: 100, interest: 16, charges: 0 }
    ];
    const summary = calculateSummary(rows);
    expect(summary.totalInterest).toBe(54);
  });

  it('sums total charges', () => {
    const rows = [
      { endBalance: 900, payment: 100, interest: 20, charges: 10 },
      { endBalance: 800, payment: 100, interest: 18, charges: 15 },
      { endBalance: 700, payment: 100, interest: 16, charges: 25 }
    ];
    const summary = calculateSummary(rows);
    expect(summary.totalCharges).toBe(50);
  });

  it('returns zeros for empty input', () => {
    const summary = calculateSummary([]);
    expect(summary.finalBalance).toBe(0);
    expect(summary.totalPaid).toBe(0);
    expect(summary.totalInterest).toBe(0);
    expect(summary.totalCharges).toBe(0);
  });
});

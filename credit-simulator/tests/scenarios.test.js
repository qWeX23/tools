/**
 * scenarios.test.js - Payment schedule scenario tests
 *
 * These tests demonstrate how to easily test different payment scenarios.
 * Use this as a template for testing your own payment configurations.
 */

require('./scenario-helper');

describe('Basic Payment Scenarios', () => {
  it('pays off small balance quickly with minimum payments', () => {
    const result = scenario({
      balance: 100,
      apr: 0,
      months: 5,
      bands: simpleBand(0.50, 25) // 50% or $25 min
    });

    expect(result.paidOff).toBeTruthy();
    expect(result.paidOffMonth).toBeLessThan(5);
  });

  it('never pays off with 0% payment rate and no minimum', () => {
    const result = scenario({
      balance: 1000,
      apr: 0.12,
      months: 12,
      bands: simpleBand(0, 0) // no payments
    });

    expect(result.paidOff).toBeFalsy();
    expect(result.finalBalance).toBeGreaterThan(1000); // grew with interest
  });

  it('balance grows when charges exceed payments', () => {
    const result = scenario({
      balance: 500,
      apr: 0,
      months: 6,
      charges: 100,             // $100/month added
      bands: simpleBand(0.05, 25) // only ~$25-30 paid
    });

    expect(result.finalBalance).toBeGreaterThan(500);
  });
});

describe('Interest Calculations', () => {
  it('calculates 1% monthly interest for 12% APR', () => {
    const result = scenario({
      balance: 1000,
      apr: 0.12,
      months: 1,
      bands: simpleBand(0, 0) // no payments to isolate interest
    });

    expect(result.month(1).interest).toBeCloseTo(10, 2); // 1% of 1000
  });

  it('calculates 2% monthly interest for 24% APR', () => {
    const result = scenario({
      balance: 5000,
      apr: 0.24,
      months: 1,
      bands: simpleBand(0, 0)
    });

    expect(result.month(1).interest).toBeCloseTo(100, 2); // 2% of 5000
  });

  it('compounds interest monthly', () => {
    const result = scenario({
      balance: 1000,
      apr: 0.12,
      months: 3,
      bands: simpleBand(0, 0)
    });

    // Month 1: 1000 * 0.01 = 10
    // Month 2: 1010 * 0.01 = 10.10
    // Month 3: 1020.10 * 0.01 = 10.20
    expect(result.month(1).interest).toBeCloseTo(10, 2);
    expect(result.month(2).interest).toBeCloseTo(10.10, 2);
    expect(result.month(3).interest).toBeCloseTo(10.20, 2);
  });
});

describe('Payment Band Selection', () => {
  const bands = tieredBands([
    [0,    0.10, 10],   // $0+: 10% or $10
    [500,  0.05, 25],   // $500+: 5% or $25
    [1000, 0.03, 40]    // $1000+: 3% or $40
  ]);

  it('uses lowest band for small balances', () => {
    const result = scenario({
      balance: 200,
      apr: 0,
      months: 1,
      bands
    });

    expect(result.month(1).pct).toBe(0.10);
    expect(result.month(1).payment).toBe(20); // 10% of 200
  });

  it('uses middle band for medium balances', () => {
    const result = scenario({
      balance: 700,
      apr: 0,
      months: 1,
      bands
    });

    expect(result.month(1).pct).toBe(0.05);
    expect(result.month(1).payment).toBe(35); // 5% of 700
  });

  it('uses highest band for large balances', () => {
    const result = scenario({
      balance: 2000,
      apr: 0,
      months: 1,
      bands
    });

    expect(result.month(1).pct).toBe(0.03);
    expect(result.month(1).payment).toBe(60); // 3% of 2000
  });

  it('transitions between bands as balance decreases', () => {
    const result = scenario({
      balance: 1100,
      apr: 0,
      months: 10,
      bands
    });

    // Starts in 1000+ band
    expect(result.month(1).pct).toBe(0.03);

    // Eventually drops to 500+ band
    const droppedToMiddle = result.months.find(m => m.pct === 0.05);
    expect(droppedToMiddle).toBeTruthy();
  });
});

describe('Minimum Payment Enforcement', () => {
  it('uses minimum when percentage is lower', () => {
    const result = scenario({
      balance: 500,
      apr: 0,
      months: 1,
      bands: simpleBand(0.01, 25) // 1% = $5, but min is $25
    });

    expect(result.month(1).payment).toBe(25);
  });

  it('uses percentage when higher than minimum', () => {
    const result = scenario({
      balance: 5000,
      apr: 0,
      months: 1,
      bands: simpleBand(0.03, 25) // 3% = $150 > $25 min
    });

    expect(result.month(1).payment).toBe(150);
  });
});

describe('Payment Capping', () => {
  it('caps payment to outstanding balance', () => {
    const result = scenario({
      balance: 50,
      apr: 0,
      months: 1,
      bands: simpleBand(0.50, 100) // would be $100 min, but only $50 owed
    });

    expect(result.month(1).payment).toBe(50);
    expect(result.month(1).endBalance).toBe(0);
  });

  it('handles payoff mid-simulation gracefully', () => {
    const result = scenario({
      balance: 100,
      apr: 0,
      months: 5,
      bands: simpleBand(0.50, 50)
    });

    expect(result.paidOff).toBeTruthy();
    // Should have $0 payments after payoff (no balance to pay)
    const afterPayoff = result.months.filter(m => m.startBalance === 0);
    expect(afterPayoff.length).toBeGreaterThan(0);
  });
});

describe('Variable Monthly Charges', () => {
  it('applies different charges each month', () => {
    const result = scenario({
      balance: 1000,
      apr: 0,
      months: 4,
      chargesPerMonth: [100, 50, 200, 0],
      bands: simpleBand(0.10, 50)
    });

    expect(result.month(1).charges).toBe(100);
    expect(result.month(2).charges).toBe(50);
    expect(result.month(3).charges).toBe(200);
    expect(result.month(4).charges).toBe(0);
  });

  it('can increase balance with high charges', () => {
    const result = scenario({
      balance: 500,
      apr: 0,
      months: 3,
      chargesPerMonth: [200, 200, 200], // $600 total charges
      bands: simpleBand(0.05, 25)        // ~$25-35 payments
    });

    expect(result.finalBalance).toBeGreaterThan(500);
  });
});

describe('Real-World Scenarios', () => {
  it('simulates typical credit card payoff', () => {
    const result = scenario({
      name: 'Credit card payoff - $5000 at 18% APR',
      balance: 5000,
      apr: 0.18,
      months: 60,
      bands: tieredBands([
        [0,    0.10, 50],   // $0+: 10% or $50 min
        [1000, 0.08, 75],   // $1000+: 8% or $75 min
        [3000, 0.06, 100]   // $3000+: 6% or $100 min
      ])
    });

    // Should pay off within 60 months with these rates
    expect(result.paidOff).toBeTruthy();
    // Total paid should be more than principal due to interest
    expect(result.totalPaid).toBeGreaterThan(5000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it('simulates aggressive debt payoff strategy', () => {
    const result = scenario({
      name: 'Aggressive payoff - 10% payments',
      balance: 3000,
      apr: 0.18,
      months: 36,
      bands: simpleBand(0.10, 100)
    });

    expect(result.paidOff).toBeTruthy();
    expect(result.paidOffMonth).toBeLessThan(30);
  });

  it('simulates minimum payment trap', () => {
    const result = scenario({
      name: 'Minimum payment trap',
      balance: 5000,
      apr: 0.24,
      months: 120, // 10 years
      bands: simpleBand(0.02, 25) // only 2% minimum
    });

    // May or may not pay off in 10 years
    // But definitely paying a lot in interest
    expect(result.totalInterest).toBeGreaterThan(result.totalPaid * 0.3);
  });
});

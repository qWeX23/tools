/**
 * bands-logic.test.js - Tests for core/bands-logic.js
 */

const { pickBand, validateBands } = CreditSim.core.bandsLogic;

describe('pickBand', () => {
  const sampleBands = [
    { lower: 0, pct: 0.00, minPayment: 0 },
    { lower: 100, pct: 0.05, minPayment: 25 },
    { lower: 500, pct: 0.04, minPayment: 35 },
    { lower: 1000, pct: 0.03, minPayment: 40 }
  ];

  it('picks first band for zero balance', () => {
    const band = pickBand(sampleBands, 0);
    expect(band.lower).toBe(0);
    expect(band.pct).toBe(0);
  });

  it('picks correct band for balance at exact boundary', () => {
    const band = pickBand(sampleBands, 100);
    expect(band.lower).toBe(100);
    expect(band.pct).toBe(0.05);
  });

  it('picks correct band for balance between boundaries', () => {
    const band = pickBand(sampleBands, 250);
    expect(band.lower).toBe(100);
    expect(band.pct).toBe(0.05);
  });

  it('picks highest matching band for large balance', () => {
    const band = pickBand(sampleBands, 5000);
    expect(band.lower).toBe(1000);
    expect(band.pct).toBe(0.03);
  });

  it('picks correct band at 500 boundary', () => {
    const band = pickBand(sampleBands, 500);
    expect(band.lower).toBe(500);
    expect(band.pct).toBe(0.04);
  });

  it('picks correct band at 999 (just below 1000)', () => {
    const band = pickBand(sampleBands, 999);
    expect(band.lower).toBe(500);
    expect(band.pct).toBe(0.04);
  });

  it('works with single band', () => {
    const singleBand = [{ lower: 0, pct: 0.03, minPayment: 25 }];
    const band = pickBand(singleBand, 1000);
    expect(band.pct).toBe(0.03);
  });
});

describe('validateBands', () => {
  it('filters out invalid bands with NaN values', () => {
    const bands = [
      { lower: 0, pct: 0.03, minPayment: 25 },
      { lower: NaN, pct: 0.04, minPayment: 30 },
      { lower: 100, pct: NaN, minPayment: 35 },
      { lower: 200, pct: 0.05, minPayment: NaN },
      { lower: 300, pct: 0.02, minPayment: 40 }
    ];
    const result = validateBands(bands);
    expect(result).toHaveLength(2);
    expect(result[0].lower).toBe(0);
    expect(result[1].lower).toBe(300);
  });

  it('sorts bands by lower bound ascending', () => {
    const bands = [
      { lower: 500, pct: 0.04, minPayment: 35 },
      { lower: 0, pct: 0.05, minPayment: 25 },
      { lower: 1000, pct: 0.03, minPayment: 40 }
    ];
    const result = validateBands(bands);
    expect(result[0].lower).toBe(0);
    expect(result[1].lower).toBe(500);
    expect(result[2].lower).toBe(1000);
  });

  it('returns empty array for all invalid bands', () => {
    const bands = [
      { lower: NaN, pct: 0.03, minPayment: 25 },
      { lower: 100, pct: NaN, minPayment: 30 }
    ];
    const result = validateBands(bands);
    expect(result).toHaveLength(0);
  });

  it('handles empty input', () => {
    const result = validateBands([]);
    expect(result).toHaveLength(0);
  });

  it('preserves all valid bands', () => {
    const bands = [
      { lower: 0, pct: 0.05, minPayment: 25 },
      { lower: 100, pct: 0.04, minPayment: 30 },
      { lower: 500, pct: 0.03, minPayment: 35 }
    ];
    const result = validateBands(bands);
    expect(result).toHaveLength(3);
  });
});

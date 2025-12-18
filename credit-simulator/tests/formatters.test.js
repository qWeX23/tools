/**
 * formatters.test.js - Tests for core/formatters.js
 */

const { round2, fmt, toCsv } = CreditSim.core.formatters;

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.235)).toBe(1.24);
    expect(round2(1.999)).toBe(2);
  });

  it('handles whole numbers', () => {
    expect(round2(5)).toBe(5);
    expect(round2(100)).toBe(100);
  });

  it('handles negative numbers', () => {
    expect(round2(-1.234)).toBe(-1.23);
    expect(round2(-1.236)).toBe(-1.24);
    expect(round2(-5.99)).toBe(-5.99);
  });

  it('handles zero', () => {
    expect(round2(0)).toBe(0);
  });

  it('handles floating point edge cases', () => {
    // Classic floating point issue: 0.1 + 0.2 = 0.30000000000000004
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe('fmt', () => {
  it('formats with 2 decimal places', () => {
    expect(fmt(1234.5)).toContain('1');
    expect(fmt(1234.5)).toContain('234');
    expect(fmt(1234.5)).toContain('50');
  });

  it('formats zero', () => {
    expect(fmt(0)).toContain('0.00');
  });

  it('formats negative numbers', () => {
    const result = fmt(-500.5);
    expect(result).toContain('500');
    expect(result).toContain('50');
  });
});

describe('toCsv', () => {
  it('generates correct CSV header', () => {
    const csv = toCsv([]);
    expect(csv).toContain('month');
    expect(csv).toContain('start_balance');
    expect(csv).toContain('interest');
    expect(csv).toContain('charges');
    expect(csv).toContain('payment');
    expect(csv).toContain('end_balance');
    expect(csv).toContain('pct');
    expect(csv).toContain('min_payment');
  });

  it('converts simulation rows to CSV format', () => {
    const rows = [
      {
        month: 1,
        startBalance: 1000,
        interest: 20,
        charges: 10,
        payment: 50,
        endBalance: 980,
        pct: 0.03,
        minPayment: 35
      }
    ];
    const csv = toCsv(rows);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('1');
    expect(lines[1]).toContain('1000');
    expect(lines[1]).toContain('20');
    expect(lines[1]).toContain('50');
    expect(lines[1]).toContain('980');
  });

  it('handles multiple rows', () => {
    const rows = [
      { month: 1, startBalance: 1000, interest: 20, charges: 0, payment: 50, endBalance: 970, pct: 0.03, minPayment: 35 },
      { month: 2, startBalance: 970, interest: 19.4, charges: 0, payment: 48.5, endBalance: 940.9, pct: 0.03, minPayment: 35 }
    ];
    const csv = toCsv(rows);
    const lines = csv.split('\n');

    expect(lines).toHaveLength(3); // header + 2 rows
  });

  it('returns only header for empty input', () => {
    const csv = toCsv([]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
  });
});

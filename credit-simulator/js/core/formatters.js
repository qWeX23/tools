/**
 * core/formatters.js - Pure formatting utilities (no DOM dependencies)
 */

// Round to 2 decimal places
function round2(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

// Format number with 2 decimal places
function fmt(x) {
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Convert simulation rows to CSV string
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

// Export
window.CreditSim = window.CreditSim || {};
window.CreditSim.core = window.CreditSim.core || {};
window.CreditSim.core.formatters = {
  round2,
  fmt,
  toCsv
};

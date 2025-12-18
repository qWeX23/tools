/**
 * ui/charts.js - Chart rendering (Chart.js dependent)
 */

(function() {
  const { $ } = window.CreditSim.ui.dom;
  const { fmt } = window.CreditSim.core.formatters;
  const { pickBand } = window.CreditSim.core.bandsLogic;

  // Chart instances
  let balanceChart = null;
  let paymentChart = null;
  let paymentVsBalanceChart = null;
  let bandChart = null;

  // Chart colors from design system
  const chartColors = {
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.15)',
    success: '#22c55e',
    successGlow: 'rgba(34, 197, 94, 0.15)',
    purple: '#a78bfa',
    purpleGlow: 'rgba(167, 139, 250, 0.15)'
  };

  function renderBalanceChart(rows) {
    const ctx = $("balanceChart").getContext("2d");
    const labels = rows.map(r => `M${r.month}`);
    const balance = rows.map(r => r.endBalance);

    if (balanceChart) balanceChart.destroy();
    if (!window.Chart) {
      $("chartNote").textContent = "Chart.js failed to load (CDN blocked?). You can still use the results table below.";
      return;
    }

    $("chartNote").textContent = "";

    balanceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "End Balance",
            data: balance,
            tension: 0.3,
            borderColor: chartColors.accent,
            backgroundColor: chartColors.accentGlow,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return "Balance: $" + fmt(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            ticks: { callback: v => "$" + v.toLocaleString() },
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderPaymentChart(rows) {
    const ctx = $("paymentChart").getContext("2d");
    const labels = rows.map(r => `M${r.month}`);
    const payment = rows.map(r => r.payment);

    if (paymentChart) paymentChart.destroy();
    if (!window.Chart) return;

    paymentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Payment",
            data: payment,
            tension: 0.3,
            borderColor: chartColors.success,
            backgroundColor: chartColors.successGlow,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return "Payment: $" + fmt(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            ticks: { callback: v => "$" + v.toLocaleString() },
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderPaymentVsBalanceChart(rows) {
    const ctx = $("paymentVsBalanceChart").getContext("2d");

    if (paymentVsBalanceChart) paymentVsBalanceChart.destroy();
    if (!window.Chart) return;

    // Create scatter data: x = balance, y = payment
    const scatterData = rows.map(r => ({
      x: r.startBalance,
      y: r.payment
    }));

    paymentVsBalanceChart = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Payment vs Balance",
            data: scatterData,
            backgroundColor: chartColors.accent,
            borderColor: chartColors.accent,
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Balance: $${fmt(context.parsed.x)} → Payment: $${fmt(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Current Balance ($)" },
            ticks: { callback: v => "$" + v.toLocaleString() }
          },
          y: {
            title: { display: true, text: "Payment ($)" },
            ticks: { callback: v => "$" + v.toLocaleString() },
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderBandChart(bands, maxBalance) {
    const ctx = $("bandChart").getContext("2d");

    if (bandChart) bandChart.destroy();
    if (!window.Chart || !bands.length) return;

    // Generate points showing the payment schedule across balance ranges
    const points = [];
    const step = Math.max(10, maxBalance / 200);

    for (let bal = 0; bal <= maxBalance * 1.1; bal += step) {
      const band = pickBand(bands, bal);
      const payment = Math.max(band.pct * bal, band.minPayment);
      points.push({ x: bal, y: payment });
    }

    bandChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Calculated Payment",
            data: points,
            borderColor: chartColors.purple,
            backgroundColor: chartColors.purpleGlow,
            fill: true,
            tension: 0,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `At $${fmt(context.parsed.x)} balance → $${fmt(context.parsed.y)} payment`;
              }
            }
          }
        },
        scales: {
          x: {
            type: "linear",
            title: { display: true, text: "Balance ($)" },
            ticks: { callback: v => "$" + v.toLocaleString() }
          },
          y: {
            title: { display: true, text: "Payment ($)" },
            ticks: { callback: v => "$" + v.toLocaleString() },
            beginAtZero: true
          }
        }
      }
    });
  }

  // Export
  window.CreditSim.ui = window.CreditSim.ui || {};
  window.CreditSim.ui.charts = {
    renderBalanceChart,
    renderPaymentChart,
    renderPaymentVsBalanceChart,
    renderBandChart,
    chartColors
  };
})();

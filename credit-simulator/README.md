# Credit Band Payment Simulator

A configurable credit payment simulator with tiered payment bands.

## Quick Start

Open `index.html` in a browser to use the interactive simulator.

## Payment Formula

```
payment = max(pct(balance) * balance, minPayment(balance))
```

Payment is capped so you never overpay the outstanding balance.

## Project Structure

```
credit-simulator/
├── index.html              # Main application
├── package.json            # npm scripts
├── js/
│   ├── core/               # Pure logic (no DOM, testable in Node.js)
│   │   ├── formatters.js   # round2, fmt, toCsv
│   │   ├── bands-logic.js  # pickBand, validateBands
│   │   └── simulation.js   # simulate, calculateSummary
│   ├── ui/                 # DOM-dependent code
│   │   ├── dom-utils.js    # $, setStatus, downloadFile
│   │   ├── bands-ui.js     # Band table management
│   │   ├── charges-ui.js   # Monthly charges grid
│   │   ├── charts.js       # Chart.js rendering
│   │   ├── results.js      # Results table
│   │   └── config.js       # Import/export
│   └── app.js              # Main orchestration
└── tests/
    ├── test-runner.js      # Zero-dependency test runner
    ├── setup.js            # Node.js environment setup
    ├── formatters.test.js
    ├── bands-logic.test.js
    ├── simulation.test.js
    └── scenarios.test.js   # Payment schedule scenarios
```

## Running Tests

```bash
npm test
```

## Core API

### simulate(options)

Run a payment simulation.

```javascript
const { simulate } = CreditSim.core.simulation;

const results = simulate({
  startingBalance: 5000,
  apr: 0.24,                    // 24% annual
  months: 24,
  monthlyCharges: 0,            // flat monthly charge
  monthlyChargesArray: null,    // or per-month: [100, 50, 75, ...]
  bands: [
    { lower: 0,    pct: 0.00, minPayment: 0 },
    { lower: 100,  pct: 0.05, minPayment: 25 },
    { lower: 500,  pct: 0.04, minPayment: 35 },
    { lower: 1000, pct: 0.03, minPayment: 40 }
  ]
});
```

**Returns:** Array of monthly results:

```javascript
{
  month: 1,
  startBalance: 5000.00,
  interest: 100.00,        // balance * (apr / 12)
  charges: 0,
  payment: 153.00,         // max(pct * outstanding, minPayment)
  endBalance: 4947.00,
  pct: 0.03,               // which band was used
  minPayment: 40
}
```

### pickBand(bands, balance)

Select the appropriate payment band for a balance.

```javascript
const { pickBand } = CreditSim.core.bandsLogic;

const band = pickBand(bands, 750);
// Returns: { lower: 500, pct: 0.04, minPayment: 35 }
```

### calculateSummary(rows)

Get summary statistics from simulation results.

```javascript
const { calculateSummary } = CreditSim.core.simulation;

const summary = calculateSummary(results);
// { finalBalance, totalPaid, totalInterest, totalCharges }
```

## Testing Payment Schedules

Use the scenario helper for readable payment schedule tests:

```javascript
const { scenario } = require('./tests/scenario-helper');

// Define a scenario
const result = scenario({
  name: 'Pay off $1000 in 12 months',
  balance: 1000,
  apr: 0.12,
  months: 12,
  bands: [
    { lower: 0, pct: 0.10, minPayment: 50 }
  ]
});

// Assert expectations
expect(result.summary.finalBalance).toBe(0);
expect(result.months).toHaveLength(12);
expect(result.summary.totalInterest).toBeLessThan(100);
```

### Scenario Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | string | Description for test output |
| `balance` | number | Starting balance |
| `apr` | number | Annual rate (0.24 = 24%) |
| `months` | number | Simulation duration |
| `charges` | number | Flat monthly charges |
| `chargesPerMonth` | number[] | Per-month charges |
| `bands` | array | Payment band configuration |

### Scenario Result

```javascript
{
  name: 'scenario name',
  months: [...],           // full simulation results
  summary: {
    finalBalance,
    totalPaid,
    totalInterest,
    totalCharges
  },
  paidOff: true/false,     // did balance reach 0?
  paidOffMonth: 10         // which month (null if not paid off)
}
```

## Writing Tests

Create a `*.test.js` file in `/tests`:

```javascript
describe('My Payment Scenario', () => {
  it('pays off balance with aggressive payments', () => {
    const result = scenario({
      balance: 500,
      apr: 0,
      months: 5,
      bands: [{ lower: 0, pct: 0.25, minPayment: 100 }]
    });

    expect(result.paidOff).toBeTruthy();
    expect(result.paidOffMonth).toBeLessThan(5);
  });
});
```

## License

MIT

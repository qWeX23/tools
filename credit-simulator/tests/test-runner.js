/**
 * test-runner.js - Simple test runner for core modules
 *
 * Usage: node tests/test-runner.js
 *
 * This runner requires no external dependencies - just Node.js
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

// Test state
let currentSuite = '';
let passed = 0;
let failed = 0;
let errors = [];

// Test API
global.describe = (name, fn) => {
  currentSuite = name;
  console.log(`\n${colors.cyan}${name}${colors.reset}`);
  fn();
};

global.it = (name, fn) => {
  try {
    fn();
    passed++;
    console.log(`  ${colors.green}✓${colors.reset} ${colors.dim}${name}${colors.reset}`);
  } catch (err) {
    failed++;
    console.log(`  ${colors.red}✗ ${name}${colors.reset}`);
    errors.push({ suite: currentSuite, test: name, error: err });
  }
};

global.expect = (actual) => ({
  toBe(expected) {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  },
  toEqual(expected) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(`Expected ${expectedStr}, got ${actualStr}`);
    }
  },
  toBeCloseTo(expected, precision = 2) {
    const factor = Math.pow(10, precision);
    const actualRounded = Math.round(actual * factor);
    const expectedRounded = Math.round(expected * factor);
    if (actualRounded !== expectedRounded) {
      throw new Error(`Expected ${expected} (±${1/factor}), got ${actual}`);
    }
  },
  toBeGreaterThan(expected) {
    if (!(actual > expected)) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeLessThan(expected) {
    if (!(actual < expected)) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
  },
  toHaveLength(expected) {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected}, got ${actual.length}`);
    }
  },
  toBeTruthy() {
    if (!actual) {
      throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
    }
  },
  toBeFalsy() {
    if (actual) {
      throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
    }
  },
  toContain(expected) {
    if (!actual.includes(expected)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
    }
  }
});

// Load core modules for Node.js environment
require('./setup.js');

// Find and run all test files
const testsDir = __dirname;
const testFiles = fs.readdirSync(testsDir)
  .filter(f => f.endsWith('.test.js'))
  .sort();

console.log(`${colors.cyan}Running ${testFiles.length} test file(s)...${colors.reset}`);

for (const file of testFiles) {
  require(path.join(testsDir, file));
}

// Print summary
console.log('\n' + '─'.repeat(50));
if (failed === 0) {
  console.log(`${colors.green}All tests passed!${colors.reset} (${passed} tests)`);
} else {
  console.log(`${colors.red}${failed} failed${colors.reset}, ${colors.green}${passed} passed${colors.reset}`);
  console.log(`\n${colors.red}Failures:${colors.reset}`);
  for (const { suite, test, error } of errors) {
    console.log(`\n  ${suite} > ${test}`);
    console.log(`    ${colors.red}${error.message}${colors.reset}`);
  }
}

process.exit(failed > 0 ? 1 : 0);

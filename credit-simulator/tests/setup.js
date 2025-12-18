/**
 * setup.js - Load core modules for Node.js testing
 *
 * This file adapts the browser modules for Node.js environment
 */

const fs = require('fs');
const path = require('path');

// Create global window object to mimic browser
global.window = global.window || {};
global.window.CreditSim = { core: {}, ui: {} };

// Helper to load and evaluate a JS file
function loadModule(relativePath) {
  const fullPath = path.join(__dirname, '..', relativePath);
  const code = fs.readFileSync(fullPath, 'utf8');

  // Wrap in function to provide window context
  const wrapped = `(function(window) { ${code} })(global.window)`;
  eval(wrapped);
}

// Load core modules in dependency order
loadModule('js/core/formatters.js');
loadModule('js/core/bands-logic.js');
loadModule('js/core/simulation.js');

// Export for convenience
global.CreditSim = global.window.CreditSim;

// Test setup - Configure environment variables for testing
const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables
process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

// Suppress console.log during tests (optional)
global.console = {
  ...console,
  log: jest.fn(), // Suppress console.log
  warn: jest.fn(), // Suppress console.warn
  error: console.error // Keep error logging
};

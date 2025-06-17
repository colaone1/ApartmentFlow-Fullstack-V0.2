// This file is used to set up the test environment before running tests
// Add any global setup code here

// Example: Set up any global variables or mocks
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};

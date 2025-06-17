module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: false,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: '50%',
  testTimeout: 30000,
  bail: 1,
  cache: true,
  cacheDirectory: process.env.JEST_CACHE_DIR || '.jest-cache',
  maxConcurrency: 1,
  detectOpenHandles: true,
  detectLeaks: true,
  transformIgnorePatterns: [
    'node_modules/(?!(mongodb-memory-server)/)'
  ],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};

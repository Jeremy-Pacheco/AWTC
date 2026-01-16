module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: [
    'models/**/*.js',
    'controllers/**/*.js',
    '!tests/**',
    '!node_modules/**'
  ],
  testTimeout: 10000,
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

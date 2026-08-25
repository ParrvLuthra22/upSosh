/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/env.setup.js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  // These integration tests share one real Postgres database — run
  // in-band (see the "test" script's --runInBand) so resetDb() in one
  // file's beforeEach can never race a still-running test in another.
  testTimeout: 15000,
};

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/env.setup.js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  // These integration tests share one real Postgres database, so only one
  // test file may run at a time or resetDb() in one file's beforeEach would
  // wipe rows another file is still using (a bare `npx jest` used to fail
  // ~90 tests that way). `maxWorkers: 1` makes that true however jest is
  // started; the "test" script's --runInBand says the same thing.
  maxWorkers: 1,
  testTimeout: 15000,
};

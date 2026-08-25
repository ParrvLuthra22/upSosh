const nextJest = require('next/jest');

const createJestConfig = nextJest({
    
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    // `tests/` is Playwright's directory (see playwright.config.ts's
    // testDir) — its `*.spec.ts` files use @playwright/test's `test`/
    // `expect`, not Jest's, so Jest picking one up under its default
    // testMatch (which matches any `*.spec.ts` anywhere) fails immediately
    // with an unrelated-looking jest-runtime internals error.
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/'],
};

module.exports = createJestConfig(customJestConfig);

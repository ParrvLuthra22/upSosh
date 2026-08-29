import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    // Playwright's default is 30s. booking-flow.spec.ts does real, sequential
    // network round trips end to end — signup, event load, order creation,
    // Razorpay's actual checkout (script load, iframe, mobile-number step,
    // card entry, OTP), then our own /verify call — confirmed via a live CI
    // run to reliably need more than 30s total, even though the payment
    // itself completes successfully within that window (Razorpay's own
    // "Payment Successful" screen showed a real payment id; our side was
    // just still waiting on /verify when the 30s test budget ran out).
    timeout: 90000,
    use: {
        baseURL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});

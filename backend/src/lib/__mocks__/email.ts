// Manual mock for lib/email.ts. The real module constructs a Resend client
// at import time (`new Resend(process.env.RESEND_API_KEY)`), which throws
// immediately if that key is empty — and if a real key happens to be
// present in the environment (e.g. a developer's own backend/.env, loaded
// by lib/loadEnv.ts), the real send functions would fire real emails during
// a test run. Neither is acceptable for a test suite that has to run the
// same way on every machine and in CI. Every test file that transitively
// imports src/index.ts needs `jest.mock('../src/lib/email')` for this to
// apply.
export const sendBookingConfirmation = jest.fn().mockResolvedValue(undefined);
export const sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
export const sendEventAnnouncement = jest.fn().mockResolvedValue(undefined);

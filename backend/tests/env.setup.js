// Runs before the test framework and before src/lib/prisma.ts (or any other
// module that reads process.env at import time) is ever required — jest's
// setupFiles execute before each test file's own imports.
process.env.NODE_ENV = 'test';

// A separate database, never the dev DB at localhost:5433/upsosh and never
// the Neon production DB. Override DATABASE_URL in the environment (CI does,
// via the workflow's own env:) to point somewhere else; this default matches
// the docker-compose Postgres this project already uses for local dev.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/upsosh_test?schema=public';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-jwt-secret-do-not-use-elsewhere';

// Razorpay's SDK is manually mocked (see __mocks__/razorpay.ts) so these
// never reach the real API — they only need to exist so getRazorpayClient()
// doesn't throw "not configured", and so the webhook/verify HMAC tests have
// a known secret to sign against.
process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_key_id';
process.env.RAZORPAY_KEY_SECRET = 'mock_key_secret_for_hmac_tests';
process.env.RAZORPAY_WEBHOOK_SECRET = 'mock_webhook_secret_for_hmac_tests';

// Explicitly blanked, not just omitted — src/lib/loadEnv.ts loads the real
// backend/.env with dotenv's `override: false`, which only skips a key that
// is already PRESENT in process.env (any value, including ''). Leaving
// these merely unset would let a real .env populate them from the running
// dev environment mid test run, which previously sent a real email to
// guest@example.test on every "booking paid" test. Every call site already
// no-ops safely when its key is empty (lib/email.ts, routes/ai.ts,
// routes/users.ts) — that's what actually keeps these tests from spending
// real API credits or sending real email, once the key is truly blank.
process.env.RESEND_API_KEY = '';
process.env.OPENROUTER_API_KEY = '';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.CLOUDINARY_API_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';

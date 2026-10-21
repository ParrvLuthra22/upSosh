import { RequestHandler } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1000;

/**
 * The client a request counts against: Express's `req.ip`, which already
 * honours the `trust proxy` hop count (see lib/proxy.ts). IPv6 addresses are
 * collapsed to their /64 so one client cannot get a fresh bucket per address.
 */
export function rateLimitKey(req: { ip?: string }): string {
  return ipKeyGenerator(req.ip ?? 'unknown');
}

// express-rate-limit's RequestHandler type resolves against a duplicate,
// mismatched copy of @types/express-serve-static-core pulled in
// transitively via @types/cookie-parser's `@types/express: "*"` peer
// dependency — a workspace-level dependency conflict, not an untyped value.
function asHandler(handler: unknown): RequestHandler {
  return handler as RequestHandler;
}

/** Everything, per client. `GET /api/auth/me` is exempt: it has its own limiter. */
export const generalLimiter = asHandler(rateLimit({
  windowMs: WINDOW_MS,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  skip: (req) => req.path === '/api/auth/me',
  message: { message: 'Too many requests, please try again later.' },
}));

/** Credential-guessing and email-sending routes only: sign in, sign up, forgot/reset password, Google. */
export const authLimiter = asHandler(rateLimit({
  windowMs: WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  message: { message: 'Too many authentication attempts, please try again later.' },
}));

/** Session restore: the frontend calls it on every page load, so it needs room. */
export const meLimiter = asHandler(rateLimit({
  windowMs: WINDOW_MS,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  message: { message: 'Too many requests, please try again later.' },
}));

/** The routes the strict limiter guards. Mounted in index.ts. */
export const STRICT_AUTH_PATHS = [
  '/api/auth/signin',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/google',
];

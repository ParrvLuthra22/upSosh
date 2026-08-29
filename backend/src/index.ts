import './lib/loadEnv';

import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Express's error handler receives whatever was passed to next(err) — thrown
// by app code, or by a library (body-parser's JSON errors carry `status`,
// multer's carry `code`) — so it's never guaranteed to be an Error at all.
interface ErrorLike {
  message?: string;
  status?: number;
  code?: string;
  stack?: string;
}

function toErrorLike(err: unknown): ErrorLike {
  if (err && typeof err === 'object') return err as ErrorLike;
  return { message: String(err) };
}
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import eventRoutes from './routes/events';
import hostRoutes from './routes/hosts';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';
import uploadRoutes from './routes/uploads';
import notificationRoutes from './routes/notifications';
import prisma from './lib/prisma';

// A process.exit(1) here during a Jest run would kill the whole test
// process on any test's unhandled rejection, with no normal Jest failure
// output — let Jest's own handling surface those instead.
if (process.env.NODE_ENV !== 'test') {
  process.on('uncaughtException', (error) => {
    console.error('[Fatal] Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Fatal] Unhandled Rejection:', reason);
  });
}

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// This API never serves HTML itself (every route returns JSON), so this CSP
// is defense-in-depth rather than the policy that actually governs the
// Razorpay checkout script — that script runs in the Next.js frontend, which
// needs its own matching CSP header (set via next.config.js/middleware,
// not here) to meaningfully constrain it.
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
            connectSrc: ["'self'", 'https://api.razorpay.com'],
            frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            styleSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
        },
    },
}));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

// express-rate-limit's RequestHandler type resolves against a duplicate,
// mismatched copy of @types/express-serve-static-core pulled in
// transitively via @types/cookie-parser's `@types/express: "*"` peer
// dependency — a workspace-level dependency conflict, not an untyped value.
app.use(generalLimiter as unknown as RequestHandler);

const allowedOrigins = [
  'https://www.upsosh.app',
  'https://upsosh.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

console.log('[CORS] Allowed origins:', allowedOrigins);

// Razorpay signs the RAW request bytes. Mounted here, before the global
// express.json() below, so this one route gets an unparsed Buffer as
// req.body instead of a re-serialized (and therefore un-verifiable) object —
// body-parser sets req._body once a parser has run, which is what makes
// express.json() below skip re-parsing this route instead of erroring on a
// Buffer.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// File uploads go through multer (routes/uploads.ts) with its own size caps —
// nothing on the JSON/urlencoded path legitimately needs more than a few KB
// of text, so 10mb here was just unused attack surface for body-based DoS.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authLimiter as unknown as RequestHandler, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Root
app.get('/', (req: Request, res: Response) => {
  res.json({ name: 'upSosh API', version: '2.0.0', status: 'running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((rawErr: unknown, req: Request, res: Response, _next: NextFunction) => {
  const err = toErrorLike(rawErr);

  // Fail CLOSED: only an explicit NODE_ENV=development gets stack traces.
  // The previous `!== 'production'` leaked them whenever NODE_ENV was unset or
  // misspelled, which is exactly the situation you cannot detect from outside.
  const isDev = process.env.NODE_ENV === 'development';

  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ message: 'CORS policy violation', code: 'CORS_ERROR' });
  }

  console.error('[Error]', err.message);
  if (isDev) console.error(err.stack);

  return res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    code: err.code,
    ...(isDev && err.stack ? { details: err.stack } : {}),
  });
});

// Everything below has a real side effect (opens a port, starts an
// interval, registers a process-exit handler) — none of that should happen
// just because a test file does `import app from './index'` to hand it to
// supertest. Jest sets NODE_ENV=test itself; nothing else does.
if (process.env.NODE_ENV !== 'test') {
  // Start server
  const server = app.listen(PORT, () => {
    console.log(`[Server] upSosh API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  // Sweep bookings that have sat unpaid for 15+ minutes and mark them expired.
  // These never held a seat (see POST /api/bookings — a paid event only
  // increments attendees on payment success), so there is nothing to release
  // here; this exists so an abandoned checkout doesn't sit in the DB looking
  // like a live pending payment forever.
  const BOOKING_EXPIRY_MS = 15 * 60 * 1000;
  const expireStaleBookings = async (): Promise<void> => {
    try {
      const { count } = await prisma.booking.updateMany({
        where: {
          paymentStatus: 'unpaid',
          status: 'pending',
          createdAt: { lt: new Date(Date.now() - BOOKING_EXPIRY_MS) },
        },
        data: { status: 'expired' },
      });
      if (count > 0) console.log(`[Sweep] Expired ${count} stale unpaid booking(s)`);
    } catch (err: unknown) {
      console.error('[Sweep] Failed to expire stale bookings:', err instanceof Error ? err.message : String(err));
    }
  };
  const sweepInterval = setInterval(expireStaleBookings, 5 * 60 * 1000);
  expireStaleBookings();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received — shutting down gracefully...');
    clearInterval(sweepInterval);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('[Server] Closed. Exiting.');
      process.exit(0);
    });
  });
}

export default app;

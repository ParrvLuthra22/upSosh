import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { signupSchema, signinSchema, resetPasswordSchema } from '../lib/schemas';
import { sendPasswordResetEmail } from '../lib/email';
import { sanitizeUser } from '../lib/sanitizeUser';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

// Slugify the display name into a public /u/[username] handle, then resolve
// collisions with a random suffix — the same pattern events.ts's buildSlug
// uses for event slugs.
async function generateUsername(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'user';

  let candidate = base;
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return `user-${crypto.randomBytes(6).toString('hex')}`;
}

// POST /api/auth/signup
router.post('/signup', validateBody(signupSchema), async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password } = req.body as z.infer<typeof signupSchema>;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const username = await generateUsername(name);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);
    res.cookie('token', token, COOKIE_OPTS);

    return res.status(201).json({ user: sanitizeUser(user), token, message: 'Account created successfully' });
  } catch (err: unknown) {
    console.error('Signup error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/signin (and /login alias)
async function signinHandler(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body as z.infer<typeof signinSchema>;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, COOKIE_OPTS);

    return res.status(200).json({ user: sanitizeUser(user), token, message: 'Login successful' });
  } catch (err: unknown) {
    console.error('Signin error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
}

router.post('/signin', validateBody(signinSchema), signinHandler);
router.post('/login', validateBody(signinSchema), signinHandler);

// POST /api/auth/signout (and /logout alias)
function signoutHandler(req: Request, res: Response): void {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully' });
}

router.post('/signout', signoutHandler);
router.post('/logout', signoutHandler);

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: sanitizeUser(user) });
  } catch (err: unknown) {
    console.error('Get me error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    const trimmedEmail = (email ?? '').trim().toLowerCase();

    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://upsosh.app';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    // Send email (works in both dev and prod — falls back gracefully if no API key)
    sendPasswordResetEmail(trimmedEmail, resetUrl).catch(() => {});

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ForgotPassword] Reset URL for ${trimmedEmail}: ${resetUrl}`);
    }

    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err: unknown) {
    console.error('Forgot password error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validateBody(resetPasswordSchema), async (req: Request, res: Response): Promise<Response> => {
  try {
    const { token, password } = req.body as z.infer<typeof resetPasswordSchema>;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({ message: 'Password reset successfully', success: true });
  } catch (err: unknown) {
    console.error('Reset password error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

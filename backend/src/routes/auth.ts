import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

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

function sanitizeUser(user: any) {
  const role = user.role ?? 'user';
  const hostStatus = user.hostStatus ?? (role === 'host' ? 'verified' : 'none');

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl ?? null,
    bio: user.bio ?? null,
    role,
    hostStatus,
    onboardingComplete: user.onboardingComplete ?? false,
    interests: user.interests ?? '[]',
    city: user.city ?? null,
    groupSize: user.groupSize ?? null,
    vibe: user.vibe ?? null,
    frequency: user.frequency ?? null,
    wantsToHost: user.wantsToHost ?? false,
    hostBio: user.hostBio ?? null,
    hostExperience: user.hostExperience ?? null,
    hostCategories: user.hostCategories ?? '[]',
    hostInstagram: user.hostInstagram ?? null,
    hostLinkedin: user.hostLinkedin ?? null,
    hostWebsite: user.hostWebsite ?? null,
    createdAt: user.createdAt,
  };
}

const AUTH_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    const trimmedName = (name ?? '').trim();
    const trimmedEmail = (email ?? '').trim().toLowerCase();
    const trimmedPassword = (password ?? '');

    if (!trimmedEmail || !trimmedPassword || !trimmedName) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (trimmedPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, 12);
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        password: hashedPassword,
      },
      select: AUTH_USER_SELECT,
    });

    const token = generateToken(user.id);
    res.cookie('token', token, COOKIE_OPTS);

    return res.status(201).json({ user: sanitizeUser(user), token, message: 'Account created successfully' });
  } catch (err: any) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/signin (and /login alias)
async function signinHandler(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    const trimmedEmail = (email ?? '').trim().toLowerCase();
    const trimmedPassword = (password ?? '');

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { ...AUTH_USER_SELECT, password: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(trimmedPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, COOKIE_OPTS);

    const { password: _pw, ...userWithoutPw } = user;
    return res.status(200).json({ user: sanitizeUser(userWithoutPw), token, message: 'Login successful' });
  } catch (err: any) {
    console.error('Signin error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

router.post('/signin', signinHandler);
router.post('/login', signinHandler);

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
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: AUTH_USER_SELECT,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('Get me error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/auth/me
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const updateData: Record<string, any> = {};

    const { name } = req.body;
    if (name !== undefined) updateData.name = String(name).trim();

    const user = Object.keys(updateData).length
      ? await prisma.user.update({
          where: { id: req.user!.id },
          data: updateData,
          select: AUTH_USER_SELECT,
        })
      : await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: AUTH_USER_SELECT,
        });

    return res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('Update me error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<any> => {
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

    const resetUrl = `/reset/${rawToken}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[ForgotPassword] Reset URL for ${trimmedEmail}: ${resetUrl}`);
      return res.json({ message: 'Password reset link generated.', resetUrl });
    }

    // In production, you would send an email here
    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err: any) {
    console.error('Forgot password error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<any> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({ message: 'Password reset successfully', success: true });
  } catch (err: any) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

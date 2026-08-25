import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, HostStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: Role; hostStatus: HostStatus };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, hostStatus: true, deletedAt: true },
    });

    if (!user || user.deletedAt) return res.status(401).json({ message: 'User not found' });
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      // Previously derived from role ('host' => 'verified', else 'none')
      // instead of reading the real column hosts.ts writes on approve/reject.
      // The two happen to be kept in sync today (hosts.ts sets both role and
      // hostStatus together on approval), but an admin's hostStatus, or any
      // future path that only touches one of the two, would have silently
      // disagreed with what this middleware reported.
      hostStatus: user.hostStatus,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireHostStatus(status: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.hostStatus !== status && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Host verification required' });
    }
    next();
  };
}

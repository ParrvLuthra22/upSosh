import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; hostStatus: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<any> {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = {
      ...user,
      hostStatus: user.role === 'host' ? 'verified' : 'none',
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireHostStatus(status: string) {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.hostStatus !== status && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Host verification required' });
    }
    next();
  };
}

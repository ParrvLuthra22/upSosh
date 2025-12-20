import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Try to get token from cookie first
        let token = req.cookies.token;
        
        // If no cookie, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

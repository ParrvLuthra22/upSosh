import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        let token = req.cookies.token;
        
        
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            console.log('[Auth] No token found in cookies or headers');
            return res.status(401).json({ message: 'Not authenticated', reason: 'no_token' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('[Auth] JWT_SECRET is not defined in environment');
            return res.status(500).json({ message: 'Server configuration error', reason: 'no_jwt_secret' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        
        console.log('[Auth] Token verified for user:', decoded.userId);
        next();
    } catch (error: any) {
        console.error('[Auth] Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid token', reason: error.message });
    }
};

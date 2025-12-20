import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();



// Helper to generate token
const generateToken = (userId: string) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

router.post('/signup', async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                bio: null,
                avatar: null,
                isHost: false,
                hostName: null,
                hostBio: null,
                hostVerified: false
            },
            token, // Returning token in body for debugging visibility
            message: 'User created successfully'
        });
    } catch (error: any) {
        console.error('Signup error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code // Log Prisma error codes if available
        });
        return res.status(500).json({ message: 'Internal server error', details: error.message });

    }
});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                bio: null,
                avatar: null,
                isHost: false,
                hostName: null,
                hostBio: null,
                hostVerified: false
            },
            token, // Returning token in body for debugging visibility
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/me', async (req: Request, res: Response): Promise<any> => {
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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user with expected fields (add defaults for missing fields)
        return res.json({ 
            user: {
                ...user,
                bio: null,
                avatar: null,
                isHost: false,
                hostName: null,
                hostBio: null,
                hostVerified: false
            }
        });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

router.put('/me', async (req: Request, res: Response): Promise<any> => {
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

        const { name, bio, avatar, isHost, hostName, hostBio } = req.body;

        // Only update name for now (until migration runs)
        const updateData: any = {};
        if (name !== undefined) {
            updateData.name = name;
        }

        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        // Return user with expected fields
        return res.json({ 
            user: {
                ...user,
                bio: bio ?? null,
                avatar: avatar ?? null,
                isHost: isHost ?? false,
                hostName: hostName ?? null,
                hostBio: hostBio ?? null,
                hostVerified: false
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Failed to update profile' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

router.post('/reset-password', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Validation
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email address' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password using Prisma
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return res.status(200).json({ 
            message: 'Password reset successfully',
            success: true 
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        return res.status(500).json({ 
            message: 'Failed to reset password',
            details: error.message 
        });
    }
});

export default router;

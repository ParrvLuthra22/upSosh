import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const bookings = await prisma.booking.findMany({
        where: {
            userId: userId
        }
    });
    const parsedBookings = bookings.map(b => ({
        ...b,
        items: JSON.parse(b.items),
        customer: b.customer ? JSON.parse(b.customer) : undefined
    }));
    res.json(parsedBookings);
});

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { items, totalAmount, status, paymentId, paymentProof, customer } = req.body;
        
        if (!items || !totalAmount) {
            return res.status(400).json({ error: 'Missing required fields: items, totalAmount' });
        }

        const booking = await prisma.booking.create({
            data: {
                userId: userId, // Use authenticated userId instead of from body
                items: JSON.stringify(items || []),
                totalAmount: Number(totalAmount),
                status: status || 'pending',
                paymentId,
                paymentProof, // Add support for manual payment screenshot
                customer: customer ? JSON.stringify(customer) : undefined
            }
        });
        res.json(booking);
    } catch (error: any) {
        console.error('Booking creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create booking',
            message: error.message 
        });
    }
});

// Get pending bookings (admin only)
router.get('/pending', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get user and check if admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const bookings = await prisma.booking.findMany({
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' }
        });

        res.json(bookings);
    } catch (error: any) {
        console.error('Error fetching pending bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings', message: error.message });
    }
});

// Approve payment (admin only)
router.patch('/:id/approve', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Check if admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const booking = await prisma.booking.update({
            where: { id },
            data: { status: 'confirmed' }
        });

        res.json(booking);
    } catch (error: any) {
        console.error('Error approving payment:', error);
        res.status(500).json({ error: 'Failed to approve payment', message: error.message });
    }
});

// Reject payment (admin only)
router.patch('/:id/reject', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Check if admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const booking = await prisma.booking.update({
            where: { id },
            data: { status: 'rejected' }
        });

        res.json(booking);
    } catch (error: any) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ error: 'Failed to reject payment', message: error.message });
    }
});

export default router;

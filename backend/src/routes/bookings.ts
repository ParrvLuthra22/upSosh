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

// Confirm payment for a booking (after Dodo Payments success)
router.patch('/:id/confirm-payment', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { id } = req.params;
        const { paymentId, status } = req.body;

        // Find the booking and verify it belongs to the user
        const existingBooking = await prisma.booking.findUnique({ where: { id } });
        
        if (!existingBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Allow the booking owner or an admin to confirm
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (existingBooking.userId !== userId && user?.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this booking' });
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: { 
                status: status || 'confirmed',
                paymentId: paymentId || existingBooking.paymentId
            }
        });

        console.log(`Booking ${id} confirmed with payment ${paymentId}`);
        res.json(booking);
    } catch (error: any) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment', message: error.message });
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

        // Parse items and remove large Base64 images from event data to reduce payload size
        const sanitizedBookings = bookings.map(booking => {
            let items = [];
            try {
                items = JSON.parse(booking.items);
                // Remove or truncate large Base64 images from items
                items = items.map((item: any) => {
                    if (item.image && item.image.startsWith('data:image')) {
                        // Replace with placeholder or truncate
                        return { ...item, image: '[Base64 Image Removed]' };
                    }
                    return item;
                });
            } catch (e) {
                console.error('Error parsing booking items:', e);
            }

            return {
                ...booking,
                items: JSON.stringify(items)
            };
        });

        res.json(sanitizedBookings);
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

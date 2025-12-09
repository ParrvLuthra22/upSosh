import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const bookings = await prisma.booking.findMany();
    const parsedBookings = bookings.map(b => ({
        ...b,
        items: JSON.parse(b.items),
        customer: b.customer ? JSON.parse(b.customer) : undefined
    }));
    res.json(parsedBookings);
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { userId, items, totalAmount, status, paymentId, customer } = req.body;
        const booking = await prisma.booking.create({
            data: {
                userId: userId || 'guest',
                items: JSON.stringify(items || []),
                totalAmount: Number(totalAmount),
                status,
                paymentId,
                customer: customer ? JSON.stringify(customer) : undefined
            }
        });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

export default router;

import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/bookings — create booking (requireAuth)
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { eventId, guestName, guestEmail, guestPhone, notes, paymentMethod } = req.body;

    if (!guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({ message: 'guestName, guestEmail, and guestPhone are required' });
    }

    let ticketPrice = 0;
    let isFreeEvent = true;

    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      if (event.attendees >= event.capacity) {
        return res.status(400).json({ message: 'Event is at full capacity' });
      }
      ticketPrice = event.price;
      isFreeEvent = event.isFree || event.price === 0;
    }

    const platformFee = 25;
    const totalAmount = ticketPrice + platformFee;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        eventId: eventId ?? null,
        guestName: String(guestName).trim(),
        guestEmail: String(guestEmail).trim().toLowerCase(),
        guestPhone: String(guestPhone).trim(),
        notes: notes ? String(notes).trim() : null,
        ticketPrice,
        platformFee,
        totalAmount,
        paymentMethod: paymentMethod ?? (isFreeEvent ? 'free' : null),
        status: isFreeEvent ? 'confirmed' : 'pending',
        paymentStatus: isFreeEvent ? 'paid' : 'unpaid',
        qrCode: `UPSOSH-${Date.now()}`, // placeholder, will be replaced with actual id below
      },
    });

    // Update qrCode with actual booking id
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { qrCode: `UPSOSH-${booking.id}` },
      include: { event: true },
    });

    // Increment attendees if event exists
    if (eventId) {
      await prisma.event.update({
        where: { id: eventId },
        data: { attendees: { increment: 1 } },
      });
    }

    return res.status(201).json({ booking: updatedBooking, message: 'Booking created successfully' });
  } catch (err: any) {
    console.error('POST /bookings error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings — current user's bookings (requireAuth)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: { event: { include: { host: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ bookings });
  } catch (err: any) {
    console.error('GET /bookings error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings/admin/all — all bookings (admin only)
router.get('/admin/all', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit))));

    const where: any = {};
    if (status) where.status = String(status);

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true, date: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    return res.json({ bookings, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err: any) {
    console.error('GET /bookings/admin/all error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings/:id — get booking by id (requireAuth, must own or admin)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: { include: { host: true } }, user: { select: { id: true, name: true, email: true } } },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json({ booking });
  } catch (err: any) {
    console.error('GET /bookings/:id error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/bookings/:id/cancel — cancel booking (requireAuth, must own)
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // Decrement attendees
    if (booking.eventId) {
      await prisma.event.update({
        where: { id: booking.eventId },
        data: { attendees: { decrement: 1 } },
      });
    }

    return res.json({ booking: updatedBooking, message: 'Booking cancelled successfully' });
  } catch (err: any) {
    console.error('PATCH /bookings/:id/cancel error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

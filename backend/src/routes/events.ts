import { Router, Request, Response } from 'express';
import { Prisma, Event } from '@prisma/client';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createEventSchema, updateEventSchema, announceSchema, checkinSchema } from '../lib/schemas';
import { sendEventAnnouncement } from '../lib/email';

const router = Router();

function parseTagsField(tags: string): string[] {
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

function formatEvent(event: Event) {
  return {
    ...event,
    tags: parseTagsField(event.tags),
  };
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function buildSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  // Use a random suffix to avoid conflicts
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

// GET /api/events — list with filters, pagination
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      category, city, search, minPrice, maxPrice, hostId,
      date: dateFilter, sort = 'date', page = '1', limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit))));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EventWhereInput = {
      status: { in: ['live', 'full'] },
    };

    if (category) where.category = String(category);
    if (city) where.city = { contains: String(city), mode: 'insensitive' };
    // `hostId` is the frontend's public-profile query param; ownership is
    // actually carried by Event.userId (see POST / below — Host has no
    // ownership column), so it filters on userId.
    if (hostId) where.userId = String(hostId);

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { venue: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      where.date = { gte: startOfDay, lt: endOfDay };
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const dayAfter = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
      where.date = { gte: tomorrow, lt: dayAfter };
    } else if (dateFilter === 'weekend') {
      const dayOfWeek = now.getDay();
      const daysUntilSat = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat);
      const monday = new Date(saturday.getTime() + 2 * 24 * 60 * 60 * 1000);
      where.date = { gte: saturday, lt: monday };
    } else {
      // Default: future events only
      where.date = { gte: now };
    }

    let orderBy: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[] = { date: 'asc' };
    if (sort === 'price') orderBy = { price: 'asc' };
    else if (sort === 'relevance') orderBy = [{ isSuperhost: 'desc' }, { date: 'asc' }];

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        include: { host: true },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.event.count({ where }),
    ]);

    return res.json({
      events: events.map(formatEvent),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err: unknown) {
    console.error('GET /events error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/events/host/mine — current user's events (requireAuth)
router.get('/host/mine', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.user!.id },
      include: { host: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ events: events.map(formatEvent) });
  } catch (err: unknown) {
    console.error('GET /events/host/mine error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/events/host/stats — real aggregates for the dashboard's stat
// cards: total revenue actually collected (paid bookings only, not a
// price*attendees guess), total attendees, upcoming/live event count, and
// events hosted overall.
router.get('/host/stats', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.id;

    const events = await prisma.event.findMany({
      where: { userId },
      select: { id: true, status: true, date: true, attendees: true },
    });

    const now = new Date();
    const upcomingEvents = events.filter((e) => (e.status === 'live' || e.status === 'draft') && e.date >= now).length;
    const totalAttendees = events.reduce((sum, e) => sum + e.attendees, 0);

    const revenueAgg = await prisma.booking.aggregate({
      where: { eventId: { in: events.map((e) => e.id) }, paymentStatus: 'paid' },
      _sum: { totalAmount: true },
    });

    return res.json({
      upcomingEvents,
      totalAttendees,
      totalRevenue: revenueAgg._sum.totalAmount ?? 0,
      eventsHosted: events.length,
    });
  } catch (err: unknown) {
    console.error('GET /events/host/stats error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/events/:slug — get single event by slug or id
router.get('/:slug', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { slug } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: { host: true, user: { select: { id: true, name: true } } },
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    return res.json(formatEvent(event));
  } catch (err: unknown) {
    console.error('GET /events/:slug error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/events — create event (requireAuth, hostStatus=verified OR admin)
router.post('/', requireAuth, validateBody(createEventSchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = req.user!;

    if (user.hostStatus !== 'verified' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Host verification required to create events' });
    }

    // hostId is deliberately NOT accepted from the client. Host has no ownership
    // column (no Host.userId), so there is nothing to validate a client-supplied
    // value against — accepting it let any verified host attribute an event to
    // any Host row by guessing its id. Ownership is carried by userId below,
    // which is what every authorization check actually reads.
    // Unifying Host and User is tracked as P4-39.
    const data = req.body as z.infer<typeof createEventSchema>;
    const slug = buildSlug(data.title);

    const event = await prisma.event.create({
      data: { ...data, slug, userId: user.id },
      include: { host: true },
    });

    return res.status(201).json(formatEvent(event));
  } catch (err: unknown) {
    console.error('POST /events error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/events/:id — update event (requireAuth, must own or admin)
router.put('/:id', requireAuth, validateBody(updateEventSchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    if (existing.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this event' });
    }

    const { tags, ...rest } = req.body as z.infer<typeof updateEventSchema>;
    const updateData: Prisma.EventUpdateInput = { ...rest };
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { host: true },
    });

    return res.json(formatEvent(event));
  } catch (err: unknown) {
    console.error('PUT /events/:id error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/events/:id — soft delete: set status='cancelled'
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    if (existing.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this event' });
    }

    await prisma.event.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return res.json({ message: 'Event cancelled successfully' });
  } catch (err: unknown) {
    console.error('DELETE /events/:id error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/events/:id/attendees — list bookings for a host's own event
router.get('/:id/attendees', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to view this event's attendees" });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId: id, status: { in: ['pending', 'confirmed'] } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const attendees = bookings.map((b) => ({
      id: b.id,
      name: b.guestName || b.user.name,
      email: b.guestEmail || b.user.email,
      bookedAt: b.createdAt,
      status: b.status,
      checkedIn: b.checkedIn,
    }));

    return res.json({ attendees });
  } catch (err: unknown) {
    console.error('GET /events/:id/attendees error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/events/:id/attendees/:attendeeId/checkin — toggle check-in
router.patch('/:id/attendees/:attendeeId/checkin', requireAuth, validateBody(checkinSchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id, attendeeId } = req.params;
    const user = req.user!;
    const { checkedIn } = req.body as z.infer<typeof checkinSchema>;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to manage this event' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: attendeeId } });
    if (!booking || booking.eventId !== id) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    const updated = await prisma.booking.update({ where: { id: attendeeId }, data: { checkedIn } });
    return res.json({ checkedIn: updated.checkedIn });
  } catch (err: unknown) {
    console.error('PATCH /events/:id/attendees/:attendeeId/checkin error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/events/:id/announce — email every current attendee
router.post('/:id/announce', requireAuth, validateBody(announceSchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { message } = req.body as z.infer<typeof announceSchema>;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: "You do not have permission to message this event's attendees" });
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId: id, status: { in: ['pending', 'confirmed'] } },
      include: { user: { select: { name: true, email: true } } },
    });

    await Promise.all(bookings.map((b) => sendEventAnnouncement({
      guestName: b.guestName || b.user.name,
      guestEmail: b.guestEmail || b.user.email,
      eventTitle: event.title,
      message,
    })));

    return res.json({ sent: bookings.length });
  } catch (err: unknown) {
    console.error('POST /events/:id/announce error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

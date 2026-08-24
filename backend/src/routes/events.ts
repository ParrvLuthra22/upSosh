import { Router, Request, Response } from 'express';
import { Prisma, Event } from '@prisma/client';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

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
      category, city, search, minPrice, maxPrice,
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
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
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
    const {
      title, type, category, date, time, venue, city, price, isFree,
      description, image, tags, capacity, status, isSuperhost,
    } = req.body;

    if (!title || title.trim().length < 5) {
      return res.status(400).json({ message: 'Title must be at least 5 characters' });
    }

    if (!date) return res.status(400).json({ message: 'Date is required' });

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      return res.status(400).json({ message: 'Date must be a valid future date' });
    }

    const parsedCapacity = capacity ? Number(capacity) : 30;
    if (parsedCapacity < 2 || parsedCapacity > 500) {
      return res.status(400).json({ message: 'Capacity must be between 2 and 500' });
    }

    const parsedPrice = price !== undefined ? Number(price) : 0;
    if (parsedPrice < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    if (!type) return res.status(400).json({ message: 'Event type is required' });
    if (!venue) return res.status(400).json({ message: 'Venue is required' });
    if (!description) return res.status(400).json({ message: 'Description is required' });

    const slug = buildSlug(title.trim());

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        slug,
        type,
        category: category || type,
        date: parsedDate,
        time: time || '00:00',
        venue: venue.trim(),
        city: city || 'Delhi',
        price: parsedPrice,
        isFree: Boolean(isFree) || parsedPrice === 0,
        description: description.trim(),
        image: image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80',
        tags: Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]'),
        capacity: parsedCapacity,
        status: status || 'live',
        isSuperhost: Boolean(isSuperhost),
        userId: user.id,
      },
      include: { host: true },
    });

    return res.status(201).json(formatEvent(event));
  } catch (err: unknown) {
    console.error('POST /events error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/events/:id — update event (requireAuth, must own or admin)
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    if (existing.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to update this event' });
    }

    const {
      title, type, category, date, time, venue, city, price, isFree,
      description, image, tags, capacity, status, isSuperhost,
    } = req.body;

    const updateData: Prisma.EventUpdateInput = {};
    if (title !== undefined) updateData.title = title.trim();
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return res.status(400).json({ message: 'Invalid date' });
      updateData.date = parsed;
    }
    if (time !== undefined) updateData.time = time;
    if (venue !== undefined) updateData.venue = venue.trim();
    if (city !== undefined) updateData.city = city;
    if (price !== undefined) updateData.price = Number(price);
    if (isFree !== undefined) updateData.isFree = Boolean(isFree);
    if (description !== undefined) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (status !== undefined) updateData.status = status;
    if (isSuperhost !== undefined) updateData.isSuperhost = Boolean(isSuperhost);

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

// POST /api/events/:id/attend — increment attendees (requireAuth)
router.post('/:id/attend', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.attendees >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { attendees: { increment: 1 } },
    });

    return res.json({ attendees: updated.attendees, capacity: updated.capacity });
  } catch (err: unknown) {
    console.error('POST /events/:id/attend error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

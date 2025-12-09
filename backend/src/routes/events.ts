import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
        include: { host: true }
    });
    const parsedEvents = events.map(event => ({
        ...event,
        tags: JSON.parse(event.tags)
    }));
    res.json(parsedEvents);
});

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: { host: true }
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
        ...event,
        tags: JSON.parse(event.tags)
    });
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, type, date, time, venue, price, description, image, tags, isSuperhost, hostId } = req.body;
        const event = await prisma.event.create({
            data: {
                title,
                type,
                date,
                time,
                venue,
                price: Number(price),
                description,
                image,
                tags: JSON.stringify(tags || []),
                isSuperhost: isSuperhost || false,
                hostId
            }
        });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

export default router;

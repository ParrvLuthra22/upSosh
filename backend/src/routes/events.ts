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
        
        // Validate required fields
        if (!title || !type || !date || !time || !venue || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if host exists, if not create from user data
        let host = await prisma.host.findUnique({ where: { id: hostId } });
        
        if (!host) {
            // Find user to get their details
            const user = await prisma.user.findUnique({ where: { id: hostId } });
            
            if (user && user.isHost) {
                // Create host profile from user data
                host = await prisma.host.create({
                    data: {
                        id: hostId,
                        name: user.hostName || user.name,
                        verified: user.hostVerified || false,
                        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
                    }
                });
                console.log(`✅ Created host profile for user: ${user.name}`);
            } else {
                return res.status(403).json({ 
                    error: 'User must enable host mode before creating events',
                    details: 'Go to Profile > Enable Host Mode'
                });
            }
        }
        
        // Create event with real data
        const event = await prisma.event.create({
            data: {
                title,
                type,
                date,
                time,
                venue,
                price: Number(price),
                description,
                image: image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80',
                tags: JSON.stringify(tags || []),
                isSuperhost: isSuperhost || false,
                hostId: host.id
            },
            include: { host: true }
        });
        
        console.log(`✅ Event created: "${title}" by ${host.name}`);
        
        res.json({
            ...event,
            tags: JSON.parse(event.tags)
        });
    } catch (error: any) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event', details: error.message });
    }
});

export default router;

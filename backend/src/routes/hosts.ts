import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const hosts = await prisma.host.findMany();
    res.json(hosts);
});

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const host = await prisma.host.findUnique({
        where: { id }
    });

    if (!host) {
        return res.status(404).json({ error: 'Host not found' });
    }

    res.json(host);
});

export default router;

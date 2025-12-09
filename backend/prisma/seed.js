const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const dataPath = path.join(__dirname, '../mocks/db.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Hosts
        console.log('Seeding Hosts...');
        for (const h of data.hosts) {
            // Check if exists to avoid unique constraint errors if re-run
            const exists = await prisma.host.findUnique({ where: { id: h.id } });
            if (!exists) {
                await prisma.host.create({
                    data: {
                        id: h.id,
                        name: h.displayName || h.name,
                        verified: h.verified || false,
                        avatar: h.avatar || ''
                    }
                });
            }
        }

        // Events
        console.log('Seeding Events...');
        for (const e of data.events) {
            const exists = await prisma.event.findUnique({ where: { id: e.id } });
            if (!exists) {
                // Verify host exists, otherwise default or skip
                const hostExists = await prisma.host.findUnique({ where: { id: e.hostId } });
                if (!hostExists) {
                    console.warn(`Skipping event ${e.id} because host ${e.hostId} not found`);
                    continue;
                }

                await prisma.event.create({
                    data: {
                        id: e.id,
                        title: e.title,
                        type: e.type,
                        date: e.date,
                        time: e.time,
                        venue: typeof e.venue === 'string' ? e.venue : (e.venue.name || 'Unknown'),
                        price: Number(e.price) || 0,
                        description: e.description,
                        image: e.image || '',
                        tags: JSON.stringify(e.tags || []),
                        isSuperhost: e.isSuperhost || false,
                        hostId: e.hostId
                    }
                });
            }
        }

        console.log('Seeded successfully!');
    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

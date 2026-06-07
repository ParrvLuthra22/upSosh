const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  try {
    const events = await prisma.event.findMany({ where: { slug: null } });
    for (const event of events) {
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const base = event.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      const newSlug = `${base || 'event'}-${randomSuffix}`;
      console.log(`Setting slug for event ${event.id} to ${newSlug}`);
      await prisma.event.update({
        where: { id: event.id },
        data: { slug: newSlug }
      });
    }
    console.log("Slugs populated successfully.");
  } catch (e) {
    console.error("Error populating slugs:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

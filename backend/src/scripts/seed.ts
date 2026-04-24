/**
 * Seed script — inserts sample data into the database.
 * Run with: npx ts-node src/scripts/seed.ts
 * (after setting DATABASE_URL in .env)
 */

import '../lib/loadEnv';

import prisma from '../lib/prisma';

async function main() {
  console.log('[Seed] Starting...');

  // Create a sample host
  const host = await prisma.host.upsert({
    where: { id: 'seed-host-1' },
    update: {},
    create: {
      id: 'seed-host-1',
      name: 'upSosh Team',
      verified: true,
      avatar: 'https://ui-avatars.com/api/?name=upSosh+Team&background=6366f1&color=fff',
    },
  });

  console.log('[Seed] Host created:', host.name);

  const events = [
    {
      title: 'Delhi Jazz & Chill Evening',
      slug: 'delhi-jazz-chill-evening-s1',
      type: 'social',
      category: 'music',
      date: new Date('2026-05-10T19:00:00'),
      time: '7:00 PM',
      venue: 'The Piano Man Jazz Club, Khan Market',
      city: 'Delhi',
      price: 499,
      isFree: false,
      description: 'A soulful jazz evening with live performances, craft cocktails, and great conversations. Perfect for music lovers and social butterflies alike.',
      image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['jazz', 'music', 'social', 'nightout']),
      capacity: 60,
      attendees: 12,
      status: 'live',
      isSuperhost: true,
      hostId: host.id,
    },
    {
      title: 'Rooftop Yoga & Sunrise Session',
      slug: 'rooftop-yoga-sunrise-s2',
      type: 'wellness',
      category: 'wellness',
      date: new Date('2026-05-12T06:00:00'),
      time: '6:00 AM',
      venue: 'Lodhi Garden Rooftop, South Delhi',
      city: 'Delhi',
      price: 299,
      isFree: false,
      description: 'Start your day right with a guided yoga session as the sun rises over Delhi. Includes breathing exercises, meditation, and herbal tea.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['yoga', 'wellness', 'sunrise', 'mindfulness']),
      capacity: 20,
      attendees: 8,
      status: 'live',
      isSuperhost: false,
      hostId: host.id,
    },
    {
      title: 'Tech Founders Mixer — Delhi Edition',
      slug: 'tech-founders-mixer-delhi-s3',
      type: 'networking',
      category: 'professional',
      date: new Date('2026-05-15T18:30:00'),
      time: '6:30 PM',
      venue: 'Headstart Network, Cyber City Gurgaon',
      city: 'Delhi',
      price: 0,
      isFree: true,
      description: 'A casual networking mixer for startup founders, VCs, and tech enthusiasts. Share ideas, find co-founders, and build your network over drinks and nibbles.',
      image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['startup', 'networking', 'tech', 'founders']),
      capacity: 80,
      attendees: 34,
      status: 'live',
      isSuperhost: true,
      hostId: host.id,
    },
    {
      title: 'Pottery Workshop — Beginners Welcome',
      slug: 'pottery-workshop-beginners-s4',
      type: 'workshop',
      category: 'art',
      date: new Date('2026-05-17T10:00:00'),
      time: '10:00 AM',
      venue: 'Clay Studio, Hauz Khas Village',
      city: 'Delhi',
      price: 799,
      isFree: false,
      description: 'Learn the art of pottery from scratch. Create your own clay bowl or vase under expert guidance. All materials included. Great for couples, friends, and solo explorers.',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['pottery', 'art', 'craft', 'workshop', 'beginners']),
      capacity: 12,
      attendees: 7,
      status: 'live',
      isSuperhost: false,
      hostId: host.id,
    },
    {
      title: 'Indie Bazaar — Curated Local Market',
      slug: 'indie-bazaar-local-market-s5',
      type: 'social',
      category: 'lifestyle',
      date: new Date('2026-05-18T11:00:00'),
      time: '11:00 AM',
      venue: 'Dilli Haat, INA',
      city: 'Delhi',
      price: 0,
      isFree: true,
      description: 'Discover unique handcrafted products, vintage finds, and artisanal food from 50+ local vendors. Live music, food trucks, and a great vibe all day.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['market', 'local', 'handmade', 'food', 'music']),
      capacity: 500,
      attendees: 120,
      status: 'live',
      isSuperhost: true,
      hostId: host.id,
    },
    {
      title: 'Night Photography Walk — Old Delhi',
      slug: 'night-photography-old-delhi-s6',
      type: 'experience',
      category: 'photography',
      date: new Date('2026-05-20T20:00:00'),
      time: '8:00 PM',
      venue: 'Chandni Chowk Metro Station (meeting point)',
      city: 'Delhi',
      price: 399,
      isFree: false,
      description: 'Explore the atmospheric lanes of Old Delhi after dark with a professional photographer guide. Capture the magic of Jama Masjid, Khari Baoli, and the spice markets lit up at night.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['photography', 'olddelhi', 'nightwalk', 'culture']),
      capacity: 15,
      attendees: 9,
      status: 'live',
      isSuperhost: false,
      hostId: host.id,
    },
    {
      title: 'Book Club — "The God of Small Things"',
      slug: 'book-club-god-small-things-s7',
      type: 'intellectual',
      category: 'literature',
      date: new Date('2026-05-22T17:00:00'),
      time: '5:00 PM',
      venue: 'Bahrisons Booksellers, Khan Market',
      city: 'Delhi',
      price: 0,
      isFree: true,
      description: 'Monthly book club discussion — this month we dive into Arundhati Roy\'s Booker Prize winning masterpiece. Bring your copy, your thoughts, and an open mind.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['books', 'literature', 'discussion', 'reading']),
      capacity: 25,
      attendees: 11,
      status: 'live',
      isSuperhost: false,
      hostId: host.id,
    },
    {
      title: 'Salsa & Bachata Social Night',
      slug: 'salsa-bachata-social-night-s8',
      type: 'dance',
      category: 'dance',
      date: new Date('2026-05-24T20:00:00'),
      time: '8:00 PM',
      venue: 'Turquoise Cottage, Adhchini',
      city: 'Delhi',
      price: 599,
      isFree: false,
      description: 'A night of salsa and bachata with live DJ sets, dance floors, and an energetic crowd. Beginners\' lesson at 8 PM, open social dancing from 9 PM onwards.',
      image: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['salsa', 'bachata', 'dance', 'nightlife', 'social']),
      capacity: 100,
      attendees: 45,
      status: 'live',
      isSuperhost: true,
      hostId: host.id,
    },
    {
      title: 'Sustainable Living Workshop',
      slug: 'sustainable-living-workshop-s9',
      type: 'workshop',
      category: 'environment',
      date: new Date('2026-05-25T14:00:00'),
      time: '2:00 PM',
      venue: 'Eco Hub, Saket',
      city: 'Delhi',
      price: 199,
      isFree: false,
      description: 'Learn practical tips for living sustainably — from zero-waste home hacks to composting, upcycling, and ethical shopping. Interactive workshops and Q&A with sustainability experts.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['sustainability', 'environment', 'zerowaste', 'lifestyle']),
      capacity: 30,
      attendees: 14,
      status: 'live',
      isSuperhost: false,
      hostId: host.id,
    },
    {
      title: 'Stand-Up Comedy Open Mic',
      slug: 'standup-comedy-open-mic-s10',
      type: 'entertainment',
      category: 'comedy',
      date: new Date('2026-05-28T19:30:00'),
      time: '7:30 PM',
      venue: 'Canvas Laugh Club, Select Citywalk',
      city: 'Delhi',
      price: 349,
      isFree: false,
      description: 'Delhi\'s favourite weekly open mic night — 20+ comedians, audience participation, and guaranteed laughs. Doors open at 7 PM. Get there early for the best seats!',
      image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80',
      tags: JSON.stringify(['comedy', 'standup', 'openmic', 'entertainment', 'nightout']),
      capacity: 150,
      attendees: 67,
      status: 'live',
      isSuperhost: true,
      hostId: host.id,
    },
  ];

  for (const eventData of events) {
    const event = await prisma.event.upsert({
      where: { slug: eventData.slug },
      update: {},
      create: eventData,
    });
    console.log(`[Seed] Event created: "${event.title}"`);
  }

  console.log('[Seed] Done! 10 events seeded.');
}

main()
  .catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

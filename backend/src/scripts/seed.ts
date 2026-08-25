/**
 * Seed script — populates a fresh database with enough data to actually use the app.
 *
 * Run with:  npm run seed          (from backend/)
 *        or: npx prisma db seed
 *
 * Idempotent: every write is an upsert, so re-running is safe.
 *
 * Two things this script deliberately gets right, because the app breaks otherwise:
 *
 *  1. Event dates are computed relative to "now", never hardcoded. GET /api/events
 *     filters on `date >= now` (backend/src/routes/events.ts), so a seed with fixed
 *     dates silently stops working the moment those dates pass — /discover just
 *     renders empty.
 *
 *  2. Categories come from the seven values the UI actually filters on
 *     (frontend/app/discover/page.tsx CATEGORY_MAP). Any other value renders but
 *     is invisible to every category pill.
 */

import '../lib/loadEnv';

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// A dedicated client rather than lib/prisma — that one enables full query logging
// when NODE_ENV=development, which buries the credentials this script prints.
const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ─── Dev credentials ──────────────────────────────────────────────────────────
// Not secrets. These exist so a new contributor can log in within seconds of
// cloning. Never reuse this password anywhere real.
const DEV_PASSWORD = 'upsosh123';

const USERS = [
  {
    id: 'seed-user-admin',
    email: 'admin@upsosh.test',
    username: 'ada-admin',
    name: 'Ada Admin',
    role: 'admin',
    hostStatus: 'verified',
    city: 'Delhi',
    bio: 'Platform administrator.',
    label: 'Admin — can reach /admin/payments and the host-approval endpoints',
  },
  {
    id: 'seed-user-host',
    email: 'host@upsosh.test',
    username: 'hari-host',
    name: 'Hari Host',
    role: 'host',
    hostStatus: 'verified',
    city: 'Delhi',
    bio: 'Runs weekend supper clubs and morning run crews across South Delhi.',
    label: 'Host — owns the seeded events, can create more',
  },
  {
    id: 'seed-user-regular',
    email: 'user@upsosh.test',
    username: 'riya-regular',
    name: 'Riya Regular',
    role: 'user',
    hostStatus: 'none',
    city: 'Delhi',
    bio: 'Here for the run clubs and the dinner parties.',
    label: 'Attendee — use this one to test the booking flow',
  },
] as const;

// ─── Hosts ────────────────────────────────────────────────────────────────────
// Nothing else in the codebase creates Host rows, so without this the table stays
// empty forever and every event.host comes back null.
const HOSTS = [
  {
    id: 'seed-host-1',
    name: 'Arjun Mehta',
    verified: true,
    avatar: 'https://ui-avatars.com/api/?name=Arjun+Mehta&background=D4FF3F&color=0A0A0B',
  },
  {
    id: 'seed-host-2',
    name: 'Sana Kapoor',
    verified: true,
    avatar: 'https://ui-avatars.com/api/?name=Sana+Kapoor&background=FF6F61&color=0A0A0B',
  },
  {
    id: 'seed-host-3',
    name: 'The Lodhi Collective',
    verified: false,
    avatar: 'https://ui-avatars.com/api/?name=Lodhi+Collective&background=34D399&color=0A0A0B',
  },
];

/** Midday-ish date `days` from now, at the given 24h hour. */
function daysFromNow(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function displayTime(hour: number, minute = 0): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

interface SeedEvent {
  slug: string;
  title: string;
  type: string;
  category: string;
  inDays: number;
  hour: number;
  minute?: number;
  venue: string;
  city: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  capacity: number;
  attendees: number;
  isSuperhost: boolean;
  hostId: string;
}

const EVENTS: SeedEvent[] = [
  {
    slug: 'sunday-run-club-lodhi-garden',
    title: 'Sunday Run Club at Lodhi Garden',
    type: 'informal',
    category: 'Run Club',
    inDays: 2,
    hour: 6,
    minute: 30,
    venue: 'Lodhi Garden, Gate 2',
    city: 'Delhi',
    price: 0,
    description:
      'A 5K social run through Lodhi Garden, followed by chai and idli at the gate. All paces welcome — we regroup at every kilometre. Bring water; we handle the rest.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200',
    tags: ['running', 'morning', 'fitness', 'free'],
    capacity: 30,
    attendees: 11,
    isSuperhost: true,
    hostId: 'seed-host-1',
  },
  {
    slug: 'supper-club-six-strangers',
    title: 'Supper Club — Six Strangers, One Table',
    type: 'informal',
    category: 'Dinner Club',
    inDays: 4,
    hour: 20,
    venue: 'A private home in Shahpur Jat',
    city: 'Delhi',
    price: 1450,
    description:
      'Six people who have never met, one long table, and a four-course Kashmiri menu cooked in front of you. Address is shared 24 hours before. Vegetarian option on request.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200',
    tags: ['dinner', 'intimate', 'kashmiri', 'supperclub'],
    capacity: 6,
    attendees: 4,
    isSuperhost: true,
    hostId: 'seed-host-2',
  },
  {
    slug: 'pottery-wheel-throwing-intro',
    title: 'Wheel Throwing for Absolute Beginners',
    type: 'formal',
    category: 'Workshop',
    inDays: 6,
    hour: 11,
    venue: 'Clay Studio, Hauz Khas Village',
    city: 'Delhi',
    price: 2200,
    description:
      'Three hours on the wheel with a working ceramicist. You will make two pieces, we fire and glaze them, and you collect them a fortnight later. Clay, tools and apron included.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=1200',
    tags: ['pottery', 'craft', 'hands-on', 'beginners'],
    capacity: 10,
    attendees: 6,
    isSuperhost: false,
    hostId: 'seed-host-3',
  },
  {
    slug: 'book-club-god-of-small-things',
    title: 'Book Circle — The God of Small Things',
    type: 'informal',
    category: 'Book Club',
    inDays: 8,
    hour: 17,
    venue: 'Bahrisons Booksellers, Khan Market',
    city: 'Delhi',
    price: 0,
    description:
      'Monthly book circle. This month: Arundhati Roy. Read it or don\'t — we brief you in the first ten minutes either way. Coffee is on the house, opinions are not.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1200',
    tags: ['books', 'discussion', 'literature', 'free'],
    capacity: 20,
    attendees: 9,
    isSuperhost: false,
    hostId: 'seed-host-1',
  },
  {
    slug: 'creator-meetup-first-thousand',
    title: 'Creator Meetup — Your First 1,000 Followers',
    type: 'formal',
    category: 'Meetup',
    inDays: 11,
    hour: 18,
    minute: 30,
    venue: 'WeWork Galaxy, Nehru Place',
    city: 'Delhi',
    price: 499,
    description:
      'Four creators between 5K and 200K break down exactly what worked, with real analytics on screen. Ninety minutes of talks, sixty of open networking. No pitching from stage.',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1200',
    tags: ['creators', 'networking', 'content', 'growth'],
    capacity: 80,
    attendees: 41,
    isSuperhost: true,
    hostId: 'seed-host-2',
  },
  {
    slug: 'sunrise-yoga-rooftop-saket',
    title: 'Sunrise Yoga on a Saket Rooftop',
    type: 'informal',
    category: 'Fitness',
    inDays: 13,
    hour: 6,
    venue: 'Rooftop, Saket District Centre',
    city: 'Delhi',
    price: 350,
    description:
      'Sixty minutes of slow vinyasa as the sun comes up over South Delhi, finishing with ten minutes of stillness and a cup of kadha. Mats provided. Come as you are.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    tags: ['yoga', 'sunrise', 'wellness', 'rooftop'],
    capacity: 18,
    attendees: 7,
    isSuperhost: false,
    hostId: 'seed-host-3',
  },
  {
    slug: 'night-photo-walk-old-delhi',
    title: 'Night Photo Walk — Old Delhi',
    type: 'informal',
    category: 'Social',
    inDays: 16,
    hour: 19,
    minute: 30,
    venue: 'Chandni Chowk Metro, Gate 3',
    city: 'Delhi',
    price: 750,
    description:
      'Three hours through Khari Baoli and the lanes behind Jama Masjid with a working photojournalist. Low-light technique, street etiquette, and where to actually stand. Any camera, phones included.',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1200',
    tags: ['photography', 'old-delhi', 'night', 'walking'],
    capacity: 12,
    attendees: 8,
    isSuperhost: false,
    hostId: 'seed-host-1',
  },
  {
    slug: 'saturday-trail-run-aravalli',
    title: 'Saturday Trail Run — Aravalli Biodiversity Park',
    type: 'informal',
    category: 'Run Club',
    inDays: 19,
    hour: 6,
    minute: 15,
    venue: 'Aravalli Biodiversity Park, Gurugram Gate',
    city: 'Gurugram',
    price: 0,
    description:
      'An 8K trail loop on soft ground, led by two pacers so nobody runs alone. Some elevation, plenty of shade. Breakfast afterwards for whoever is still standing.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1200',
    tags: ['trail', 'running', 'gurugram', 'free'],
    capacity: 25,
    attendees: 13,
    isSuperhost: true,
    hostId: 'seed-host-1',
  },
  {
    slug: 'letterpress-print-workshop',
    title: 'Letterpress Printing — Make Your Own Cards',
    type: 'formal',
    category: 'Workshop',
    inDays: 23,
    hour: 14,
    venue: 'Studio Anantaya, Mehrauli',
    city: 'Delhi',
    price: 1800,
    description:
      'Set type by hand, ink an antique platen press, and print a run of ten cards you take home the same afternoon. No design experience needed — the constraints do the work.',
    image: 'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=1200',
    tags: ['letterpress', 'print', 'craft', 'design'],
    capacity: 8,
    attendees: 3,
    isSuperhost: false,
    hostId: 'seed-host-3',
  },
  {
    slug: 'jazz-listening-session-khan-market',
    title: 'Jazz Listening Session — Blue Note in Full',
    type: 'informal',
    category: 'Social',
    inDays: 28,
    hour: 20,
    minute: 30,
    venue: 'The Piano Man, Safdarjung Enclave',
    city: 'Delhi',
    price: 900,
    description:
      'One album, start to finish, on a proper system, in the dark. We talk about it afterwards over a drink. This month: Kind of Blue. Phones stay in your pocket.',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&q=80&w=1200',
    tags: ['jazz', 'listening', 'music', 'evening'],
    capacity: 24,
    attendees: 15,
    isSuperhost: true,
    hostId: 'seed-host-2',
  },
];

async function main() {
  console.log('\n[Seed] Starting…\n');

  // ── Users ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  for (const u of USERS) {
    const { label, ...data } = u;
    await prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name, role: data.role, hostStatus: data.hostStatus, username: data.username },
      create: {
        ...data,
        password: passwordHash,
        onboardingComplete: true,
        interests: JSON.stringify(['Run Club', 'Workshop', 'Dinner Club']),
        wantsToHost: data.role === 'host',
      },
    });
    console.log(`[Seed] User      ${data.email.padEnd(22)} (${data.role})`);
  }

  // ── Hosts ──────────────────────────────────────────────────────────────────
  for (const h of HOSTS) {
    await prisma.host.upsert({ where: { id: h.id }, update: {}, create: h });
    console.log(`[Seed] Host      ${h.name}${h.verified ? ' ✓' : ''}`);
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  // userId points at the host user so GET /api/events/host/mine returns these.
  const hostUser = await prisma.user.findUniqueOrThrow({ where: { email: 'host@upsosh.test' } });

  for (const e of EVENTS) {
    const { inDays, hour, minute = 0, tags, ...rest } = e;
    const date = daysFromNow(inDays, hour, minute);

    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { date, status: 'live' },
      create: {
        ...rest,
        date,
        time: displayTime(hour, minute),
        isFree: e.price === 0,
        tags: JSON.stringify(tags),
        status: 'live',
        userId: hostUser.id,
      },
    });

    const when = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const cost = e.price === 0 ? 'Free' : `₹${e.price.toLocaleString('en-IN')}`;
    console.log(`[Seed] Event     ${when.padEnd(14)} ${cost.padEnd(8)} ${e.title}`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const [userCount, hostCount, eventCount] = await Promise.all([
    prisma.user.count(),
    prisma.host.count(),
    prisma.event.count({ where: { status: 'live' } }),
  ]);

  const line = '─'.repeat(64);
  console.log(`\n${line}`);
  console.log(`  Seeded: ${userCount} users · ${hostCount} hosts · ${eventCount} live events`);
  console.log(line);
  console.log('\n  LOG IN WITH ANY OF THESE (password is the same for all three):\n');
  for (const u of USERS) {
    console.log(`    ${u.email.padEnd(22)} ${DEV_PASSWORD}`);
    console.log(`      ${u.label}`);
  }
  console.log(`\n${line}\n`);
}

main()
  .catch((err) => {
    console.error('[Seed] Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

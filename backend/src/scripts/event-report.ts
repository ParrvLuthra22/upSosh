/**
 * READ-ONLY diagnostic: why does GET /api/events return nothing?
 *
 * Run with:
 *   DATABASE_URL="<railway public url>" npm run event-report --workspace=upsosh-backend
 *
 * Only issues count / groupBy / findMany(select). No writes, no deletes, and no
 * user data — events are reported by id, title, status, date and city only.
 *
 * Deliberately does NOT import lib/loadEnv: DATABASE_URL must be passed on the
 * command line so this can never silently fall back to a local .env database.
 */

import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Pass it inline, e.g. DATABASE_URL="postgresql://..." npm run event-report');
  process.exit(1);
}

const prisma = new PrismaClient({ log: ['error'] });

async function main(): Promise<void> {
  // Host only — never print the credentials.
  try {
    const u = new URL(url as string);
    console.log(`Database host: ${u.hostname}:${u.port || '(default)'}  db: ${u.pathname.slice(1)}`);
  } catch {
    console.log('Database host: (could not parse DATABASE_URL)');
  }

  const now = new Date();
  console.log(`Now (server clock): ${now.toISOString()}\n`);

  const total = await prisma.event.count();
  console.log(`Total events: ${total}`);

  const byStatus = await prisma.event.groupBy({ by: ['status'], _count: { _all: true } });
  console.log('\nBy status:');
  if (byStatus.length === 0) console.log('  (none)');
  for (const row of byStatus) console.log(`  ${row.status.padEnd(10)} ${row._count._all}`);

  const [future, past] = await Promise.all([
    prisma.event.count({ where: { date: { gte: now } } }),
    prisma.event.count({ where: { date: { lt: now } } }),
  ]);
  console.log(`\nBy date:\n  future (date >= now) ${future}\n  past   (date <  now) ${past}`);

  const visible = await prisma.event.count({
    where: { status: { in: ['live', 'full'] }, date: { gte: now } },
  });
  console.log(`\nVisible to GET /api/events (live|full AND date >= now): ${visible}`);

  const events = await prisma.event.findMany({
    select: { id: true, title: true, status: true, date: true, city: true },
    orderBy: { date: 'asc' },
  });
  console.log('\nEvents:');
  if (events.length === 0) console.log('  (none)');
  for (const e of events) {
    const flag = e.status !== 'live' && e.status !== 'full' ? ' [hidden: status]' : e.date < now ? ' [hidden: past]' : '';
    console.log(`  ${e.id} | ${e.title} | ${e.status} | ${e.date.toISOString()} | ${e.city}${flag}`);
  }
}

main()
  .catch((err: unknown) => {
    console.error('event-report failed:', err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

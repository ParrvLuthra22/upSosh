#!/usr/bin/env node
/**
 * One-command local setup: env files → migrations → seed.
 *
 * Run with:  npm run setup
 *
 * Safe to re-run. Existing .env files are never overwritten, and the seed
 * upserts rather than inserting.
 */

import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

let step = 0;
const heading = (msg) => console.log(`\n${bold(`[${++step}/4] ${msg}`)}`);

function die(msg, hint) {
  console.error(`\n${red('✖ ' + msg)}`);
  if (hint) console.error(dim('  ' + hint));
  process.exit(1);
}

// ── 1. Node version ──────────────────────────────────────────────────────────
heading('Checking Node version');
const major = Number(process.versions.node.split('.')[0]);
if (major < 20) {
  die(`Node ${process.versions.node} is too old — this project needs Node 20 or newer.`);
}
console.log(green(`  ✓ Node ${process.versions.node}`));

// ── 2. Env files ─────────────────────────────────────────────────────────────
heading('Setting up .env files');
const created = [];
for (const ws of ['backend', 'frontend']) {
  const target = join(root, ws, '.env');
  const example = join(root, ws, '.env.example');
  if (existsSync(target)) {
    console.log(dim(`  · ${ws}/.env already exists — left untouched`));
  } else if (existsSync(example)) {
    copyFileSync(example, target);
    created.push(ws);
    console.log(green(`  ✓ created ${ws}/.env from .env.example`));
  } else {
    die(`${ws}/.env.example is missing.`);
  }
}

// If Postgres was started on a non-default port (POSTGRES_PORT=5433 docker
// compose up -d), carry that through to a freshly created backend/.env.
// Without this you would have to hand-edit a file that did not exist yet when
// you chose the port.
const pgPort = process.env.POSTGRES_PORT;
if (pgPort && pgPort !== '5432' && created.includes('backend')) {
  const envPath = join(root, 'backend', '.env');
  const before = readFileSync(envPath, 'utf8');
  const after = before.replace(/(DATABASE_URL\s*=\s*['"]?postgresql:\/\/[^'"\n]*?localhost:)5432/, `$1${pgPort}`);
  if (after !== before) {
    writeFileSync(envPath, after);
    console.log(green(`  ✓ pointed DATABASE_URL at localhost:${pgPort} (POSTGRES_PORT)`));
  }
}

// Warn about placeholders that cause silent, confusing failures later.
const backendEnv = readFileSync(join(root, 'backend', '.env'), 'utf8');
if (/JWT_SECRET\s*=\s*"?your-super-secure/.test(backendEnv)) {
  console.log(yellow('  ! JWT_SECRET is still the placeholder — fine for local dev, never for deploy.'));
}
const frontendEnv = readFileSync(join(root, 'frontend', '.env'), 'utf8');
if (/NEXT_PUBLIC_RAZORPAY_KEY_ID\s*=\s*(rzp_test_xxx|\s*$)/m.test(frontendEnv)) {
  console.log(yellow('  ! NEXT_PUBLIC_RAZORPAY_KEY_ID is unset/placeholder.'));
  console.log(yellow('    Paid bookings will SKIP payment and complete for free until you set a real test key.'));
}

// ── 3. Migrations ────────────────────────────────────────────────────────────
heading('Applying database migrations');
const dbUrl = (backendEnv.match(/^DATABASE_URL\s*=\s*['"]?([^'"\n]+)/m) || [])[1] || '';
console.log(dim(`  · target: ${dbUrl.replace(/\/\/[^@]*@/, '//***:***@') || '(not set)'}`));

try {
  execSync('npx prisma migrate deploy', {
    cwd: join(root, 'backend'),
    stdio: 'inherit',
  });
} catch {
  const port = (dbUrl.match(/localhost:(\d+)/) || [])[1] || '5432';
  console.error(`\n${red('✖ Migrations failed.')}`);
  console.error(dim('  Most likely one of these:'));
  console.error(dim(`  1. Postgres isn't running        →  docker compose up -d`));
  console.error(dim(`  2. Something ELSE is on :${port}    →  a different project's Postgres will accept the`));
  console.error(dim(`                                       connection and then reject the password, which is why`));
  console.error(dim(`                                       this often shows as "authentication failed".`));
  console.error(dim(`                                       Fix: POSTGRES_PORT=5433 docker compose up -d`));
  console.error(dim(`                                            POSTGRES_PORT=5433 npm run setup`));
  console.error(dim(`  3. DATABASE_URL in backend/.env is wrong for your setup.`));
  process.exit(1);
}

// ── 4. Seed ──────────────────────────────────────────────────────────────────
heading('Seeding sample data');
try {
  execSync('npx prisma db seed', { cwd: join(root, 'backend'), stdio: 'inherit' });
} catch {
  die('Seeding failed.', 'See the error above.');
}

console.log(`\n${green(bold('Setup complete.'))} Start both servers with:  ${bold('npm run dev')}\n`);

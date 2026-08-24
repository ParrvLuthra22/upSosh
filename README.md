# upSosh

A booking platform for premium micro-events — run clubs, supper clubs, workshops, book circles. Hosts list an event, attendees browse and book, payment goes through Razorpay, and a QR ticket lands in the attendee's inbox.

This is an npm-workspaces monorepo: a Next.js frontend and a separate Express API, sharing one Postgres database.

---

## Stack

| | |
|---|---|
| **Frontend** | Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Zustand · Framer Motion |
| **Backend** | Express 4 · TypeScript · Prisma 6 · PostgreSQL |
| **Auth** | Custom JWT — bcrypt hashing, httpOnly cookies |
| **Payments** | Razorpay (order creation + server-side signature verification) |
| **Email** | Resend |
| **Images** | Cloudinary |
| **AI planner** | OpenRouter (`google/gemini-2.0-flash-001`) |
| **Hosting** | Backend on Railway; frontend on Vercel |

```
upSosh/
├── backend/          Express API  → http://localhost:4000
│   ├── prisma/       schema + migrations
│   └── src/
│       ├── routes/   auth · users · events · hosts · bookings · payments · ai · uploads
│       ├── middleware/
│       └── scripts/seed.ts
├── frontend/         Next.js app  → http://localhost:3000
│   ├── app/          routes (App Router)
│   ├── components/
│   └── lib/
└── scripts/setup.mjs
```

---

## Prerequisites

- **Node 20+** (`node -v`) — the project is developed on Node 22
- **npm 10+** — comes with Node 20+
- **PostgreSQL 14+** — easiest via Docker, see below

Optional, only if you want those features to actually work: a Razorpay test account, a Resend API key, a Cloudinary account, an OpenRouter API key. Everything else runs without them.

---

## Local setup

Five commands from clone to running app.

### 1. Clone and install

```bash
git clone <your-repo-url> upSosh
cd upSosh
npm install
```

`npm install` installs both workspaces and runs `prisma generate` automatically.

### 2. Start Postgres

```bash
docker compose up -d
```

This runs Postgres 16 on port **5432** with user `postgres`, password `postgres`, database `upsosh` — matching the defaults in `backend/.env.example`.

> **Port 5432 already in use?** Another project's Postgres is the usual cause, and it fails confusingly — the other server accepts the connection and then rejects the password, so you get `authentication failed` rather than `can't connect`.
>
> Pick a free port and pass it to **both** commands. Step 3 picks it up automatically and writes it into `backend/.env` for you:
>
> ```bash
> POSTGRES_PORT=5433 docker compose up -d
> POSTGRES_PORT=5433 npm run setup     # ← step 3, same variable
> ```

<details>
<summary>Prefer a native Postgres install instead of Docker?</summary>

```bash
createdb upsosh
# then set DATABASE_URL in backend/.env to match your local role, e.g.
# DATABASE_URL="postgresql://$USER@localhost:5432/upsosh?schema=public"
```
</details>

### 3. Set up env files, migrate, and seed

```bash
npm run setup
```

This one command:
- copies `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env` (never overwriting an existing file)
- warns about placeholder values that cause confusing failures later
- runs `prisma migrate deploy`
- seeds 3 users, 3 hosts and 10 upcoming events

<details>
<summary>Or do it manually</summary>

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run db:migrate
npm run db:seed
```
</details>

### 4. Add a Razorpay test key

Open `frontend/.env` and set:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
```

Get one from [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys, and put the matching **secret** in `backend/.env` as `RAZORPAY_KEY_SECRET`.

> ⚠️ **This is not optional if you plan to touch the booking flow.** With `NEXT_PUBLIC_RAZORPAY_KEY_ID` unset, the checkout does not fail — it silently skips payment and jumps to the confirmation screen, creating a confirmed booking that was never paid for. You can browse and use the rest of the app without it; just don't trust a booking made in that state.

### 5. Run it

```bash
npm run dev
```

| | |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| Health check | http://localhost:4000/health |

Run the two servers separately if you prefer: `npm run dev:backend` and `npm run dev:frontend`.

---

## Test accounts

Created by the seed. Password is the same for all three: **`upsosh123`**

| Email | Role | Use it to |
|---|---|---|
| `user@upsosh.test` | attendee | Browse and book — **start here** |
| `host@upsosh.test` | host | Create and manage events; owns the 10 seeded ones |
| `admin@upsosh.test` | admin | Reach admin-only endpoints |

The seed prints these at the end of every run, so you never have to come back here for them.

---

## Testing a payment

Sign in as `user@upsosh.test`, open any **paid** event from `/discover` (the free ones skip checkout entirely), and book it. When the Razorpay modal opens:

| Field | Value |
|---|---|
| Card number | `4111 1111 1111 1111` |
| Expiry | any future date, e.g. `12/30` |
| CVV | any 3 digits, e.g. `123` |
| Name | anything |
| OTP | `1111` on the simulated bank page |

Then check `/my-bookings` — the booking should read *confirmed* with a scannable QR code.

Test cards only work with a `rzp_test_` key. Full list: [razorpay.com/docs/payments/payments/test-card-details](https://razorpay.com/docs/payments/payments/test-card-details/).

To test webhooks locally you need a public URL:

```bash
npx localtunnel --port 4000
# point the Razorpay dashboard webhook at https://<url>/api/payments/webhook
# and set RAZORPAY_WEBHOOK_SECRET in backend/.env to match
```

---

## Common commands

| Command | What it does |
|---|---|
| `npm run dev` | Both servers, one terminal |
| `npm run dev:backend` / `npm run dev:frontend` | One at a time |
| `npm run build` | Production build of both workspaces |
| `npm run setup` | Env files + migrate + seed (safe to re-run) |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Re-seed (upserts, so it's safe) |
| `npm run db:studio` | Prisma Studio — browse the database in a GUI |
| `docker compose down -v` | Wipe the database completely |

**Starting over from scratch:**

```bash
docker compose down -v && docker compose up -d && npm run setup
```

---

## Environment variables

Two files, two audiences. **`backend/.env` holds every secret. `frontend/.env` holds nothing secret** — Next.js inlines `NEXT_PUBLIC_*` into the browser bundle, so anything there is public by definition.

See `backend/.env.example` and `frontend/.env.example` for the annotated list. The ones that matter most:

| Variable | Where | Required | Notes |
|---|---|---|---|
| `DATABASE_URL` | backend | **yes** | Postgres connection string |
| `JWT_SECRET` | backend | **yes** | Change it before deploying anywhere |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | backend | for payments | The secret must never reach the frontend |
| `RAZORPAY_WEBHOOK_SECRET` | backend | for webhooks | |
| `RESEND_API_KEY` | backend | for email | Without it, emails are skipped with a warning |
| `CLOUDINARY_*` | backend | for uploads | Without them, uploads return 503 |
| `OPENROUTER_API_KEY` | backend | for `/planner` | Without it, the AI planner returns 503 |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | frontend | **yes** | See the warning in step 4 |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | yes | `http://localhost:4000` locally |

`frontend/.env.production` is **not** tracked in git. Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_FRONTEND_URL` in your host's dashboard instead. For reference, production uses:

```
NEXT_PUBLIC_API_URL=https://upsosh-production.up.railway.app/api
NEXT_PUBLIC_BACKEND_URL=https://upsosh-production.up.railway.app
NEXT_PUBLIC_FRONTEND_URL=https://www.upsosh.app
```

---

## Deployment

**Backend → Railway.** `railway.toml` is the single source of truth. Every deploy runs `prisma migrate deploy` before starting the server, so the schema can never drift from the repo. Health check is `GET /health`.

> **One-time step for the existing production database.** The migration history was rebuilt into a single baseline (`20260824040153_init`) because the previous three migrations could not apply in order. The live database already has these tables, so tell Prisma the baseline is already applied — otherwise the next deploy tries to `CREATE TABLE` over existing tables and fails:
>
> ```bash
> cd backend && npx prisma migrate resolve --applied 20260824040153_init
> ```
>
> Run this **once**, against production, before the first deploy after this change. New/empty databases need nothing.

**Frontend → Vercel.** Root directory `frontend`, build `npm run build`, output `.next`. Set the three `NEXT_PUBLIC_*` variables above plus `NEXT_PUBLIC_RAZORPAY_KEY_ID` in the project settings.

---

## Troubleshooting

**`Can't reach database server at localhost:5432`**
Postgres isn't running, or it's on another port. `docker compose ps` to check; see the port note in step 2.

**`relation "User" does not exist`**
Migrations haven't run. `npm run db:migrate`.

**`/discover` is empty**
The API only returns events with `status: 'live'` **and a future date**. Re-run `npm run db:seed` — it recomputes all dates relative to now.

**Bookings complete without a payment screen**
`NEXT_PUBLIC_RAZORPAY_KEY_ID` is unset in `frontend/.env`. See step 4.

**Changed a `NEXT_PUBLIC_*` variable and nothing happened**
Those are inlined at build time. Restart the dev server.

**`Port 3000 already in use`**
`npm run dev:frontend -- --port 3001`.

---

## Project status

Actively being cleaned up. `FIXPLAN.md` at the repo root tracks the work in six phases, with each task anchored to a specific file and line. `AUDIT.md` is the analysis it came from. If you're picking something up, start there.

# upSosh backend audit (read-only)

Date: 2026-10-21. Scope: `backend/` plus the frontend pieces that touch it. No code was changed, nothing was committed, and no hosted database was contacted.

**How it was checked**
- Every route file in `backend/src/routes`, the middleware, `index.ts`, the schema and all migrations were read.
- Findings tagged **[RAN]** were reproduced with a throwaway script (kept outside the repo) against a scratch Postgres on `localhost:5433`. The script refused to start unless the `DATABASE_URL` host was localhost.
- Findings tagged **[CODE]** are from reading the code only.
- Findings tagged **[UNVERIFIED]** depend on production configuration I cannot see.
- No secret values are printed here.

**Summary:** 0 Critical, 5 High, 12 Medium, ~12 Low. The five Highs are launch blockers for real money.

---

## 1. Authentication

| ID | Sev | Finding |
|---|---|---|
| AUTH-1 | **High** | **The auth rate limiter also throttles `GET /api/auth/me`.** `index.ts:82-90` allows 10 requests per 15 min per IP and `index.ts:151` mounts it on all of `/api/auth`. The frontend calls `/me` on every session restore (`lib/stores/auth.ts:252`). **[RAN]** The 11th `/api/auth` call from one IP got 429. Related **[UNVERIFIED]**: with `trust proxy = 1` (`index.ts:52`) behind a Vercel rewrite and then Render, `req.ip` is probably Vercel's egress IP, so every user would share one bucket. In that case 10 auth calls site-wide per 15 min lock everyone out (global limiter: 100 per 15 min, same issue). **Fix:** limit only signin, signup, forgot, reset and google. Give `/me` a loose limiter. Key on the real client IP (first `X-Forwarded-For` entry, or `trust proxy 2` if that is the hop count) and on email for login. **Check:** from two networks, `curl -si <site>/api/events | grep -i ratelimit-remaining`. If the counter is shared, this is live. |
| AUTH-2 | Medium | **No fail-fast on env.** `JWT_SECRET` is only read at request time (`middleware/auth.ts:17-18`, `auth.ts:27-31`). If it is missing, every authed call returns 401 and signup/signin return 500, with no boot error. There is no minimum length, and the `.env.example` placeholder would be accepted. If `NODE_ENV` is not exactly `production` on Render, cookies silently become `secure:false; SameSite=Lax` (`auth.ts:20-25`) and the reset link is logged (`auth.ts:263-265`). **Fix:** validate env with zod at boot and exit on failure (secret at least 32 chars, not a placeholder, `NODE_ENV` set, Razorpay and webhook keys present). |
| AUTH-3 | Medium | **Sessions can't be revoked.** **[RAN]** After `reset-password`, the old JWT still returned 200 on `/me`. Change-password (`users.ts:60`) and signout also leave tokens valid for 7 days. **Fix:** add `tokenVersion` or `passwordChangedAt` and check it in `requireAuth`. |
| AUTH-4 | Medium | **Pre-account-takeover via Google linking [CODE].** Signup has no email verification (`auth.ts:58-72`). An attacker registers `victim@gmail.com` with their own password. When the victim later clicks "Continue with Google", the code links `googleId` onto that account (`auth.ts:203-205`), and the attacker's password still works. **Fix:** verify email at signup. When linking Google onto a password account, require email verification or wipe the old password. |
| AUTH-5 | Medium | **Google sign-in breaks after account deletion [CODE].** `DELETE /me` anonymises the email but keeps `googleId` (`users.ts:100-113`). Signing in with Google again looks up by email, finds nothing, tries to create a user with the same unique `googleId`, and returns 500. **Fix:** null `googleId` on delete. |
| AUTH-6 | Low | **CSRF is blocked only by accident.** Production cookies are `SameSite=None` (`auth.ts:23`) and `express.urlencoded` is enabled (`index.ts:131`), so a cross-site form post could reach handlers. **[RAN]** The CORS callback rejected disallowed `Origin` values with 403 (`evil.example` and `null`). A request with **no** `Origin` header got 200. Browsers send `Origin` on cross-site POSTs, so this holds today, but it is incidental. **Fix:** add an explicit `Origin`/`Sec-Fetch-Site` check on non-GET requests, remove the urlencoded parser, and prefer `SameSite=Lax` where the proxy is used. Direct-to-Render calls exist (`app/admin/hosts/page.tsx:23`), which is why `None` is needed today, and Safari blocks third-party cookies. |
| AUTH-7 | Low | Enumeration and hygiene. Signup says "already exists" (`auth.ts:59-61`). Signin reveals Google-only accounts (`99-101`). Forgot-password timing differs. The JWT is also returned in the JSON body (`77,111,224`). Passwords have no maximum (bcrypt truncates at 72 bytes). Signup/username races return 500 on a unique violation (`auth.ts:36-72`). |

**Checked, no issue:**
- bcrypt cost 12.
- Reset tokens are 32 random bytes, stored as SHA-256, valid for 1 hour, and single-use (tested).
- The Google flow verifies the ID token with audience and `email_verified`.
- Deleted users are rejected in `requireAuth`.
- Signin returns a generic message for a wrong password.
- JWT verify uses a string secret, so only HMAC algorithms are accepted.

## 2. Authorization (every route)

| Route | Gate | Verdict |
|---|---|---|
| `POST /bookings`, `GET /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/cancel` | auth; own or admin | OK (IDOR tested) |
| `POST /payments/create-order`, `/verify` | auth; own booking | OK |
| `POST /payments/webhook` | HMAC signature | OK |
| `GET /events`, `GET /events/:slug`, `GET /hosts/:id`, `GET /users/:username` | public | OK, minor Low items below |
| `POST /events` | verified host or admin | OK |
| `PUT/DELETE /events/:id`, `GET /events/:id/attendees`, `PATCH .../checkin`, `POST .../announce` | owner or admin | OK |
| `/hosts/admin/*` | manual `role === 'admin'` in each handler | OK |
| `/uploads`, `/users/me/avatar`, `/ai/plan` | auth | OK |
| `/notifications` | own only | OK |

I found no way for a user to read or change another user's bookings, tickets, attendees, host applications or uploads. Findings:

| ID | Sev | Finding |
|---|---|---|
| AZ-1 | Medium | **Any verified host can set `isSuperhost: true`** on their own events (`schemas.ts:68,91`). `sort=relevance` ranks those first (`events.ts:103`). This is a self-awarded trust badge. **Fix:** admin-only field. |
| AZ-2 | Medium | **Phishing relay through booking emails.** `guestName`, `guestEmail` and event title/venue are interpolated **unescaped** into the confirmation email (`email.ts:53,83,84,101,127`). Only the announcement email escapes. Any signed-up user can book a free event, or an event-less booking (see PAY-7), with `guestEmail=<victim>` and HTML in `guestName`. The branded mail goes out from `bookings@upsosh.app`. Hosts can also send arbitrary text to all attendees with no cooldown (`events.ts:347-376`). **Fix:** `escapeHtml` everywhere, require `eventId`, cap announcements per event per day. |
| AZ-3 | Low | A verified host who re-applies is demoted to `pending` (`hosts.ts:57-60`). Approving an admin's application sets their role to `host` (`114-117`). |
| AZ-4 | Low | Check-in works on unpaid or cancelled bookings (`events.ts:333-338`). The attendee list and announcements include unpaid `pending` and `failed` bookings (`299,360`). `guestCount` isn't shown to the host. |
| AZ-5 | Low | `GET /events/:slug` returns drafts and cancelled events (`events.ts:183`). `GET /users/:username` doesn't filter deleted users. |
| PRIV-1 | Medium **[UNVERIFIED]** | Host `govIdUrl` and `selfieUrl` are free strings (`schemas.ts:130-131`). If they come from `/api/uploads`, the images are public Cloudinary URLs (`cloudinary.ts:32`, default public type). They are never deleted on account deletion (`users.ts`), and the host application row is kept. Questions for you below. |

## 3. Payments (re-verified, not assumed)

**Checked, no issue:**
- The amount comes from the server booking row (`payments.ts:83`); a client amount is ignored (tested).
- Order-to-booking binding is the unique `razorpayOrderId`, checked in `/verify` (`157`).
- A cross-booking replay is rejected (tested). `/verify` is idempotent (conditional `updateMany`).
- The webhook uses the raw body (`index.ts:~121`), a timing-safe compare (`50-55`) and an unconditional secret check that fails closed (`268`).
- `payment.captured` is idempotent: a duplicate delivery is a no-op and doesn't double-increment seats.

| ID | Sev | Finding |
|---|---|---|
| PAY-1 | **High** | **Customer charged, no ticket, after one failed attempt.** `payment.failed` sets the booking to `failed` (`payments.ts:358-368`). Razorpay lets the user retry on the same order. A later success is ignored: the webhook only matches `unpaid` (`313`) and `/verify` returns 409 for `failed` (`169-171`). **[RAN]** Sequence failed, then captured: the booking stayed `failed`/`pending` and `/verify` returned 409 "Cannot pay a booking in state failed". **Fix:** accept `unpaid` and `failed` in both paths, or don't write `failed` until the order expires. |
| PAY-2 | **High** | **A second `create-order` strands the first.** It overwrites `razorpayOrderId` (`98-101`). Double-click, two tabs or a retry means paying the earlier order fails `/verify` (400) and the webhook can't find the booking (`310`). **[RAN]** `/verify` for the replaced order returned 400, booking unpaid. **Fix:** reuse an open order for the same amount, or store all order ids and resolve by order id or `receipt`. |
| PAY-3 | **High** | **Paying after the hold expires resurrects the booking and oversells.** `create-order` doesn't check `status` (`77`). `/verify` and the webhook flip `expired` or `cancelled` bookings to `confirmed` and increment `attendees` with no capacity check (`166-203`, `309-323`). **[RAN]** An `expired` booking on a full event (capacity 1) was confirmed and `attendees=2`. The 15-minute sweep makes this routine (a user who pauses on the checkout). **Fix:** in the paid transaction, lock the event row and recheck capacity. If there is no room, refund via Razorpay and mark `refunded`. Also refuse `create-order` unless the booking is `pending`/`unpaid` and unexpired. |
| PAY-4 | **High** | **You can book and pay for a cancelled, draft or past event.** `POST /bookings` never checks event `status` or `date` (`bookings.ts:62-98`). **[RAN]** All three returned 201 for a paid event. **Fix:** require `status in (live)` and `date > now` inside the locked transaction. |
| PAY-5 | Medium | **Refund path.** The refund is issued before the DB claim (`bookings.ts:239-271`). If the claim then fails (409/500), money is refunded but the booking stays confirmed, and a retry hits Razorpay's "already refunded" and fails forever. There is no cancellation cutoff, so a paid booking can be cancelled after the event or after check-in for a full refund including the fee. `refund.processed` (`payments.ts:370-381`) sets `paymentStatus` only, not `status`, and doesn't release seats, so dashboard refunds leave a valid ticket. **Fix:** claim in the DB first (a `refund_pending` state), handle "already refunded", add a cutoff, and make the webhook cancel and release seats. |
| PAY-6 | Medium | **No refunds when money is already held [CODE].** `DELETE /me` cancels paid bookings with no refund (`users.ts:76-99`). `DELETE /events/:id` just sets `cancelled` and leaves paid bookings (`events.ts:262-284`). |
| PAY-7 | Medium | **Free bookings are stored as paid ₹25 [RAN].** Introduced by the guestCount change (`bookings.ts:100-123`): a free event ×2 stored `paid`, `ticketPrice=0`, `platformFee=25`, `total=25`. Nothing is charged, but host revenue shows ₹25 per free booking. `eventId` is optional (`schemas.ts:97`), so an event-less booking is also stored `confirmed`/`paid`/₹25 and sends a confirmation email **[RAN]**. A host who sets `isFree:true` with `price>0` makes paid tickets free but still records the price as revenue (`schemas.ts:67`, `bookings.ts:90`) **[CODE]**. |
| PAY-8 | Low | The webhook doesn't cross-check the captured amount against the booking. Auto-capture is assumed (no `payment_capture` is set on the order). Money is stored as `Float` (`schema.prisma:149,189-191`). The webhook shares the 100-per-15-min IP limiter with everything else. |

## 4. Input validation

- **Routes with no zod schema:** `create-order` (`payments.ts:64`), `verify` (`124`), `forgot-password` (`auth.ts:234`), `google` (`159`, manual `typeof` check), `PATCH /users/me/password` (`users.ts:39`), `admin reject` (`hosts.ts:142`), all query strings.
- **Mass assignment:** none found. Writers use allow-listed zod objects (unknown keys are stripped), and `events.ts:218,243` spread zod output only. **Checked, no issue.**
- **Bad query values return 500, not 400 [RAN]:** `/api/events?limit=abc` and `?minPrice=abc` (`events.ts:51-52,76`), because `NaN` reaches Prisma. Low.
- **Unbounded fields (bounded only by the 100 kB body):** event title, description, venue and tags, host bios and links, `guestName`/`guestPhone`/`notes`.
- **Any URL scheme accepted:** `photoUrl` and event `image` (`schemas.ts:31,64,87`).
- **Unbounded lists:** `GET /bookings` (`bookings.ts:172`), `GET /hosts/:id` events, admin applications. The announce `Promise.all` has no concurrency cap.
- **Pagination:** the event list is capped at 100 (OK, apart from `NaN`).

## 5. Uploads and AI

- **Uploads:**
  - Auth is required, there is a 10 MB limit and a MIME allow-list. The MIME type is client-declared, but Cloudinary re-encodes the image.
  - **Medium:** there is no per-user quota or upload-specific rate limit. Signup is open with no email verification, so storage can be spammed (100 requests per 15 min per IP × 10 MB).
  - `uploads.ts:54` returns the raw error message to the client. Low.
  - `multer` has a known DoS advisory (see Dependencies).
- **AI:**
  - Auth is required, with a 10-per-hour per-user limiter (`ai.ts:20-39`), zod caps and `max_tokens: 2000`.
  - **Medium (cost):** the limiter's store is in memory (it resets on restart and multiplies per instance), and accounts are free to create. Add a global daily cap or an OpenRouter spend limit. The client has no timeout.
  - `components/host/AIAssistant.tsx:114` renders model output with `dangerouslySetInnerHTML` (self-XSS only, Low). The same file uses a legacy `localStorage` token (`:18`), so it is probably already broken.
  - FIXPLAN P4-62 says the hardcoded model returns 404 on OpenRouter. I did not re-verify this because it needs the live key.

## 6. HTTP hardening

**Checked, no issue:**
- `helmet` with a CSP (`index.ts:55-70`).
- The CORS allow-list has no wildcard with credentials (`96-114`).
- JSON and urlencoded bodies are capped at 100 kB (`130-131`).
- The error handler fails closed (`isDev` only for explicit `development`).

Notes:
- `trust proxy = 1` is probably the wrong hop count behind Vercel and then Render (see AUTH-1).
- The global limiter (`index.ts:94`) is mounted **before** `/health` and the webhook. **[UNVERIFIED, Medium]** Render's continuous health check and Razorpay retries share the 100-per-15-min bucket, so a 429 on `/health` could make Render mark the service unhealthy. **Fix:** mount `/health` and the webhook above the limiter.
- Only auth and AI have route-specific limits. There is nothing on `create-order`, booking creation or uploads.
- A user can hold seats without paying: up to 10 per event per 15 min, renewable, across events. With free signup this lets someone block sales. Cap concurrent unpaid holds per user.
- The global error handler returns `err.message` for any error with a status (`index.ts:186-190`). Only middleware errors reach it, so Low.

## 7. Data layer

- **Schema vs migrations: no drift [RAN].** `prisma migrate diff --from-migrations --to-schema-datamodel` against a local shadow database reported "No difference detected".
- **Migration safety:**
  - `20261020123406_add_booking_guest_count` is additive (`ADD COLUMN … NOT NULL DEFAULT 1`), so it is safe on a live DB.
  - `20260824184959_schema_hygiene…` drops three columns (`items`, `customer`, `paymentProof`) and casts text columns to enums with `USING …::"Enum"`. That cast fails on any row outside the enum. It is already in history, so it only matters if production never ran it. Check with `prisma migrate status`.
  - `npm run start` runs `prisma migrate deploy` on every boot (`package.json:7`), so a bad migration takes the service down on deploy. A pre-deploy step is safer.
- **Missing indexes (Medium).** `Booking` only has `(userId, createdAt)` and the unique order id. The hold aggregate (`bookings.ts:77-85`, which runs inside the event row lock), the attendee list, host stats and the 5-minute sweep (`index.ts:209`) all filter on `eventId` or `(paymentStatus, status, createdAt)` and scan. **Fix:** `@@index([eventId, paymentStatus, status])` and `@@index([status, paymentStatus, createdAt])`.
- **Deletion and retention:** soft delete keeps `HostApplication` (gov ID/selfie URLs), `Upload` rows, `hostBio` and links, `googleId`, `username`, and the guest name/email/phone on bookings. Hosted events stay live and bookable after the host deletes their account.
- **Races beyond bookings:** username generation is check-then-create (`auth.ts:36-72`), so concurrent signups return 500. Everything else involving seats now goes through the row lock or conditional claims.
- Money columns are `Float`.

## 8. Operations

- **Expiry sweep:** safe with two instances (an idempotent `updateMany`) and across restarts (it runs at boot, then every 5 min). It doesn't expire `failed` bookings, which then linger as `pending` in host attendee lists. The sweep racing a late payment is PAY-3.
- **`/health`:** public, pings the DB, and returns 503 on failure. Good, apart from the limiter order above.
- **Logging:** the reset URL is logged when `NODE_ENV !== 'production'` (`auth.ts:263-265`). Recipient emails are logged (`email.ts:160,282`). `backend/make-admin.js` prints the **whole user row including the password hash**. Prisma query logging is development-only.
- **Missing env in production:** nothing fails at boot (AUTH-2). A missing `RESEND_API_KEY` silently skips every confirmation email (`email.ts` early return). Razorpay returns 503 at request time. The webhook returns 500.
- **Seed script (High-risk operationally):** `src/scripts/seed.ts` has no production guard. Its env loader reads `backend/.env`, which points at the hosted database. Running `npm run seed` locally, or `prisma migrate reset` / `db seed`, would create `admin@upsosh.test` with the known dev password (`seed.ts:30-45`). It doesn't delete data. The old hand-patch scripts are already gone (verified). `make-admin.js` is useful but unguarded. Check production with `SELECT email FROM "User" WHERE email LIKE '%@upsosh.test'`.

## 9. Dependencies and git

**`npm audit --omit=dev`, High/Critical only:**

| Pkg | Where | Sev | Note |
|---|---|---|---|
| multer (direct) | backend | High | DoS via crafted field names. Fix by upgrading to ≥2.3.0 (non-breaking). Runs behind `requireAuth`. |
| proxy-addr (via express) | backend | **Critical** | IP spoofing via IPv4-mapped IPv6 *trust subnet*. This app uses a hop count, not a subnet, so it likely isn't exploitable here. `npm audit fix` is available. |
| axios (via razorpay), form-data, follow-redirects, ip-address | backend | High | Transitive. `npm audit fix`. |
| prisma, @prisma/config, deepmerge-ts | backend | High | CLI/build-time chain. The fix is a major bump to Prisma 7, so defer. |
| next (installed 14.2.35) | frontend | **Critical** (audit range) | Includes RSC DoS and "HTTP request smuggling in rewrites". The app uses rewrites. 14.2.35 is the latest 14.x, so the fix is a major upgrade to 15/16. |
| postcss, tailwindcss, nanoid, braces, micromatch, chokidar, fast-glob, source-map-js | frontend | High | Build-time only. |

**Git and secrets:**
- Tracked env files: only the two `.env.example` files.
- `.gitignore` covers `.env`, `.env.local`, `.env.production` and the `.local` variants. It misses `.env.development`, `.env.test` and `.env.staging` (Low).
- `frontend/.env.production` was committed in `a757f4b` and removed in `c668eb9`. It held only three `NEXT_PUBLIC_*` URLs, no secrets.
- A pickaxe scan of **all** history found no `rzp_live_`, OpenRouter, Resend, AWS or Google API key, no private key and no credentialed hosted DB URL. In HEAD, only `rzp_test_` **key IDs** (public) appear in docs and `.env.example`.
- A looser scan of history for `*_SECRET=`/`*_API_KEY=` assignments with long values matched `backend/.env.example` and the two Razorpay docs in commits `672b94e` and `a757f4b`. **I did not open them, so I can't say whether they are placeholders.** Please run `git show 672b94e:PAYMENT_INTEGRATION.md | grep -n "SECRET"` and rotate if any real value appears.
- `backend/.env` still holds the `your_webhook_secret` placeholder locally (FIXPLAN P0-10). I don't know about Render.

## 10. Five highest-value missing tests

1. **Webhook state machine:** failed then captured, captured after expiry or cancel, duplicate delivery, `refund.processed` (PAY-1, 3, 5).
2. **Booking and paying for a cancelled, draft or past event**, and capacity recheck at payment time (PAY-3, 4).
3. **Create-order twice**, then pay the first order (PAY-2).
4. **Rate limits and CSRF:** `/me` isn't throttled, a non-GET without a matching `Origin` is rejected, `X-Forwarded-For` handling (AUTH-1, 6).
5. **Account lifecycle:** deleting an account with paid bookings, Google re-signup after delete, session revocation after password reset, plus host-flow authorization (apply, approve, PUT/checkin/announce as non-owner) and email escaping (AUTH-3, 5, AZ-2, PAY-6).

## 11. FIXPLAN.md: still-unchecked items vs current code

The file lists 76 unchecked lines, many duplicated between the early and later sections.

**Already fixed (should be ticked):**
- P0-4 (the three scripts are gone).
- P0-14 (no `mock:api` script).
- P1-16 (backend CSP is on; the frontend has no CSP, which stays open).
- P1-21 (row lock plus tests).
- P1-24 (AI limiter).
- P1-25 (100 kB body limit).
- P1-26 (`safeJsonLd`).
- P1-28 (`.env.production` ignored and untracked).
- P1-29 (no zip tracked).
- P2-20 (single `sanitizeUser`).
- P2-21 (no hardcoded production URLs).
- P2-22 (single `cloudinary.ts`).
- P3-11 (CI has Postgres and runs seed).
- P4-11 (`app/admin/hosts` exists).
- P4-16 (the `create-checkout` calls are gone; a "Dodo" mention remains in a `lib/api.ts` comment).
- P4-22 (distance slider gone).
- P4-23 ("Remember me" gone; the contact page is now an honest `mailto`).
- P4-50 (no recharts imports).
- P4-60 (notifications routes exist).
- P4-12 (the `/users/:username` half; see below).

**Still open:**
- P0-10: the local `.env` is still the placeholder, and production is unknown.
- P0-11: `BACKEND_URL` is still in `.env.example` and unused.
- P1-17: only partly done (see section 4).
- P1-27: the QR is still unsigned `UPSOSH-<id>`.
- P2-10: `@google/generative-ai` is still in `package.json` and unused.
- P2-25: the types still use `published`/`sold_out`.
- P2-27: both `store/authStore.ts` and `lib/stores/auth.ts` exist.
- P3-8: no Prettier.
- P3-12: no husky.
- P3-13: no pino.
- P4-9: no payouts routes exist, but the UI refers to payouts.
- P4-12 (attending): there is no `/attending` endpoint.
- P4-13: no ticket scan endpoint.
- P4-15: no reconciliation job (this now matters for PAY-1 and PAY-2).
- P4-24: one `href="#"` remains in the footer.
- P4-27: 9 `alert`/`prompt`/`confirm` calls remain.
- P4-32: `pastPlans` is still component state only.
- P4-37: JSON-in-String columns remain.
- P4-39: the dual host concept remains.
- P4-41: `ILIKE` search remains (4 occurrences).
- P4-47: metadata on 3 pages only.
- P4-52: `cream-faint` is still 0.25 alpha with 27 uses.
- P4-55: `cursor: none` remains at `globals.css:114`.
- P4-56: 8 `loading`/`error` files, still partial.
- P4-61: `app/host/page.tsx` still exists, and I did not confirm whether it is still orphaned.
- P4-62: the model id is unchanged and not re-verified.
- P5-11, P5-12, P5-13: only `booking-flow.spec.ts` exists.
- P5-15, P5-16, P5-17: procedural, not done.
- The four "flagged, not implemented" and "deliberately not done" lines at the end: still deliberate.

**No longer applicable:**
- P4-42: there is no `GET /api/hosts` list route.

**Not re-verified:** P2-19, P2-23, P2-24, P2-28, P4-20, P4-25, P4-26, P4-45, P4-48, P4-49, P4-51, P4-53, P4-54 (UI polish and refactors). Rough greps suggest most have improved: one raw `<img>` is left, `favicon.ico` exists, and there are 55 `aria-label`s. Treat them as unknown, not done.

---

## (a) Top 5 risks before real money flows

1. **Charged but no ticket** (PAY-1, PAY-2): a failed-then-successful retry, or a second `create-order`, strands the customer's payment. No reconciliation job exists to catch it.
2. **Bookable and payable when it shouldn't be** (PAY-4, PAY-3): cancelled, past and draft events accept payment, and late payments oversell a full event.
3. **Auth throttling can lock out real users** (AUTH-1): `/me` is limited to 10 per 15 min per IP, and the IP is probably shared behind Vercel. Treat this as an outage risk until you run the check above.
4. **Money and refund integrity** (PAY-5, PAY-6, PAY-7): free bookings count ₹25 of revenue, and refunds are missing or fragile on account deletion, event cancellation and dashboard refunds.
5. **Config and tooling without guard rails** (AUTH-2, seed/make-admin): the app doesn't validate env at boot, and the seed script can create a known-password admin on whatever database `.env` points to. Add the HTML-injection email path (AZ-2) here, because it can burn the sender domain.

## (b) Questions only you can answer

1. Which database does production use? `.env` suggests Neon, while the docs and event-report say Railway. Is `prisma migrate status` clean there?
2. What is set on Render: `NODE_ENV=production`, `JWT_SECRET` (random, at least 32 chars, not the example), `RAZORPAY_WEBHOOK_SECRET` (equal to the dashboard value), `FRONTEND_URL`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, and which Razorpay key set (test or live)?
3. In the Razorpay dashboard: is auto-capture on, which webhook events are subscribed, and what is the webhook URL?
4. How does the production browser reach the API: the Vercel `/api` rewrite, direct to `onrender.com`, or both (the code does both)? How many Render instances, and which plan (a free instance sleeps)?
5. Should the ₹25 fee apply to free events? Today it is recorded but never collected.
6. Refund policy: is there a cancellation cutoff, and should a refund include the platform fee?
7. Where do host Gov ID and selfie uploads go, and what is the retention policy?
8. Does `SELECT email FROM "User" WHERE email LIKE '%@upsosh.test'` return anything in production?
9. Is the `upsosh.app` sender domain verified in Resend?

## (c) What I could not verify

- Anything in production: env values, the live database state, Render's proxy and IP behaviour, Razorpay dashboard settings, and real Razorpay retry behaviour. PAY-1 simulates the webhook sequence, and the retry-on-same-order behaviour comes from Razorpay's documented model.
- Whether the OpenRouter model id works, email rendering and deliverability, Cloudinary access settings, the frontend CSP and Vercel config.
- Un-prefixed secrets in git history beyond the loose scan in section 9.
- Load or concurrency beyond the existing seat tests, and the runtime relevance of build-time audit hits.
- The frontend UI-polish items in section 11.

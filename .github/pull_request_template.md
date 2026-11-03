## What and why

<!-- One or two sentences. Link the issue or audit item if there is one. -->

## Checklist

- [ ] **Tests pass** — `npx tsc --noEmit` (backend and frontend), backend tests run against a **local** Postgres, `npm run build` in `frontend/`. New behaviour has a test.
- [ ] **Migration reviewed** — no migration, or: it is additive (new nullable column / column with a default), I read the generated SQL, and I took a **database backup** before merging. Nothing was run against production from a laptop.
- [ ] **Env vars added** — no new env vars, or: they are in `.env.example`, documented in the README table, and set on Render / Vercel **before** merge. Nothing secret is committed.
- [ ] **Rollback plan** — how to undo this if it goes wrong (revert the PR, restore the backup, or a follow-up migration), and who does it.

## Payments / auth touched?

- [ ] No — or: I re-checked amount source, signature checks, idempotency, and which routes need `requireAuth`.

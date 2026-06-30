# Max's Social House Platform

A dual-application platform: an upscale public-facing restaurant/event/music website,
and an internal operations dashboard that powers it (CMS, CRM, RBAC, and — in later
phases — bookings, invoicing, payments, ticketing, and Toast POS integration).

Built by MagKam Solutions.

## Structure

- `apps/public-site` — public website (Next.js 15), the WordPress replacement
- `apps/dashboard` — internal operations dashboard (Next.js 15), auth-walled
- `packages/types` — shared Firestore + RBAC types (the single source of truth)
- `packages/services` — Firebase client init and shared services
- `packages/ui` — shared design tokens (optional)
- `firebase/` — Security Rules, Storage Rules, indexes, and Cloud Functions
- `scripts/seed.ts` — bootstrap the first super admin and the venue's spaces

## Documents

- `PHASE_1_SPEC.md` — the build spec for Phase 1 
- `/01-build-info/events-suite-architecture.md` — the full multi-phase architecture (kept in project root)

## Quick start

1. `npm install`
2. Create a Firebase project (Auth, Firestore, Storage, Functions)
3. Copy `.env.example` to `.env.local` in each app and fill in config
4. `npm run deploy:rules`
5. Create your Auth user in the Firebase console, then `npx tsx scripts/seed.ts <uid> <email>`
6. `npm run dev`

## The one rule that matters most

The client never enforces access. Firestore Security Rules and Cloud Functions do.
Client-side permission checks (`PermissionGate`, `useAuth`) exist only to hide UI a
user can't act on. See `PHASE_1_SPEC.md` Section 3.

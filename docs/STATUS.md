# Aura Web Status
Last updated: 2026-02-20

## Summary
- Next.js frontend with admin and cashier flows (products, inventory, sales, returns, reports, settings).
- Backend API integration via `BACKEND_API_URL` with cookie-based auth and tenant header.
- Offline/local storage scaffolding using Dexie for sales queue, inventory levels, and cash shifts.
- Demo-only behavior gated behind environment flags.

## Environment Notes
- `NEXT_PUBLIC_BACKEND_API_URL` points to the NestJS API base (default `http://localhost:3001/api/v1`).
- `NEXT_PUBLIC_ENABLE_DEMO_SEED=true` enables demo data seeding in the local Dexie DB (dev only by default).

## Current Focus
- Confirm all UI flows use backend services (remove any remaining legacy/mock API usage).
- Validate auth/session flows end-to-end against the backend.
- Add production monitoring and error boundaries.

## Docs Map
- See `docs/ARCHIVE.md` for legacy docs kept for historical reference.
- See `docs/SMOKE_TEST.md` for release sanity checks.
- See `docs/DEPLOYMENT_CHECKLIST.md` for production readiness steps.

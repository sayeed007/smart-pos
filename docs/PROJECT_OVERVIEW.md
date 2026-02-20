# Aura Web Project Overview
Last updated: 2026-02-20

## Purpose
Aura Web is the Next.js frontend for the Aura POS platform. It provides:
- Admin operations (catalog, inventory, reports, settings).
- Cashier POS experience (fast checkout, split payments, suspended sales).
- Multi-tenant, location-aware workflows.
- Offline-first scaffolding for core POS flows.

## Tech Stack
- Next.js (App Router)
- React Query for server state
- Zustand for client state
- Dexie (IndexedDB) for offline storage
- Tailwind for styling
- i18n via `react-i18next`

## High-Level Architecture
- Backend API is the source of truth (`BACKEND_API_URL`).
- Axios client `backendApi` sends cookies and tenant header.
- UI uses feature modules (POS, Inventory, Reports, Settings) and reusable UI components.

## Core Features
- Authentication and session handling.
- Admin Dashboard with sales and inventory stats.
- Products and categories management.
- Inventory ledger views and stock adjustments.
- Stock transfers between locations.
- Customers and loyalty tiers.
- Offers and discount rules.
- Sales list and sales summary.
- Returns management.
- Reports with CSV export.
- POS checkout with split payments and suspended sales.
- Cash management (shifts, pay in/out).

## Authentication and Session
- Login uses `/auth/login` (backend sets httpOnly cookies).
- Axios refresh interceptor calls `/auth/refresh` on 401.
- `X-Tenant-ID` header is sent from stored auth context.
- CSRF token header is sent by the client, backend decision pending.

## Offline and Local Storage
- Dexie DB defined in `src/lib/db.ts`.
- `salesQueue` stores offline sales with `offlineId` for sync.
- `suspendedSales` stores paused carts for later resume.
- `inventoryLevels`, `cashShifts`, `cashTransactions`, `priceBooks`, `priceOverrides` are cached locally.
- `SyncProvider` retries offline sales sync every 15s when online.

## POS Flow Summary
- Cart built in `pos-store` (Zustand).
- Discounts and offers calculated by `discount-engine`.
- Checkout builds backend `CreateSaleDto` in `sale-processor`.
- On success, cache invalidation triggers data refresh.

## Multi-Location
- Location selection stored in `location-storage`.
- Inventory and POS flows are location aware.
- Checkout blocks if no valid location is selected.

## Settings
- Local settings store (`useSettingsStore`) manages store header, receipt info, tax, currency.
- Receipt formatting used by POS receipt template.

## Key Directories
- `src/app`: routes (admin, cashier, public).
- `src/features`: domain features (POS, inventory, settings, reports).
- `src/components`: reusable UI and domain components.
- `src/hooks/api`: backend hooks built on React Query.
- `src/lib/services/backend`: API client services.
- `src/i18n`: localization files.

## Important Environment Variables
- `NEXT_PUBLIC_BACKEND_API_URL` (backend base URL, defaults to `http://localhost:3001/api/v1`)
- `NEXT_PUBLIC_ENABLE_DEMO_SEED` (optional, enables demo seeding in dev)

## Known Gaps and Decisions
- CSRF strategy is not finalized for cookie auth.
- Offline conflict resolution is basic (single-pass sync).
- Hardware integrations are not implemented.
- Some UI flows may still need deeper end-to-end validation.

## Related Docs
- `docs/STATUS.md`
- `docs/SMOKE_TEST.md`
- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/ARCHIVE.md`

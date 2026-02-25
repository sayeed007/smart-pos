# Codebase Findings (Frontend Focus)

Date: 2026-02-11
Project: Tafuri POS (Next.js)
Scope: Route map, feature coverage, frontend readiness, gaps to market readiness

## 1) Route Map and Current Behavior

### Public
- `/` (src/app/page.tsx): Client-side role redirect based on localStorage user; shows loader while auth resolves.
- `/login` (src/app/(public)/login/page.tsx): Role selection + email/password; uses mock login and localStorage; password not validated.

### Admin (src/app/(admin))
- `/admin/dashboard`: Stats + charts. Fetches `/api/sales` and `/api/products`, falls back to mock chart data.
- `/admin/sales`: Sales item table, date picker UI (no filtering logic), return modal UI; return action is console-only.
- `/admin/products`: Shared products module (table, search, add/edit modal, image upload); save/delete are simulated.
- `/admin/inventory`: Inventory stats, category stock breakdown, critical alerts, restock modal; restock action is stubbed.
- `/admin/categories`: Category grid + computed counts/values; add/edit modal; save simulated.
- `/admin/offers`: Offer grid + search; add/edit/delete; uses mock offers.
- `/admin/customers`: Customers table + add/edit dialog; React Query mutations call PUT/DELETE endpoints that do not exist.
- `/admin/reports`: Charts + tables; uses mock data for initial render; no filters.
- `/admin/returns`: Local-state returns list + create/edit modal; not connected to sales data.
- `/admin/users`: Mock user list; add/edit/delete are toasts only; static role description section.
- `/admin/settings`: Store/currency/invoice/hardware forms; save simulated.
- `/admin/pos`: Same POS UI as cashier.

### Cashier (src/app/(cashier))
- `/cashier/pos`: POS UI (product grid + cart + modals). Search + category filter; size modal hardcoded; checkout posts to `/api/sales`.
- `/cashier/products`: Same products module as admin.
- `/cashier/customers`: Same customers module as admin; uses PUT/DELETE that do not exist server-side.

## 2) API Routes (Next.js App Router)
- `POST /api/auth/login`: Mock user + token; no real auth.
- `GET /api/categories`: Mock categories.
- `GET/POST /api/products`: In-memory store; supports search/category; no update/delete.
- `GET/POST /api/customers`: In-memory store; supports search; no update/delete.
- `GET/POST /api/sales`: In-memory store; create only.
- `GET /api/users`: Mock users.

## 3) Frontend Evaluation (Current State)

Strengths
- Polished UI and consistent component language across admin/cashier.
- Good structure for scaling: React Query, Zustand (POS), i18n, theme support, shared tables and modals.
- Visual coverage for major modules (products, inventory, sales, reports, customers, offers, returns).

Limitations / Gaps
- Many flows are UI-only: actions are simulated with timeouts or mock data (create/edit/delete/returns/restock).
- Client-only auth/role gating (localStorage + client redirects). No server-side protection.
- POS mismatches: cart shows discount but checkout total ignores it; size modal is hardcoded; offers are stubbed.
- Some UX is placeholder: date filters do not filter, product categories are duplicated in POS for scroll, POS header exists but not used.

## 4) Missing Pieces to Reach Market-Ready Scale

Product & Inventory
- Variant/matrix products, UOM support, multi-barcode strategy, batch/lot/serial tracking.
- Stock adjustments, purchase orders, transfers, cycle counts, audit trails.

POS & Checkout
- Split payments, suspend/recall sale, refunds/voids with approvals, cash rounding.
- Real promotions engine (coupons, rules), loyalty points/tier indicators.
- Customer linking at checkout and receipt flows.

Admin & Operations
- Real roles/permissions matrix with UI enforcement (not just navigation).
- Onboarding wizard and tenant/location selection (multi-tenant UX).
- Export/reporting (CSV/PDF), saved reports, date range filters.

Scale & Resilience
- Server-driven pagination, debounced search, async selects, virtualization for large lists.
- Offline mode UX and hardware pairing/setup (printer, scanner, scale).

Security & Compliance UI
- Audit log UI, session lock, supervisor overrides, sensitive action controls.

## 5) Notes on Data and State
- Most state is in-memory or mock (API routes with in-memory arrays).
- Mutations are inconsistent: some pages call endpoints that do not exist.
- LocalStorage auth is the only persistence mechanism for user sessions.

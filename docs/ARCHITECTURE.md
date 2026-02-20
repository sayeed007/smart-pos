# Aura Web - Frontend Architecture and System Guide

## Purpose and responsibilities
Aura Web is the web UI for Aura POS. It owns the user experience, client-side state, offline persistence, and communication with the backend API. It does not enforce business rules that must be authoritative (pricing, inventory, permissions, accounting); those live in the backend.

## Tech stack
- Next.js App Router with React and TypeScript
- Tailwind CSS with CSS variables, shadcn/ui, Radix primitives
- TanStack React Query for server state
- Zustand for client state
- Dexie (IndexedDB) for offline persistence
- axios for API calls
- react-hook-form with zod
- i18next and react-i18next
- date-fns, lucide-react

## Runtime architecture
- Route groups separate admin, cashier, and public flows.
- Auth uses HttpOnly cookies issued by the backend. The frontend stores the user and tenant id in localStorage and sends `X-CSRF-Token` on unsafe requests.
- `backendApi` in `src/lib/axios.ts` centralizes API calls and handles token refresh on 401.
- React Query handles fetching, caching, and invalidation.
- Providers compose app behavior: `AuthProvider`, `SessionProvider`, `InstanceProvider`, `QueryProvider`, `SyncProvider`, `ThemeProvider`, `CustomThemeProvider`, `I18nProvider`.
- Offline mode uses Dexie in `src/lib/db.ts` for products, customers, offers, inventory levels, suspended sales, and a sales queue.
- `SyncProvider` periodically retries queued offline sales and shows a sync indicator when pending items exist.
- Instance configuration is fetched from `/instance/config` and controls branding and feature flags.
- Theming uses CSS variables. Prefer semantic tokens like `bg-background` and `text-foreground` over hardcoded colors.

## Directory map
- `src/app` route tree for all pages and layouts.
- `src/components` shared UI and domain components.
- `src/features` feature slices with stores, components, and logic.
- `src/hooks` React Query hooks and offline hooks.
- `src/lib` API clients, utilities, auth storage, and Dexie database.
- `src/providers` cross-cutting providers.
- `src/i18n` translations and i18n initialization.
- `src/types` shared domain types and backend DTO shapes.

## Route map
- Admin routes live under `src/app/(admin)/admin` and include `dashboard`, `products`, `categories`, `inventory`, `sales`, `returns`, `offers`, `reports`, `settings`, `locations`, `people`, `users`, `pos`, and `customers`.
- Cashier routes live under `src/app/(cashier)/cashier` and include `pos`, `products`, and `customers`.
- Public routes live under `src/app/(public)` and include `login`.

## Feature map (where to look)
- POS checkout: `src/features/pos` and `src/app/(cashier)/cashier/pos`, with deeper design in `src/features/pos/POS_ARCHITECTURE.md`.
- Products: `src/app/(admin)/admin/products`, `src/components/products`, `src/hooks/api/products`, `src/lib/services/backend/products.service.ts`.
- Categories: `src/app/(admin)/admin/categories`, `src/components/categories`, `src/hooks/api/categories`, `src/lib/services/backend/categories.service.ts`.
- Inventory: `src/app/(admin)/admin/inventory`, `src/components/inventory`, `src/features/inventory`, `src/hooks/api/inventory`, `src/lib/services/backend/inventory.service.ts`.
- Sales: `src/app/(admin)/admin/sales`, `src/components/sales`, `src/hooks/api/sales`, `src/lib/services/backend/sales.service.ts`.
- Returns: `src/app/(admin)/admin/returns`, `src/components/returns`, `src/hooks/api/returns`, `src/lib/services/backend/returns.service.ts`.
- Customers and loyalty: `src/app/(admin)/admin/customers`, `src/components/customers`, `src/hooks/api/customers`, `src/lib/services/backend/customers.service.ts`.
- Offers and discounts: `src/app/(admin)/admin/offers`, `src/hooks/api/offers`, `src/lib/services/backend/offers.service.ts`.
- Locations: `src/app/(admin)/admin/locations`, `src/features/locations`, `src/hooks/api/locations`, `src/lib/services/backend/locations.service.ts`.
- Cash management: `src/features/cash`, `src/hooks/api/cash-management`, `src/lib/services/backend/cash-management.service.ts`.
- Reports and dashboards: `src/app/(admin)/admin/reports` and `src/hooks/api/reports`.
- Settings and theming: `src/app/(admin)/admin/settings`, `src/features/settings/store.ts`, `src/providers/custom-theme-provider.tsx`.
- Auth and session: `src/app/(public)/login`, `src/providers/auth-provider.tsx`, `src/lib/services/backend/auth.service.ts`.
- Instance branding: `src/providers/instance-provider.tsx`, `src/config/instance.config.ts`.

## Data flows (high level)
- Login and session: `useLogin` calls `/auth/login`, backend sets cookies, `AuthProvider` stores user and tenant id and routes by role.
- API calls: `backendApi` sends cookies and `X-CSRF-Token`, retries once on 401 by calling `/auth/refresh`.
- Instance config: `InstanceProvider` fetches `/instance/config`, updates document title and favicon.
- POS checkout: cart state in `src/features/pos/store/pos-store.ts` is transformed to `CreateSaleDto` and posted to `/sales`. On success, React Query invalidates related caches.
- Offline sales: sales are queued in Dexie and retried by `SyncProvider` when online.

## Related docs
- `src/features/pos/POS_ARCHITECTURE.md` for full POS behavior and discount logic.
- `AUTH_COOKIE_FLOW.md` for cookie based auth flow and CSRF notes.

## Local development
- Required env: `NEXT_PUBLIC_BACKEND_API_URL` (defaults to `http://localhost:3001/api/v1`).
- Optional env: `NEXT_PUBLIC_ENABLE_DEMO_SEED` for Dexie demo data, and the `NEXT_PUBLIC_DEV_*` login helpers used in `src/app/(public)/login/page.tsx`.
- Commands: `npm install` then `npm run dev`.

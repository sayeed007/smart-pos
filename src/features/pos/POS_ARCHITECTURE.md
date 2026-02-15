# POS Feature Architecture

## Overview
The POS feature is a single, client-side feature set inside the Next.js app. It handles product browsing, cart building, discounts, payments, suspended sales, and shift reporting. It uses:
- Zustand for client state (cart, modal state, selected customer, etc.).
- React Query for backend state (products, categories, offers, locations, sales refresh).
- Dexie (IndexedDB) for local persistence (suspended sales, shifts, cash transactions).
- A backend Sales API for final sale creation.

This document maps files to responsibilities and documents the full flow so new developers can understand the system end to end.

## File Map and Responsibilities

Core feature entry
- `src/features/pos/index.tsx`: POSFeature entry. Loads products, categories, and active offers from the backend. Loads locations and seeds the location store. Renders `ProductGrid`, `CartPanel`, and `POSModals`.

State management
- `src/features/pos/store/pos-store.ts`: Zustand store for active session state. Owns the cart, selected customer, active modal, and payment method. Provides actions like `addToCart`, `updateQuantity`, `clearCart`, and modal setters.
- `src/features/locations/store.ts`: Location store persisted in local storage. Starts with a default location and is updated from backend locations via `setLocations`.
- `src/features/settings/store.ts`: POS settings store (tax rate, currency symbol, receipt formatting). Used by CartPanel, POSModals, and ReceiptTemplate.
- `src/features/cash/store.ts`: Local shift management in Dexie (open/close shift, current shift lookup).

Core logic
- `src/features/pos/utils/discount-engine.ts`: Computes discounts for all active offers. Returns total discount, applied offers, and per-line discounts used by checkout.
- `src/features/pos/utils/sale-processor.ts`: Converts cart state into backend `CreateSaleDto` and calls `/sales`. Maps payment methods to backend enums and attaches per-line discounts.

UI components
- `src/features/pos/components/ProductGrid.tsx`: Product browsing, search, category filter, variant selector trigger, and virtualization for performance.
- `src/features/pos/components/CartPanel.tsx`: Cart UI, live totals, loyalty points, suspend sale action, and entry into payment flow.
- `src/features/pos/components/POSModals.tsx`: All POS dialogs. Payment selection, split payment, success screen, variant picker, customer selection, suspended sales list, and cash management.
- `src/features/pos/components/CashManagementModal.tsx`: Shift open/close and Z-report preview. Pulls sales from backend and summarizes for the shift.
- `src/features/pos/components/ReceiptTemplate.tsx`: Print-only receipt layout. Uses settings for tax rate, currency, and receipt header/footer.

Routing
- `src/app/(cashier)/cashier/pos/page.tsx`: Cashier POS route that renders POSFeature.
- `src/app/(admin)/admin/pos/page.tsx`: Admin POS route that renders POSFeature.

Backend access
- `src/hooks/api/*`: React Query hooks for products, categories, offers, locations, sales.
- `src/lib/services/backend/*`: Backend service clients for the same resources.

Local storage
- `src/lib/db.ts`: Dexie schema and helpers. Suspended sales store includes `originalProductId` for variant safety.

## End-to-End Flow

### 1. Initialization
1. POSFeature mounts.
2. React Query fetches products, categories, and active offers from backend.
3. React Query fetches locations. `useLocationStore.setLocations` stores them locally and sets an active location.
4. UI renders ProductGrid, CartPanel, and POSModals.

### 2. Building the Cart
1. User clicks a product in ProductGrid.
2. If product is variable, POSModals opens the variant selector and adds the chosen variant.
3. `pos-store.addToCart` adds or increments the item.
4. CartPanel recalculates totals and discounts on every render using `calculateCartDiscounts`.

### 3. Suspend and Resume Sale
1. In CartPanel, the user can suspend the sale.
2. Suspended sale is stored in Dexie (`db.suspendedSales`) with `originalProductId` for variants.
3. In POSModals, the Suspended Sales list allows resume or discard.
4. Resume rehydrates the cart using stored item IDs and `originalProductId`.

### 4. Checkout and Sale Creation
1. User clicks Complete Sale in CartPanel.
2. POSModals opens the payment method dialog.
3. On payment selection, `handleCheckout` runs:
4. It validates cart and location (checkout is blocked if location is missing or still default).
5. `processSale` recalculates per-line discounts and builds `CreateSaleDto`.
6. POST `/sales` is sent through SalesService.
7. On success, React Query invalidates `sales`, `products`, `inventory`, and `customers` queries.
8. ReceiptTemplate is shown for printing.

## Discount Engine Rules

### Percentage, Fixed, Category Discount
- Applied to eligible items based on `applicableOn` (all, category, product).
- Discount is distributed proportionally across eligible items.

### Buy X Get Y (BOGO)
- `sameProduct` requires `buyQty + getQty` items to trigger.
- For cross-product offers, `buyQty` counts the buy items and discount applies to get items.
- Discounts apply to the cheapest eligible get items first.

### Bundle
- Bundle count is the minimum quantity across all bundle products.
- Multiple bundles are supported and scale with quantity.
- Bundle allocation uses highest priced units first to avoid discounting extra items.
- Discount is distributed proportionally across allocated bundle items.

## Cash Management and Z-Report
- Shift open/close data is stored locally in Dexie.
- Z-report uses backend SalesService.list with a limit of 1000 and filters by shift start time.
- For high volume, a backend report endpoint is recommended.

## Key Guards and Constraints
- Checkout is blocked if location is `default` or missing. A location must be set first.
- Offers are loaded from backend and passed to both CartPanel and POSModals to avoid mismatch.
- Receipt time is built from `sale.date` and `sale.time` with a safe fallback to current time.

## Common Extension Points

Adding a payment method
1. Add the UI option in POSModals.
2. Add the mapping in `PAYMENT_METHOD_MAP` in `sale-processor.ts`.

Adding a new offer type
1. Extend the backend offer rule schema.
2. Parse the rule in `offers.service.ts`.
3. Implement the calculation in `discount-engine.ts`.

## Known Limits
- Z-report is client-side and may be slow beyond 1000+ sales.
- Offline location fetch failures block checkout, by design, to avoid invalid sales.

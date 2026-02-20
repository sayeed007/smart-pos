# Aura Web - Frontend Architecture & System Guide

Welcome to the **Aura Web** frontend platform. This documentation serves as a comprehensive overview of the architecture, folder structures, core libraries, and technical decisions making up the frontend application. It is designed to quickly onboard new developers and specialized agents.

## 🛠 Tech Stack overview
- **Framework**: [Next.js](https://nextjs.org/) (App Directory router) with React.
- **Styling**: Tailwind CSS combined with Native CSS variables for theming.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Highly customizable, accessible components heavily reliant on Radix UI underlying logic).
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Simpler, hook-based global state instead of Redux).
- **Theming**: `next-themes` (Class-based dark/light mode toggling).
- **Internationalization (i18n)**: `react-i18next`.
- **Date/Time**: `date-fns`.
- **Forms & Validation**: `react-hook-form` with `zod` schemas.

---

## 📂 Directory Structure (`src/`)

- **`app/`**: Next.js App Router root. Contains all URL route mappings.
  - `(admin)/`: Grouped layouts strictly for authenticated admin routes (Dashboard, inventory, categories).
  - `(auth)/`: Grouped layouts for login flows.
  - `(pos)/`: Grouped layout specifically assigned for the POS Checkout interface (typically requires more horizontal screen space or specific kiosk formatting without the heavy admin sidebar).

- **`components/`**: React components.
  - `ui/`: Raw `shadcn/ui` foundational components (Buttons, inputs, popovers, Dialogs). **Do not place business logic in these files**.
  - `categories/`, `products/`, `sales/`, `returns/`: Business-logic heavy domain components isolating their specific module rendering (e.g., `ReturnFormModal.tsx`).

- **`features/`**: Feature-sliced architecture modules. (e.g. `pos/` holds stores, types, and components strictly linked to the Point of Sales feature).

- **`hooks/`**: Custom React hooks. Usually wrapping API calls mapping directly to REST endpoints using `@tanstack/react-query` or similar fetching patterns.

- **`lib/`**: Utility scripts, constants, Axios instance setup, generic helpers (like `cn` for Tailwind class merging).

- **`store/`**: Global Zustand stores.
  - `useCartStore.ts`: Manages products selected in the POS system currently pending checkout.
  - `useSettingsStore.ts`: Handles caching global tenant settings (currency symbols, loyalty points rules).
  - `useThemeStore.ts`: Tracks custom theming overlays.
  - `useAuthStore.ts`: Session information tracking.

---

## 🔑 Core Workflows & Logic

### 1. The Point of Sale (POS) Interface
Located primarily under `/src/features/pos/` and `/src/app/(pos)/`.
- Handles rapid adding/removing of items to cart.
- Supports **Product Variants** (`VariantSelectorView`).
- Handles complex checkouts:
  - Multiple payment methods (**Split Payments**).
  - Suspended Sales tracking (saving a cart layout to clear the physical counter line).
  - Handles Loyalty Points parsing directly per customer selection.

### 2. State Mapping & Theming
- **Theming**: DO NOT use hardcoded colors (e.g., `bg-white`, `text-gray-900`) for structural components unless absolutely intentional.
- ALWAYS use mapped CSS variables provided via Tailwind (e.g., `bg-card`, `bg-background`, `text-foreground`, `border-border`, `bg-muted`/`text-muted-foreground`). 
- Doing this ensures components seamlessly switch behavior naturally as users toggle Light/Dark Mode via the Settings sidebar.

### 3. Modals & Dialogs UI
When building popups or editing panels, default to leveraging the `<Dialog>` or `<Sheet>` structures stored in `components/ui/dialog.tsx` and `components/ui/sheet.tsx`. Use Popovers (`components/ui/popover.tsx`) alongside `<Command>` inputs to recreate native Select behaviors that require search filtering.

### 4. i18n Translations
Never hardcode strings meant for the direct UI facing the user. Rely on the `useTranslation()` hook.
- **Example**: `t("form.processReturn", "Process Return")`
- The first argument is the dictionary key, and the second is the exact Fallback english text in the event a user's language map drops.

---

## 📝 Best Practices Checklist
1. **Never mutate UI raw inputs manually**: Let React/Zustand handle the state.
2. **Handle Loading/Error States**: Always account for `isFetching`, `isLoading`, and network errors on buttons explicitly.
3. **Respect the grid**: Stick to the standard Tailwind 4-point spacing scale (`p-4`, `gap-2`, `m-6`).
4. **Icons**: Exclusively use `lucide-react`.

## 🚀 Running the project
- Dependencies `npm install`
- Env vars: Ensure your `.env.local` runs `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- Start server: `npm run dev`

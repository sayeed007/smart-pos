# Critical Improvements & Implementation Roadmap

**Objective:** Elevate the current frontend MVP (4/10) to a production-grade SaaS product (10/10) by addressing complex business logic, scalability, and handling real-world retail scenarios.

---

## 🏗️ 1. Advanced Product & Inventory Management (Critical Priority)

The current product model is too simple (Name, Price, Stock). Different industries (Grocery, Fashion, Electronics) require vastly different structures.

### 🧩 Product Variants (The "Matrix" Problem)
- **Current State:** Single flat product.
- **Requirement:** Dynamic Variant System.
- **Tasks:**
  - [ ] **Variant Builder UI:** Create a "Matrix" generator where user defines Options (Size, Color, Material) and Values (S, M, L / Red, Blue).
  - [ ] **SKU Generation:** Auto-generate SKUs for combinations (e.g., `SHOE-NIKE-RED-42`).
  - [ ] **Individual Tracking:** Ability to track stock, set prices, and upload images *per variant*.
  - [ ] **Frontend Logic:**
    - Update `ProductForm` to handle "Simple" vs "Variable" product types.
    - Update `POS` grid to show a "Select Variant" modal when a variable product is clicked.

### ⚖️ Units of Measure (UOM)
- **Current State:** Assumes "per piece" (Quantity is integer).
- **Requirement:** Support for Weight, Length, Volume.
- **Tasks:**
  - [ ] **Decimal Quantities:** Allow purchasing `1.5` kg or `0.75` meters.
  - [ ] **Scale Integration:** UI to input weight from a connected scale or manual entry.
  - [ ] **Pricing Display:** Show price per unit (e.g., "$5.00 / kg") on tiles and receipts.

### 🔢 Barcode Strategy
- **Current State:** One simple barcode field.
- **Requirement:** Robust scanning support.
- **Tasks:**
  - [ ] **Multiple Barcodes:** Allow multiple codes for one item (Manufacturer code + Store code + Box code).
  - [ ] **Embedded Barcodes:** Logic to parse `20202...` codes from deli scales (contains Item ID + Price/Weight).

---

## 💳 2. Complex Sales & Checkout Logic

The "Happy Path" checkout is built, but real retail is messy.

### 💸 Split Payments
- **Current State:** Single payment method selection.
- **Requirement:** Ability to combine payment types.
- **Tasks:**
  - [ ] **Split Logic:** UI to enter partial amount for "Cash", showing "Remaining Balance" to pay via "Card".
  - [ ] **Validation:** Ensure total payments >= total due.
  - [ ] **Receipt:** Display breakdown (Cash: $10, Visa: $40).

### ⏸️ Suspend & Resume (Park Sale)
- **Current State:** Cart clears if page refreshes or user leaves.
- **Requirement:** Hold a transaction for a customer who forgot their wallet.
- **Tasks:**
  - [ ] **Park Action:** "Hold" button to save cart state to LocalStorage/DB with a reference note.
  - [ ] **Recall UI:** A list of "Parked Sales" to retrieve and restore to the active cart.

### 🎁 Offers & Discounts Engine
- **Current State:** Basic line item discount.
- **Requirement:** Automated rule-based discounts.
- **Tasks:**
  - [ ] **Global Discount:** Apply % or Fixed Off to entire cart.
  - [ ] **Coupon Code:** Input field to validate codes.
  - [ ] **Auto-Rules:** Logic to check:
    - "Buy X Get Y" (Add free item automatically).
    - "Spend $100 get $10 off" (Apply automatically).

---

## 💎 3. Loyalty & Customer Engagement

Turning a transaction into a relationship.

### 🏆 Points System
- **Current State:** Static customer display.
- **Requirement:** Earn and Burn mechanics.
- **Tasks:**
  - [ ] **Earning Rule:** Define logic (e.g., 1 Point per $10 spent). Display "Points to Earn" in Cart.
  - [ ] **Redemption:** "Pay with Points" option in checkout. Convert points to currency value dynamically.
  - [ ] **Tier System:** Frontend indicators for memberships (Gold/Platinum) which might trigger auto-discounts.

---

## 🏢 4. SaaS/Multi-Tenancy Frontend Architecture

Critical for evaluating "Platform" vs "Single Shop".

### 🌍 Onboarding & Store Configuration
- **Current State:** Manual "Settings" page.
- **Requirement:** Self-service setup.
- **Tasks:**
  - [ ] **Setup Wizard:** Step-by-step guide after signup (Store Name -> Currency/Tax -> Add first product).
  - [ ] **Tax Rules:** Complex tax setup (Inclusive/Exclusive tax, Multi-tax groups).

### 🔒 Roles & Permissions (Granular)
- **Current State:** Fixed Admin/Manager/Cashier roles.
- **Requirement:** Custom permission sets.
- **Tasks:**
  - [ ] **Permission Matrix UI:** Admin screen to toggle capabilities (e.g., `can_delete_items`, `can_view_reports`, `can_give_discount`).
  - [ ] **Gate Components:** Wrap buttons/routes with a `<Can permission="delete_product">` HOC.

### 📶 Offline Mode (PWA)
- **Current State:** Web-only.
- **Requirement:** Internet resilience.
- **Tasks:**
  - [ ] **Service Worker:** Cache static assets.
  - [ ] **Offline Queue:** Store sales in IndexedDB when offline; sync to server when online.

---

## ⚡ 5. Technical Performance & UX

Preparing for scale (10,000+ products).

### 🔍 Server-Side Search & Pagination
- **Current State:** Client-side filtering (`.filter()`).
- **Requirement:** handle large datasets.
- **Tasks:**
  - [ ] **Debounced Inputs:** Search inputs should wait 300ms before triggering API calls.
  - [ ] **Async Selects:** Dropdowns (e.g., Customer Select) must fetch data asynchronously as user types.
  - [ ] **Infinite Scroll / Pagination:** Store tables and POS grid must load data in chunks.

### ⌨️ Keyboard Navigation
- **Current State:** Mouse-heavy.
- **Requirement:** Speed for power users.
- **Tasks:**
  - [ ] **Shortcuts:** Global listeners for `F9` (Checkout), `F2` (Search), `Esc` (Cancel).
  - [ ] **Focus Management:** Auto-focus search bar on load.

---

## 📅 Summary of Next Steps

1.  **Stop building new pages.**
2.  **Refactor Product Module:** Build the Variant/Matrix system. This dictates the data structure for everything else.
3.  **Refactor POS Cart:** Add Split Payment and Suspended Sale logic.
4.  **Refactor Customers:** Add Loyalty Points logic.
5.  **Refactor Search:** Implement debouncing and async loading patterns.

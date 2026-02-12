# Critical Improvements & Implementation Roadmap (v2)

**Objective:** Elevate the current frontend MVP (4/10) to a production-grade SaaS product (10/10) by addressing complex business logic, scalability, and handling real-world retail scenarios.
**Status:** Validated by Senior Architect & Product Manager.

---

## 🚨 P0: Blocking (The Foundation)
*Must be completed before any real pilot.*

### 1. Advanced Product & Inventory (Data Model)
- **Current Gap:** Flat product structure; Simple stock counters.
- **Requirement:** Enterprise-grade data integrity.
- **Tasks:**
  - [x] **Variant Matrix:** Dynamic builder for Size/Color/Material (SKU families).
  - [x] **Inventory Ledger:** Move from "Stock Count" to "Transaction Ledger" (In/Out/Transfer/Adjust events). *Crucial for audit.*
  - [x] **Barcodes:** Support multiple barcodes per SKU (Manufacturer, Store, Carton).
  - [x] **UOM:** Support Decimal quantities (Kg, M) and Weighing Scale embedded codes.

### 2. Transaction Integrity & Checkout
- **Current Gap:** Simple "Happy Path"; No partial states.
- **Requirement:** Atomic, reversible, and auditable financial flows.
- **Tasks:**
  - [x] **Atomic Checkout:** Ensure inventory deduction and sales recording happen transactionally.
  - [x] **Split Payments:** Handle mix of Cash, Card, and Voucher in one sale.
  - [x] **Tax Profiles:** Line-item tax calculation (Inclusive/Exclusive) and stacking rules.

### 3. Security & Auth Architecture
- **Current Gap:** Client-side role checks.
- **Requirement:** Server-enforced security.
- **Tasks:**
  - [x] **RBAC Enforcement:** "Permission Matrix" checking on every route and button (e.g., `<Can do="refund">`).
  - [x] **Session Intelligence:** Auto-lock screen after inactivity; Supervisor PIN for sensitive overrides.

### 4. Core Retail Readiness (Offline & Hardware)
- **Current Gap:** Web-only; no hardware integration.
- **Requirement:** Reliability in poor network conditions.
- **Tasks:**
  - [x] **Offline Mode:** IndexedDB persistence for Catalog & Sales Queue. sync logic when back online.
  - [x] **Suspend & Resume:** "Park" sale functionality for line-busting.
  - [x] **Hardware UI:** Settings for Printer (IP/Bluetooth) and Scanner (HID/Serial intent).

### 5. Advanced POS Workflows
- **Current Gap:** Basic Sales only.
- **Requirement:** Handle real-world retail exceptions.
- **Tasks:**
  - [x] **Refund Workflow:** Referenced refund (fetch original txn) vs Ad-hoc refund.
  - [x] **Cash Management:** Petty Cash in/out (Float/Drops) with "Drawer" concept.
  - [x] **Shift/Day Close (Z-Report):** Aggregate totals and close session.

#### ✅ Status Update (Feb 2026)
- **Product Variants:** Fully implemented (Data Model, POS Selector, Cart Logic).
- **Inventory Ledger:** Live transaction tracking and Audit UI (`/admin/inventory`) implemented.
- **Security:** Server-side RBAC enforcement added for critical creation routes.
- **Advanced Features:** Barcodes, UOM, Split Payments, Auto-Lock.
- **Loyalty & CRM:** Fully implemented Points Engine & Targeted Offers (Admin UI + POS Auto-Apply).
- **P1 Progress:** Offline Mode (Dexie + Sync) and Suspend/Resume implemented.

---

## 🛠️ P1: Core Retail Readiness
*Required for day-to-day store operations.*

### 1. Hardware & Offline Resilience
- **Current Gap:** Web-only; No hardware status.
- **Requirement:** operate in poor network; Manage devices.
- **Tasks:**
  - [x] **Offline Mode:** Sales queue in IndexedDB; Auto-sync on reconnect with **Conflict Resolution** strategies.
  - [x] **Hardware UI:** Dashboard to manage Printers/Scanners and view connection status/diagnostics.

### 2. Advanced POS Workflows
- **Current Gap:** Linear sales only.
- **Tasks:**
  - [x] **Suspend & Resume:** "Park" sales for later completion (queue management).
  - [x] **Refund Workflow:** Structured return process with "Restock" toggle and Approval step.
  - [x] **Cash Management:** Track Float (Opening/Closing cash) and petty cash drops.

### 3. Audit & Compliance
- **Tasks:**
  - [x] **Audit Logs:** UI to view "Who changed what" (Stock adjustments). Price changes deferred to P2.
  - [x] **Shift Reports:** Z-Report generation (End of Day reconciliation).

---

## 🚀 P2: Scale & Multi-Tenancy
*Required for expanding to chains and franchises.*

### 1. Multi-Location Architecture
- **Tasks:**
  - [x] **Location Context:** User session tied to specific "Store" or "Register".
  - [x] **Stock Transfers:** Workflow for moving inventory between locations (Transit status).
  - [x] **Centralized Pricing:** Option for "Regional Price Books".

### 2. Performance Engineering
- **Current Gap:** Client-side filtering.
- **Requirement:** Support 10,000+ SKUs.
- **Tasks:**
  - [x] **Virtualization:** Use `@tanstack/react-virtual` for large product/sales grids.
  - [x] **Table Management:** Implemented `@tanstack/react-table` with Sorting & Pagination (Client-side implementation suitable for Offline-First architecture).

---

## 🌟 P3: Growth & Integrations
*Differentiators for market expansion.*

### 1. Loyalty & CRM
- [x] **Points Engine:** Earn/Burn logic with Tiered memberships.
- [x] **Targeted Offers:** "Buy X Get Y", "Happy Hour" auto-discounts (Implemented Auto-Apply engine).

### 2. External Integrations
- [ ] **Accounting:** QuickBooks/Xero sync.
- [ ] **E-commerce:** Stock sync with Shopify/WooCommerce.

---

## 📅 Architecture: Data Model Specs
*Core entities required for backend implementation.*

- **Tenant (Org)** -> **Location (Store)** -> **Register (Device)**
- **Product** -> **Variant** -> **InventoryLedger**
- **Sale** -> **SaleLine** -> **Payment** -> **TaxEntry**
- **Customer** -> **LoyaltyLog**
- **User** -> **Role** -> **Permission**

---

## 📝 Summary of Changes (v2)
- **Prioritized Roadmap:** Split into P0 (Blocking), P1 (Core), P2 (Scale).
- **Inventory Ledger:** Shifted focus from simple count to ledger-based tracking.
- **Hardware UI:** Added requirement for device status/diagnostics.
- **Performance:** Explicitly requested Virtualization for large lists.

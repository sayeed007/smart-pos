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
  - [ ] **Variant Matrix:** Dynamic builder for Size/Color/Material (SKU families).
  - [ ] **Inventory Ledger:** Move from "Stock Count" to "Transaction Ledger" (In/Out/Transfer/Adjust events). *Crucial for audit.*
  - [ ] **Barcodes:** Support multiple barcodes per SKU (Manufacturer, Store, Carton).
  - [ ] **UOM:** Support Decimal quantities (Kg, M) and Weighing Scale embedded codes.

### 2. Transaction Integrity & Checkout
- **Current Gap:** Simple "Happy Path"; No partial states.
- **Requirement:** Atomic, reversible, and auditable financial flows.
- **Tasks:**
  - [ ] **Atomic Checkout:** Ensure inventory deduction and sales recording happen transactionally.
  - [ ] **Split Payments:** Handle mix of Cash, Card, and Voucher in one sale.
  - [ ] **Tax Profiles:** Line-item tax calculation (Inclusive/Exclusive) and stacking rules.

### 3. Security & Auth Architecture
- **Current Gap:** Client-side role checks.
- **Requirement:** Server-enforced security.
- **Tasks:**
  - [ ] **RBAC Enforcement:** "Permission Matrix" checking on every route and button (e.g., `<Can do="refund">`).
  - [ ] **Session Intelligence:** Auto-lock screen after inactivity; Supervisor PIN for sensitive overrides.

---

## 🛠️ P1: Core Retail Readiness
*Required for day-to-day store operations.*

### 1. Hardware & Offline Resilience
- **Current Gap:** Web-only; No hardware status.
- **Requirement:** operate in poor network; Manage devices.
- **Tasks:**
  - [ ] **Offline Mode:** Sales queue in IndexedDB; Auto-sync on reconnect with **Conflict Resolution** strategies.
  - [ ] **Hardware UI:** Dashboard to manage Printers/Scanners and view connection status/diagnostics.

### 2. Advanced POS Workflows
- **Current Gap:** Linear sales only.
- **Tasks:**
  - [ ] **Suspend & Resume:** "Park" sales for later completion (queue management).
  - [ ] **Refund Workflow:** Structured return process with "Restock" toggle and Approval step.
  - [ ] **Cash Management:** Track Float (Opening/Closing cash) and petty cash drops.

### 3. Audit & Compliance
- **Tasks:**
  - [ ] **Audit Logs:** UI to view "Who changed what" (Price changes, Stock adjustments).
  - [ ] **Shift Reports:** Z-Report generation (End of Day reconciliation).

---

## 🚀 P2: Scale & Multi-Tenancy
*Required for expanding to chains and franchises.*

### 1. Multi-Location Architecture
- **Tasks:**
  - [ ] **Location Context:** User session tied to specific "Store" or "Register".
  - [ ] **Stock Transfers:** Workflow for moving inventory between locations (Transit status).
  - [ ] **Centralized Pricing:** Option for "Regional Price Books".

### 2. Performance Engineering
- **Current Gap:** Client-side filtering.
- **Requirement:** Support 10,000+ SKUs.
- **Tasks:**
  - [ ] **Virtualization:** Use `react-window` for large product/sales grids.
  - [ ] **Server-Side Operations:** Debounced search; Async sorting and pagination.

---

## 🌟 P3: Growth & Integrations
*Differentiators for market expansion.*

### 1. Loyalty & CRM
- [ ] **Points Engine:** Earn/Burn logic with Tiered memberships.
- [ ] **Targeted Offers:** "Buy X Get Y", "Happy Hour" auto-discounts.

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

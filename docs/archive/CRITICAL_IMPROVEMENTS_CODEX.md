# CRITICAL_IMPROVEMENTS_CODEX (Senior PM + Architect)

Date: 2026-02-11
Scope: Tafuri POS (Next.js). Frontend-first now, but aligned with enterprise-grade backend and market readiness.
Audience: Founders, PM, Engineering, Design.

## 0) Executive Summary
Your UI foundation is strong, but the product is still a visual prototype with simulated data and partial flows. To be market-ready for thousands of retailers and millions of transactions, you must harden: (1) core retail data model, (2) POS reliability and edge cases, (3) multi-tenant operations, (4) performance at scale, (5) security/compliance, and (6) integrations (payments, hardware, tax, accounting). This document prioritizes critical improvements and proposes a phased roadmap.

## 1) Current State Diagnosis (Condensed)
- Strong UI coverage for admin and cashier routes.
- Most actions are simulated (mock APIs, local state, timeouts).
- Auth and permissions are client-only and non-secure.
- POS lacks real-world flows: split payments, suspends, refunds, approvals, loyalty, discounts, offline.
- Reporting is mostly static or mock.

## 2) Product-Market Requirements (What Real Retailers Expect)
A market-ready POS is not only about features, but about trust and resilience in day-to-day operations.

### Must-Have Capabilities
- Reliable checkout in high-volume scenarios (queue-line speed and accuracy).
- Real inventory tracking with variants, batches, and adjustments.
- Accurate taxes, discounts, and receipts.
- Offline mode and hardware integration.
- Auditability for financial actions.
- Clear permission system for staff roles.

### Differentiators for Growth
- Loyalty system, CRM segmentation, and targeted offers.
- Analytics that answer real business questions.
- Multi-location and multi-tenant support.
- Integrations with accounting, e-commerce, and delivery systems.

## 3) Critical Gaps and Improvements (P0 - P3)

### P0: Blocking for Any Real Pilot
1) Data model redesign (Products, Inventory, Sales)
- Product variants, SKU families, UOM, multi-barcode, tax profiles.
- Inventory ledger: adjustments, returns, transfers, purchase receipts.
- Sales model with line-level tax, discounts, returns, and payment splits.

2) POS transaction integrity
- Atomic checkout flow (no partial/inconsistent state).
- Split payments and tender types (cash, card, wallet, gift card).
- Void/refund workflow with approval and audit trail.
- Suspend/recall sales.

3) Authentication, authorization, and role permissions
- Server-validated session and JWT refresh tokens.
- RBAC and permission matrix enforcement at API and UI.

4) Real persistence layer
- Replace in-memory mock APIs with real DB-backed endpoints.
- Ensure data lifecycle integrity (create/update/delete with validation).

### P1: Core Retail Readiness
1) Offline mode (PWA)
- Local IndexedDB queue for sales and updates.
- Conflict resolution strategy on reconnect.

2) Hardware integration
- Receipt printers, barcode scanners, cash drawers, weighing scales.
- UI for device setup, status, diagnostics.

3) Audit and compliance surfaces
- Audit log UI, supervisor overrides, session lock.

### P2: Scalability and Multi-Tenancy
1) Multi-tenant architecture
- Organization -> Location -> Register -> Staff.
- Tenant-aware routing and data partitioning.

2) Performance
- Server-side search/pagination, virtualization in tables/grids.
- Debounced filtering and async selects.

3) Reporting and exports
- Flexible date ranges, filters, CSV/PDF export.

### P3: Growth and Competitive Advantage
- Loyalty tiers, points redemption, targeted campaigns.
- Integrations: accounting (QuickBooks/Xero), e-commerce (Shopify/WooCommerce), deliveries.
- AI-driven sales insights and inventory recommendations.

## 4) Proposed Data Model (High-Level)
This is the foundation. Without it, everything else breaks at scale.

### Core Entities
- Tenant (Organization)
- Location (Store)
- Register (POS device)
- User (Staff)
- Role + Permission
- Customer
- Product (Master)
- Variant (SKU)
- Barcode (Many per SKU)
- Inventory Ledger (stock movements)
- Sale (header)
- SaleLine (line items)
- Payment (split tenders)
- Return (header)
- ReturnLine
- TaxProfile
- DiscountRule
- Offer/Coupon

### Key Rules
- Sales and Returns must be ledger-accurate and auditable.
- Inventory updates happen via ledger entries, not direct stock edits.
- Payments are stored as separate entries to support splits and reconciliation.

## 5) POS Workflow Improvements (Real World)

### Checkout Flow
- Add item -> apply discount -> calculate tax -> tender split -> finalize -> print
- Each step must be reversible and auditable.

### Edge Cases
- Refund on partial item quantity
- Price override with manager approval
- Barcode with embedded weight/price
- Discounts stacking rules

### Minimum UX Enhancements
- Keyboard navigation shortcuts for speed
- Quick add for common items
- Search auto-focus and rapid scan mode

## 6) Security and Compliance

### Required Controls
- Session timeouts and automatic lock
- Supervisor override for sensitive actions
- Audit logs for all critical mutations

### Compliance Targets
- PCI DSS awareness (card processing via certified providers)
- Data privacy: role-based access, minimal PII exposure

## 7) Performance and Scalability

### Data volume expectations
- 10,000+ products per tenant
- 1,000+ transactions per day per store

### Required engineering patterns
- Pagination and virtualization
- Async search queries with debounce
- Caching strategy at API layer

## 8) Architecture Recommendations

### Frontend
- Server components where possible, client only for stateful POS
- Use consistent data fetching hooks, error boundaries, skeletons
- Move all mock data into explicit fixtures and remove in production builds

### Backend (Future)
- REST or GraphQL with tenant context in every request
- Background jobs for sync, analytics, reconciliation
- Event-driven architecture for audit and inventory ledger updates

### Infrastructure
- Multi-tenant database strategy (shared schema + tenant_id)
- Logging, monitoring, alerting
- Backup and disaster recovery plan

## 9) Roadmap (Suggested Phases)

Phase 1: MVP Pilot (6-8 weeks)
- Real auth + roles
- Real DB + API endpoints
- Product variants + inventory ledger
- POS checkout with split payments and refunds

Phase 2: Retail Readiness (8-12 weeks)
- Offline mode
- Hardware integration
- Advanced discounts + loyalty
- Audit log UI

Phase 3: Scale and Growth (12+ weeks)
- Multi-tenant + multi-location
- Reporting exports and APIs
- Integrations ecosystem

## 10) Immediate Next Steps (Actionable)
1) Lock data model and backend contract for products, sales, inventory.
2) Remove mock data from POS flow; wire core endpoints.
3) Build role permission system and enforce it end-to-end.
4) Add POS features: split payments, suspend/recall, refund approvals.
5) Plan offline support and hardware setup UI.

## 11) Risks if Not Addressed
- Data inconsistencies -> lost trust
- Checkout failures -> lost sales
- Lack of audit -> regulatory risk
- Performance bottlenecks -> churn from larger clients

---

This document is intentionally stricter than a normal MVP checklist. POS is a trust product; you only get one chance to be reliable in front of customers.

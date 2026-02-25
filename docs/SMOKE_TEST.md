# Tafuri Web Smoke Test
Last updated: 2026-02-20

## Pre-Reqs
- Backend is running and reachable from the browser.
- `NEXT_PUBLIC_BACKEND_API_URL` is set to the correct base URL.
- Demo seed disabled in production (`NEXT_PUBLIC_ENABLE_DEMO_SEED` not set to true).

## Checklist
1. Login as Admin and confirm you land on the admin dashboard.
2. Open Products, create a product, and verify it appears in the list.
3. Open Inventory, select a location, and confirm stock loads without errors.
4. Open Customers, create a customer, and verify it appears in search.
5. Open Sales, confirm list loads and summary cards render.
6. Open Reports, run a date range query, and export CSV.
7. Open POS, select a location, add items to cart, and complete a cash sale.
8. Open Returns, process a return for a recent sale, and confirm inventory adjusts.
9. Logout and verify you are redirected to the login page.

## Pass/Fail Notes
- Record failed steps with screenshot + console errors.

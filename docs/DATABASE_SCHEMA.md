# Aura POS — PostgreSQL Database Schema

## Architecture Principles

1. **Multi-Tenant via `tenantId`** — Every major entity has a `tenantId` FK. Shared schema, tenant-isolated data.
2. **Ledger-Based Inventory** — No direct stock edits. All changes go through `inventory_transactions`. Current stock is a computed view.
3. **Audit Trail** — `created_by`, `updated_by`, `created_at`, `updated_at` on all mutable entities.
4. **Soft Deletes** — `deleted_at` column where applicable (Products, Customers, Users).
5. **UUID Primary Keys** — For distributed ID generation (offline-first support).

---

## Entity Relationship Diagram (Conceptual)

```
Tenant (Organization)
  ├── Location (Store/Warehouse)
  │     └── Register (POS Device)
  ├── User (Staff)
  │     └── user_roles (M2M with Role)
  ├── Role
  │     └── role_permissions (M2M with Permission)
  ├── Permission
  ├── Category
  ├── Product (Master)
  │     ├── ProductVariant (SKU)
  │     │     └── ProductBarcode
  │     └── ProductBarcode
  ├── TaxProfile
  ├── PriceBook
  │     └── PriceOverride
  ├── InventoryTransaction (Ledger)
  ├── StockTransfer
  │     └── StockTransferLine
  ├── Customer
  │     └── LoyaltyLog
  ├── LoyaltyTier
  ├── Sale
  │     ├── SaleLine
  │     ├── SalePayment
  │     └── SaleTaxEntry
  ├── Return
  │     └── ReturnLine
  ├── Offer (Discount Rule)
  ├── CashShift
  │     └── CashTransaction
  ├── AuditLog
  └── Setting (Key-Value per tenant)
```

---

## Table Definitions

### 1. `tenants` — Organizations/Companies
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() |
| `name` | VARCHAR(255) | NOT NULL |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL |
| `logo_url` | TEXT | |
| `favicon_url` | TEXT | |
| `tagline` | VARCHAR(255) | |
| `contact_email` | VARCHAR(255) | |
| `contact_phone` | VARCHAR(50) | |
| `address` | TEXT | |
| `currency` | VARCHAR(3) | DEFAULT 'USD' |
| `timezone` | VARCHAR(50) | DEFAULT 'UTC' |
| `features` | JSONB | DEFAULT '{}' — Feature flags |
| `subscription_plan` | VARCHAR(50) | DEFAULT 'free' |
| `subscription_status` | VARCHAR(20) | DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 2. `locations` — Stores / Warehouses
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `address` | TEXT | |
| `type` | ENUM('store','warehouse') | NOT NULL |
| `phone` | VARCHAR(50) | |
| `price_book_id` | UUID | FK → price_books, NULLABLE |
| `status` | ENUM('active','inactive') | DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `(tenant_id, status)`

---

### 3. `registers` — POS Devices/Terminals
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `location_id` | UUID | FK → locations, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `device_id` | VARCHAR(255) | NULLABLE — Hardware fingerprint |
| `status` | ENUM('active','inactive') | DEFAULT 'active' |
| `last_seen_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 4. `users` — Staff/Employees
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | UNIQUE within tenant |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(50) | |
| `avatar_url` | TEXT | |
| `pin` | VARCHAR(10) | For supervisor overrides |
| `status` | ENUM('active','inactive','suspended') | DEFAULT 'active' |
| `default_location_id` | UUID | FK → locations, NULLABLE |
| `last_login_at` | TIMESTAMPTZ | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `deleted_at` | TIMESTAMPTZ | NULLABLE — Soft delete |

**Index:** `UNIQUE (tenant_id, email) WHERE deleted_at IS NULL`

---

### 5. `roles`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `description` | TEXT | |
| `is_system` | BOOLEAN | DEFAULT FALSE — system roles can't be deleted |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `UNIQUE (tenant_id, name)`

---

### 6. `permissions`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL (e.g., 'sale.create', 'product.delete', 'refund.approve') |
| `name` | VARCHAR(255) | |
| `module` | VARCHAR(50) | e.g., 'pos', 'inventory', 'admin' |

---

### 7. `role_permissions` (M2M)
| Column | Type | Constraints |
|:---|:---|:---|
| `role_id` | UUID | FK → roles, PK |
| `permission_id` | UUID | FK → permissions, PK |

---

### 8. `user_roles` (M2M)
| Column | Type | Constraints |
|:---|:---|:---|
| `user_id` | UUID | FK → users, PK |
| `role_id` | UUID | FK → roles, PK |

---

### 9. `categories`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `parent_id` | UUID | FK → categories, NULLABLE — For subcategories |
| `icon` | VARCHAR(50) | |
| `sort_order` | INT | DEFAULT 0 |
| `status` | ENUM('active','inactive') | DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `(tenant_id, status)`, `(tenant_id, parent_id)`

---

### 10. `tax_profiles`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL (e.g., 'Standard VAT', 'Food Zero-Rated') |
| `rate` | DECIMAL(5,2) | NOT NULL (e.g., 8.00 for 8%) |
| `type` | ENUM('inclusive','exclusive') | DEFAULT 'exclusive' |
| `is_default` | BOOLEAN | DEFAULT FALSE |
| `status` | ENUM('active','inactive') | DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 11. `products` — Master Product
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `sku` | VARCHAR(100) | NOT NULL |
| `type` | ENUM('simple','variable') | DEFAULT 'simple' |
| `category_id` | UUID | FK → categories, NULLABLE |
| `tax_profile_id` | UUID | FK → tax_profiles, NULLABLE |
| `cost_price` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 |
| `selling_price` | DECIMAL(12,2) | NOT NULL |
| `uom` | VARCHAR(20) | DEFAULT 'pcs' — (pcs, kg, m, l, etc.) |
| `allow_decimals` | BOOLEAN | DEFAULT FALSE |
| `min_stock_level` | DECIMAL(12,3) | DEFAULT 0 |
| `image_url` | TEXT | |
| `status` | ENUM('active','inactive','draft') | DEFAULT 'active' |
| `created_by` | UUID | FK → users |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `deleted_at` | TIMESTAMPTZ | NULLABLE |

**Indexes:**
- `UNIQUE (tenant_id, sku) WHERE deleted_at IS NULL`
- `(tenant_id, category_id, status)`
- `(tenant_id, name)` — for search
- GIN index on `name` using `pg_trgm` for fuzzy search

---

### 12. `product_variants` — SKU-level children
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `sku` | VARCHAR(100) | NOT NULL |
| `name` | VARCHAR(255) | NOT NULL (e.g., 'Large / Red') |
| `price` | DECIMAL(12,2) | NOT NULL — Override of product.selling_price |
| `cost_price` | DECIMAL(12,2) | |
| `attributes` | JSONB | NOT NULL (e.g., {"Size": "L", "Color": "Red"}) |
| `image_url` | TEXT | |
| `status` | ENUM('active','inactive') | DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:**
- `UNIQUE (tenant_id, sku)`
- `(product_id, status)`
- GIN index on `attributes`

---

### 13. `product_barcodes`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `variant_id` | UUID | FK → product_variants, NULLABLE |
| `barcode` | VARCHAR(255) | NOT NULL |
| `type` | ENUM('ean13','upc','code128','custom','embedded_weight') | DEFAULT 'custom' |
| `is_primary` | BOOLEAN | DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `UNIQUE (tenant_id, barcode)`  —  Barcodes must be unique within a tenant

---

### 14. `price_books` — Regional/Store-level pricing
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `is_default` | BOOLEAN | DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 15. `price_overrides`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `price_book_id` | UUID | FK → price_books, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `variant_id` | UUID | FK → product_variants, NULLABLE |
| `price` | DECIMAL(12,2) | NOT NULL |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `UNIQUE (price_book_id, product_id, variant_id)`

---

### 16. `inventory_transactions` — The Ledger (Core!)
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `variant_id` | UUID | FK → product_variants, NULLABLE |
| `location_id` | UUID | FK → locations, NOT NULL |
| `type` | ENUM('IN','OUT','ADJUST','TRANSFER_IN','TRANSFER_OUT','RETURN','SALE') | NOT NULL |
| `quantity` | DECIMAL(12,3) | NOT NULL — Positive for additions, negative for deductions |
| `reason` | TEXT | NOT NULL |
| `reference_type` | VARCHAR(50) | NULLABLE (e.g., 'sale', 'return', 'transfer', 'purchase_order') |
| `reference_id` | UUID | NULLABLE — FK to the relevant record |
| `cost_at_time` | DECIMAL(12,2) | Snapshot of cost price at transaction time |
| `performed_by` | UUID | FK → users, NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:**
- `(tenant_id, product_id, location_id, created_at)`
- `(tenant_id, location_id, type)`
- `(reference_type, reference_id)`

**Views:**
```sql
CREATE VIEW inventory_levels AS
SELECT tenant_id, product_id, variant_id, location_id,
       SUM(quantity) AS current_stock
FROM inventory_transactions
GROUP BY tenant_id, product_id, variant_id, location_id;
```

---

### 17. `stock_transfers`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `from_location_id` | UUID | FK → locations, NOT NULL |
| `to_location_id` | UUID | FK → locations, NOT NULL |
| `status` | ENUM('draft','pending','shipped','received','cancelled') | DEFAULT 'draft' |
| `notes` | TEXT | |
| `shipped_by` | UUID | FK → users, NULLABLE |
| `received_by` | UUID | FK → users, NULLABLE |
| `shipped_at` | TIMESTAMPTZ | |
| `received_at` | TIMESTAMPTZ | |
| `created_by` | UUID | FK → users, NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 18. `stock_transfer_lines`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `transfer_id` | UUID | FK → stock_transfers, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `variant_id` | UUID | FK → product_variants, NULLABLE |
| `quantity` | DECIMAL(12,3) | NOT NULL |
| `received_quantity` | DECIMAL(12,3) | NULLABLE — For partial receives |

---

### 19. `customers`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(50) | |
| `email` | VARCHAR(255) | |
| `address` | TEXT | |
| `notes` | TEXT | |
| `total_spent` | DECIMAL(12,2) | DEFAULT 0 |
| `loyalty_points` | INT | DEFAULT 0 |
| `tier_id` | UUID | FK → loyalty_tiers, NULLABLE |
| `status` | ENUM('active','inactive') | DEFAULT 'active' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `deleted_at` | TIMESTAMPTZ | NULLABLE |

**Indexes:**
- `(tenant_id, phone)` — quick lookup
- `(tenant_id, email)`
- `(tenant_id, name)` — search

---

### 20. `loyalty_tiers`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(100) | NOT NULL |
| `min_spend` | DECIMAL(12,2) | NOT NULL |
| `earn_rate` | DECIMAL(5,2) | NOT NULL (points per $1) |
| `color` | VARCHAR(7) | |
| `sort_order` | INT | DEFAULT 0 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 21. `loyalty_logs`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `customer_id` | UUID | FK → customers, NOT NULL |
| `sale_id` | UUID | FK → sales, NULLABLE |
| `type` | ENUM('earning','redemption','adjustment','expiry') | NOT NULL |
| `points` | INT | NOT NULL — Positive for earn, negative for burn |
| `balance_after` | INT | NOT NULL — Running balance |
| `reason` | TEXT | |
| `performed_by` | UUID | FK → users, NULLABLE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `(tenant_id, customer_id, created_at DESC)`

---

### 22. `sales` — Transaction Header
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `location_id` | UUID | FK → locations, NOT NULL |
| `register_id` | UUID | FK → registers, NULLABLE |
| `invoice_no` | VARCHAR(50) | NOT NULL |
| `customer_id` | UUID | FK → customers, NULLABLE |
| `cashier_id` | UUID | FK → users, NOT NULL |
| `subtotal` | DECIMAL(12,2) | NOT NULL |
| `discount_total` | DECIMAL(12,2) | DEFAULT 0 |
| `tax_total` | DECIMAL(12,2) | DEFAULT 0 |
| `total` | DECIMAL(12,2) | NOT NULL |
| `loyalty_points_earned` | INT | DEFAULT 0 |
| `loyalty_points_redeemed` | INT | DEFAULT 0 |
| `loyalty_discount` | DECIMAL(12,2) | DEFAULT 0 |
| `status` | ENUM('completed','voided','returned','partially_returned') | DEFAULT 'completed' |
| `notes` | TEXT | |
| `shift_id` | UUID | FK → cash_shifts, NULLABLE |
| `is_offline` | BOOLEAN | DEFAULT FALSE — Was created offline? |
| `offline_id` | UUID | NULLABLE — Client-generated UUID for dedup |
| `completed_at` | TIMESTAMPTZ | NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:**
- `UNIQUE (tenant_id, invoice_no)`
- `UNIQUE (tenant_id, offline_id) WHERE offline_id IS NOT NULL` — Dedup offline sales
- `(tenant_id, location_id, completed_at DESC)`
- `(tenant_id, customer_id)`
- `(tenant_id, cashier_id, completed_at)`

---

### 23. `sale_lines` — Line Items
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `sale_id` | UUID | FK → sales, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `variant_id` | UUID | FK → product_variants, NULLABLE |
| `sku` | VARCHAR(100) | NOT NULL — Snapshot |
| `name` | VARCHAR(255) | NOT NULL — Snapshot |
| `quantity` | DECIMAL(12,3) | NOT NULL |
| `unit_price` | DECIMAL(12,2) | NOT NULL — Price at time of sale |
| `cost_price` | DECIMAL(12,2) | NOT NULL — Cost at time of sale (for margin calc) |
| `discount_amount` | DECIMAL(12,2) | DEFAULT 0 |
| `tax_rate` | DECIMAL(5,2) | NOT NULL |
| `tax_type` | ENUM('inclusive','exclusive') | DEFAULT 'exclusive' |
| `tax_amount` | DECIMAL(12,2) | NOT NULL |
| `line_total` | DECIMAL(12,2) | NOT NULL — (unit_price * qty) - discount + tax |
| `offer_id` | UUID | FK → offers, NULLABLE — Which offer applied |

**Index:** `(sale_id)`

---

### 24. `sale_payments` — Split Tender Support
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `sale_id` | UUID | FK → sales, NOT NULL |
| `method` | ENUM('cash','card','digital_wallet','gift_card','loyalty','other') | NOT NULL |
| `amount` | DECIMAL(12,2) | NOT NULL |
| `reference` | VARCHAR(255) | NULLABLE — Card last 4, txn ref, etc. |
| `change_amount` | DECIMAL(12,2) | DEFAULT 0 — For cash overpayment |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `(sale_id)`

---

### 25. `returns` — Return Header
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `location_id` | UUID | FK → locations, NOT NULL |
| `sale_id` | UUID | FK → sales, NOT NULL |
| `invoice_no` | VARCHAR(50) | NOT NULL — Return invoice |
| `customer_id` | UUID | FK → customers, NULLABLE |
| `refund_total` | DECIMAL(12,2) | NOT NULL |
| `reason` | TEXT | NOT NULL |
| `status` | ENUM('pending','approved','rejected','completed') | DEFAULT 'pending' |
| `processed_by` | UUID | FK → users, NOT NULL |
| `approved_by` | UUID | FK → users, NULLABLE |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `completed_at` | TIMESTAMPTZ | NULLABLE |

---

### 26. `return_lines`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `return_id` | UUID | FK → returns, NOT NULL |
| `sale_line_id` | UUID | FK → sale_lines, NOT NULL |
| `product_id` | UUID | FK → products, NOT NULL |
| `variant_id` | UUID | FK → product_variants, NULLABLE |
| `quantity` | DECIMAL(12,3) | NOT NULL |
| `refund_amount` | DECIMAL(12,2) | NOT NULL |
| `restock` | BOOLEAN | DEFAULT TRUE — Should we put it back in inventory? |

---

### 27. `offers` — Discounts/Promotions
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `name` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `type` | ENUM('percentage','fixed','buy_x_get_y','bundle','category_discount') | NOT NULL |
| `value` | DECIMAL(12,2) | NOT NULL |
| `min_purchase` | DECIMAL(12,2) | NULLABLE |
| `max_discount` | DECIMAL(12,2) | NULLABLE |
| `applicable_on` | ENUM('all','category','product') | NOT NULL |
| `category_id` | UUID | FK → categories, NULLABLE |
| `product_ids` | UUID[] | NULLABLE — Array of product IDs |
| `start_date` | TIMESTAMPTZ | NOT NULL |
| `end_date` | TIMESTAMPTZ | NOT NULL |
| `status` | ENUM('active','inactive','scheduled') | DEFAULT 'active' |
| `auto_apply` | BOOLEAN | DEFAULT TRUE |
| `created_by` | UUID | FK → users |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 28. `cash_shifts`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `location_id` | UUID | FK → locations, NOT NULL |
| `register_id` | UUID | FK → registers, NULLABLE |
| `cashier_id` | UUID | FK → users, NOT NULL |
| `start_time` | TIMESTAMPTZ | NOT NULL |
| `end_time` | TIMESTAMPTZ | NULLABLE |
| `start_amount` | DECIMAL(12,2) | NOT NULL — Opening float |
| `end_amount` | DECIMAL(12,2) | NULLABLE — Counted amount |
| `expected_amount` | DECIMAL(12,2) | NULLABLE — Calculated |
| `status` | ENUM('open','closed') | DEFAULT 'open' |
| `notes` | TEXT | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 29. `cash_transactions`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `shift_id` | UUID | FK → cash_shifts, NOT NULL |
| `type` | ENUM('sale','refund','pay_in','pay_out') | NOT NULL |
| `amount` | DECIMAL(12,2) | NOT NULL |
| `reason` | TEXT | |
| `reference_id` | UUID | NULLABLE — FK to sale/return |
| `performed_by` | UUID | FK → users, NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

---

### 30. `audit_logs`
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `user_id` | UUID | FK → users, NOT NULL |
| `action` | VARCHAR(100) | NOT NULL (e.g., 'product.create', 'sale.void', 'refund.approve') |
| `entity_type` | VARCHAR(50) | NOT NULL (e.g., 'product', 'sale', 'inventory') |
| `entity_id` | UUID | NOT NULL |
| `changes` | JSONB | NULLABLE — { before: {...}, after: {...} } |
| `ip_address` | VARCHAR(45) | |
| `user_agent` | TEXT | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `(tenant_id, entity_type, entity_id)`, `(tenant_id, user_id, created_at DESC)`

---

### 31. `settings` — Tenant-level key-value config
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants, NOT NULL |
| `location_id` | UUID | FK → locations, NULLABLE — NULL = global tenant setting |
| `key` | VARCHAR(100) | NOT NULL |
| `value` | JSONB | NOT NULL |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `UNIQUE (tenant_id, location_id, key)`

**Example Keys:**
- `invoice.prefix` → `"INV"`
- `invoice.footer` → `"Thank you for shopping!"`
- `hardware.printer.ip` → `"192.168.1.100"`
- `hardware.scanner.mode` → `"hid"`
- `pos.tax_inclusive` → `true`

---

### 32. `refresh_tokens` — JWT Auth
| Column | Type | Constraints |
|:---|:---|:---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `token_hash` | VARCHAR(255) | NOT NULL |
| `expires_at` | TIMESTAMPTZ | NOT NULL |
| `revoked` | BOOLEAN | DEFAULT FALSE |
| `device_info` | TEXT | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |

**Index:** `(user_id, revoked)`

---

## Key Design Decisions

### Why JSONB for `attributes`?
Product variants have dynamic attribute sets (Size/Color/Material for clothing, Storage/Color for gadgets, Weight/Brand for supermarket). JSONB with GIN indexing gives flexibility + query performance.

### Why `inventory_transactions` ledger instead of a `stock` column?
- **Auditability**: Every stock change has a reason, performer, and timestamp
- **Correctness**: Current stock is always SUM(quantity) — no drift
- **Flexibility**: Easy to filter by date range, type, location
- **Reconciliation**: Z-Report can compare ledger totals vs counted amounts

### Why `offline_id` on Sales?
When offline, the POS client generates a UUID locally. When syncing, the server checks `offline_id` for deduplication — preventing double-counted sales if sync retries occur.

### Why snapshot fields on `sale_lines`?
`sku`, `name`, `unit_price`, `cost_price`, `tax_rate` are **frozen at sale time**. This ensures historical reports remain accurate even if products are later updated or deleted.

// ============================================
// Aura POS — NestJS TypeORM Entity Index
// ============================================
// 32 tables covering full SaaS POS requirements
// Compatible with PostgreSQL + TypeORM + NestJS
// ============================================

// === Multi-Tenant Core ===
export { Tenant } from './tenant.entity';
export { Location } from './location.entity';
export { Register } from './register.entity';

// === Auth & RBAC ===
export { User } from './user.entity';
export { Role } from './role.entity';
export { Permission } from './permission.entity';
export { RefreshToken } from './refresh-token.entity';

// === Products & Catalog ===
export { Category } from './category.entity';
export { Product } from './product.entity';
export { ProductVariant } from './product-variant.entity';
export { ProductBarcode } from './product-barcode.entity';
export { TaxProfile } from './tax-profile.entity';

// === Pricing ===
export { PriceBook } from './price-book.entity';
export { PriceOverride } from './price-override.entity';

// === Inventory ===
export { InventoryTransaction, InventoryTransactionType } from './inventory-transaction.entity';
export { StockTransfer } from './stock-transfer.entity';
export { StockTransferLine } from './stock-transfer-line.entity';

// === Sales & Payments ===
export { Sale } from './sale.entity';
export { SaleLine } from './sale-line.entity';
export { SalePayment } from './sale-payment.entity';

// === Returns ===
export { Return } from './return.entity';
export { ReturnLine } from './return-line.entity';

// === Promotions ===
export { Offer } from './offer.entity';

// === Customers & Loyalty ===
export { Customer } from './customer.entity';
export { LoyaltyTier } from './loyalty-tier.entity';
export { LoyaltyLog } from './loyalty-log.entity';

// === Cash Management ===
export { CashShift } from './cash-shift.entity';
export { CashTransaction } from './cash-transaction.entity';

// === Audit & Config ===
export { AuditLog } from './audit-log.entity';
export { Setting } from './setting.entity';

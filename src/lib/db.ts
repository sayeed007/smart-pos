import Dexie, { type EntityTable } from "dexie";
import {
  Product,
  InventoryTransaction,
  StockTransfer,
  PriceBook,
  PriceOverride,
  Customer,
  LoyaltyTier,
  LoyaltyLog,
  Offer,
} from "@/types";

// Define the database structure
export interface SaleQueueItem {
  id: string; // Temp ID (uuid)
  items: {
    id: string; // product/variant id
    quantity: number;
    price: number;
    name: string;
    taxRate: number;
    sku?: string;
    originalProductId?: string; // parent product id for variants
    categoryId?: string;
    image?: string;
  }[];
  total: number;
  paymentMethod: string;
  payments?: { method: string; amount: number }[];
  locationId?: string;
  registerId?: string;
  shiftId?: string;
  cashierId: string;
  status: "pending" | "synced" | "failed";
  createdAt: string; // ISO String
  syncedAt?: string;
  errorReason?: string;
  customerId?: string;
  redeemedPoints?: number;
  loyaltyDiscount?: number;
}

export interface CashShift {
  id: string;
  cashierId: string;
  startTime: string;
  endTime?: string;
  startAmount: number;
  endAmount?: number; // Counted amount
  expectedAmount?: number; // Calculated amount
  status: "open" | "closed";
  notes?: string;
}

export interface CashTransaction {
  id: string;
  shiftId: string;
  type: "sale" | "refund" | "pay_in" | "pay_out";
  amount: number;
  reason?: string;
  timestamp: string;
  referenceId?: string;
}

export interface InventoryLevel {
  productId: string;
  locationId: string;
  variantId?: string;
  quantity: number;
  updatedAt?: string;
}

const db = new Dexie("AuraPOSDB") as Dexie & {
  products: EntityTable<Product, "id">;
  inventoryTransactions: EntityTable<InventoryTransaction, "id">;
  salesQueue: EntityTable<SaleQueueItem, "id">;
  suspendedSales: EntityTable<SaleQueueItem, "id">;
  cashShifts: EntityTable<CashShift, "id">;
  cashTransactions: EntityTable<CashTransaction, "id">;
  inventoryLevels: EntityTable<InventoryLevel, any>; // Compound key
  stockTransfers: EntityTable<StockTransfer, "id">;
  priceBooks: EntityTable<PriceBook, "id">;
  priceOverrides: EntityTable<PriceOverride, "id">;
  customers: EntityTable<Customer, "id">;
  loyaltyTiers: EntityTable<LoyaltyTier, "id">;
  loyaltyLogs: EntityTable<LoyaltyLog, "id">;
  offers: EntityTable<Offer, "id">;
};

const allowDemoSeed =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_SEED === "true" ||
  process.env.NODE_ENV === "development";

// Define indices for fast searching
db.version(1).stores({
  products: "id, name, sku, barcode, categoryId, status",
  inventoryTransactions: "id, productId, type, timestamp",
  salesQueue: "id, status, createdAt",
});

db.version(2).stores({
  suspendedSales: "id, createdAt",
});

db.version(3).stores({
  cashShifts: "id, status, startTime",
  cashTransactions: "id, shiftId, type, timestamp",
});

db.version(4).stores({
  inventoryLevels: "[productId+locationId], productId, locationId",
});

db.version(5).stores({
  stockTransfers: "id, fromLocationId, toLocationId, status, createdAt",
});

db.version(6).stores({
  priceBooks: "id, isDefault",
  priceOverrides:
    "[priceBookId+productId], [priceBookId+variantId], priceBookId",
});

db.version(7).stores({
  customers: "id, phone, email, tierId",
  loyaltyTiers: "id, minSpend",
  loyaltyLogs: "id, customerId, saleId, type, createdAt",
});

db.version(8).stores({
  offers: "id, type, status, startDate, endDate",
});

db.version(9).stores({
  customers: "id, name, phone, email, tierId",
});

// Helper function to sync Products (Simple strategy: Overwrite local with remote on load)
export const syncProductsToLocal = async (products: Product[]) => {
  try {
    await db.products.bulkPut(products);

    if (allowDemoSeed) {
      // Seed Loyalty Tiers (MVP)
      const tiers: LoyaltyTier[] = [
        {
          id: "tier-bronze",
          name: "Bronze",
          minSpend: 0,
          earnRate: 1,
          color: "#CD7F32",
        },
        {
          id: "tier-silver",
          name: "Silver",
          minSpend: 500,
          earnRate: 1.5,
          color: "#C0C0C0",
        },
        {
          id: "tier-gold",
          name: "Gold",
          minSpend: 2000,
          earnRate: 2,
          color: "#FFD700",
        },
      ];
      await db.loyaltyTiers.bulkPut(tiers);

      // Seed Sample Customer
      const sampleCustomer: Customer = {
        id: "cust-1",
        name: "John Doe",
        phone: "555-0123",
        email: "john@example.com",
        totalSpent: 1200,
        loyaltyPoints: 150,
        tierId: "tier-silver",
        history: [], // Populate with IDs if needed
      };
      await db.customers.put(sampleCustomer);
    }

    // P2: Populate default inventory levels for Main Store (loc1)
    // In production, this data should come from a dedicated /inventory/levels API
    const levels: InventoryLevel[] = [];

    products.forEach((p) => {
      // Main product stock
      levels.push({
        productId: p.id,
        locationId: "loc1",
        quantity: p.stockQuantity,
        updatedAt: new Date().toISOString(),
      });

      // Variant stock
      if (p.variants) {
        p.variants.forEach((v) => {
          levels.push({
            productId: p.id,
            variantId: v.id,
            locationId: "loc1",
            quantity: v.stockQuantity,
            updatedAt: new Date().toISOString(),
          });
        });
      }
    });

    if (allowDemoSeed) {
      // Seed Sample Price Data (MVP)
      const downtownBook: PriceBook = {
        id: "pb-downtown",
        name: "Downtown Pricing",
        description: "Premium pricing for CBD store",
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
      await db.priceBooks.put(downtownBook);

      // Override first 3 products with +20% price
      const overrides: PriceOverride[] = products.slice(0, 3).map((p) => ({
        id: `ov-${p.id}`,
        priceBookId: "pb-downtown",
        productId: p.id,
        price: Number((p.sellingPrice * 1.2).toFixed(2)),
        updatedAt: new Date().toISOString(),
      }));
      await db.priceOverrides.bulkPut(overrides);
    }

    await db.inventoryLevels.bulkPut(levels);
  } catch (error) {
    console.error("Dexie Sync Error:", error);
  }
};

export const updateLocalStock = async (
  transactions: InventoryTransaction[],
) => {
  try {
    await db.transaction("rw", db.inventoryLevels, async () => {
      for (const tx of transactions) {
        // Dexie compound key get
        const level = await db.inventoryLevels.get({
          productId: tx.productId,
          locationId: tx.locationId,
        });

        // Determine numeric change to stock
        let change = tx.quantity;

        // If quantity is positive but type implies reduction, negate it.
        // If quantity is already negative (e.g. from StockAdjustment), trust it.
        if (change > 0 && (tx.type === "OUT" || tx.type === "TRANSFER")) {
          change = -change;
        }

        if (level) {
          await db.inventoryLevels.put({
            ...level,
            quantity: level.quantity + change,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Create new level (even if negative, to track overselling)
          await db.inventoryLevels.put({
            productId: tx.productId,
            locationId: tx.locationId,
            variantId: tx.variantId,
            quantity: change,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });
  } catch (e) {
    console.error("Failed to update local stock", e);
  }
};

export { db };

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  CASHIER = "Cashier",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | { id: string; name: string };
  status: "active" | "inactive";
}

export interface Role {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
  totalValue: number;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  status: "active" | "inactive";
  image?: string;
  type: "simple" | "variable";
  variants?: Variant[];
  // Extended P0 Fields
  barcodes?: string[]; // Multiple barcodes (Manufacturer, Store, etc.)
  uom?: string; // Unit of Measure: 'pcs', 'kg', 'm', 'l'
  allowDecimals?: boolean; // If true, allows 1.5 kg, etc.
  // Multi-location stock
  locationWiseStock?: Array<{
    locationId: string;
    locationName: string;
    stock: number;
  }>;
}

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number; // Override product price
  stockQuantity: number;
  attributes: Record<string, string>; // e.g. { Color: "Red", Size: "L" }
  barcodes?: string[]; // Variant-specific barcodes
  // Multi-location stock
  locationWiseStock?: Array<{
    locationId: string;
    locationName: string;
    stock: number;
  }>;
}

export interface CartItem extends Product {
  quantity: number;
  originalProductId?: string;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "buy_x_get_y" | "bundle" | "category_discount";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  applicableOn: "all" | "category" | "product";
  categoryId?: string | null;
  productIds?: string[];
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "scheduled";
  rule?: OfferRule;
}

export type OfferRule =
  | {
      buyXGetY?: {
        buyProductIds: string[];
        getProductIds?: string[];
        buyQty: number;
        getQty: number;
        sameProduct: boolean;
        discountType: "free" | "percent" | "fixed";
        discountValue?: number;
      };
    }
  | {
      bundle?: {
        productIds: string[];
        pricingType: "fixed_price" | "percent";
        price?: number;
        percent?: number;
      };
    };

export interface SaleLine {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    categoryId: string;
    imageUrl?: string;
  };
}

export interface SalePayment {
  id: string;
  method: string;
  amount: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  completedAt: string; // ISO date
  createdAt: string;

  // Financials
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;

  // Relations
  lines: SaleLine[];
  payments: SalePayment[];
  customer?: { id: string; name: string };
  cashier?: { id: string; name: string };
  location?: { id: string; name: string };

  status: "COMPLETED" | "RETURNED" | "VOIDED";
  cashierId: string;
  customerId?: string;
  locationId?: string;

  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;

  // Legacy / Mapped fields (optional for backward compatibility)
  date?: string;
  time?: string;
  items?: CartItem[];
  discount?: number;
  tax?: number;
  paymentMethod?: string;
  customerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  loyaltyPoints: number; // Current Balance
  tierId?: string; // Current Tier
  history: string[];
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minSpend: number;
  earnRate: number; // Points per $1
  color: string; // UI Color
}

export interface LoyaltyLog {
  id: string;
  customerId: string;
  saleId?: string;
  type: "earning" | "redemption" | "adjustment";
  points: number;
  reason?: string;
  createdAt: string;
}

export interface Return {
  id: string;
  saleId: string;
  invoiceNo: string;
  date: string;
  items: CartItem[];
  refundAmount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  processedBy: string;
  customerName?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  variantId?: string;
  type: "IN" | "OUT" | "ADJUST" | "TRANSFER" | "RETURN";
  quantity: number;
  reason: string;
  referenceId?: string;
  performedBy: string;
  timestamp?: string; // Legacy/Local
  createdAt: string; // From Backend
  locationId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    image?: string;
  };
  variant?: {
    id: string;
    productId: string;
    sku: string;
    name: string;
  };
  performer?: {
    id: string;
    name: string;
  };
}

export interface Location {
  id: string;
  name: string;
  address: string;
  type: "store" | "warehouse";
  status: "active" | "inactive";
  priceBookId?: string; // Optional: if null, use base price
}

export interface PriceBook {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface PriceOverride {
  id: string;
  priceBookId: string;
  productId: string;
  variantId?: string;
  price: number;
  updatedAt: string;
}

export interface StockTransfer {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  fromLocation?: {
    id: string;
    name: string;
  };
  toLocation?: {
    id: string;
    name: string;
  };
  lines: {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    product: {
      name: string;
      sku: string;
    };
    variant?: {
      name: string;
      sku: string;
    };
  }[];
  status: "DRAFT" | "PENDING" | "SHIPPED" | "RECEIVED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  shippedBy?: string;
  receivedBy?: string;
  notes?: string;
}

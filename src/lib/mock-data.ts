
import { User, UserRole, Category, Product, Offer, Customer, Sale, Return, InventoryTransaction, Location } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Dresses', productCount: 3, totalValue: 6579.03, icon: '👗' },
    { id: '2', name: 'Tops', productCount: 3, totalValue: 5298.32, icon: '👚' },
    { id: '3', name: 'Bottoms', productCount: 3, totalValue: 4846.99, icon: '👖' },
    { id: '4', name: 'Outerwear', productCount: 2, totalValue: 4479.48, icon: '🧥' },
    { id: '5', name: 'Accessories', productCount: 4, totalValue: 6493.52, icon: '👜' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', type: 'simple', name: 'Floral Summer Dress', sku: 'WCL-DR-001', barcode: '1234567890001', categoryId: '1', costPrice: 40, sellingPrice: 59.99, taxRate: 8, stockQuantity: 44, minStockLevel: 20, status: 'active', image: 'https://picsum.photos/seed/dress1/400/400' },
    { id: 'p2', type: 'simple', name: 'White Cotton Blouse', sku: 'WCL-TP-001', barcode: '1234567890002', categoryId: '2', costPrice: 20, sellingPrice: 35.99, taxRate: 8, stockQuantity: 59, minStockLevel: 15, status: 'active', image: 'https://picsum.photos/seed/top1/400/400' },
    { id: 'p3', type: 'simple', name: 'High-Waist Blue Jeans', sku: 'WCL-BT-001', barcode: '1234567890003', categoryId: '3', costPrice: 30, sellingPrice: 49.99, taxRate: 8, stockQuantity: 35, minStockLevel: 25, status: 'active', image: 'https://picsum.photos/seed/jean1/400/400' },
    { id: 'p4', type: 'simple', name: 'Leather Crossbody Bag', sku: 'WCL-AC-001', barcode: '1234567890004', categoryId: '5', costPrice: 50, sellingPrice: 79.99, taxRate: 8, stockQuantity: 25, minStockLevel: 10, status: 'active', image: 'https://picsum.photos/seed/bag1/400/400' },
    { id: 'p5', type: 'simple', name: 'Black Evening Dress', sku: 'WCL-DR-002', barcode: '1234567890005', categoryId: '1', costPrice: 60, sellingPrice: 89.99, taxRate: 8, stockQuantity: 20, minStockLevel: 10, status: 'active', image: 'https://picsum.photos/seed/dress2/400/400' },
    {
        id: 'p6',
        type: 'variable',
        name: 'Striped T-Shirt',
        sku: 'WCL-TP-002',
        barcode: '1234567890006',
        uom: 'pcs',
        barcodes: ['1234567890006', 'STORE-TP-002'],
        categoryId: '2',
        costPrice: 10,
        sellingPrice: 19.99,
        taxRate: 8,
        stockQuantity: 80,
        minStockLevel: 30,
        status: 'active',
        image: 'https://picsum.photos/seed/top2/400/400',
        variants: [
            { id: 'v1', productId: 'p6', sku: 'WCL-TP-002-S', name: 'Small', price: 19.99, stockQuantity: 30, attributes: { Size: 'S' }, barcodes: ['BAR-S-001'] },
            { id: 'v2', productId: 'p6', sku: 'WCL-TP-002-M', name: 'Medium', price: 21.99, stockQuantity: 30, attributes: { Size: 'M' }, barcodes: ['BAR-M-002'] },
            { id: 'v3', productId: 'p6', sku: 'WCL-TP-002-L', name: 'Large', price: 21.99, stockQuantity: 20, attributes: { Size: 'L' }, barcodes: ['BAR-L-003'] }
        ]
    },
    {
        id: 'p10',
        type: 'simple',
        name: 'Fresh Fuji Apples',
        sku: 'FRT-APL-001',
        barcode: '99001',
        uom: 'kg',
        allowDecimals: true,
        barcodes: ['99001'],
        categoryId: '1', // Just putting in category 1 for now
        costPrice: 2.50,
        sellingPrice: 4.99,
        taxRate: 0,
        stockQuantity: 150.5, // Decimal stock
        minStockLevel: 20,
        status: 'active',
        image: 'https://picsum.photos/seed/apple1/400/400'
    },
    { id: 'p7', type: 'simple', name: 'Daydreamer Tunic', sku: 'BEV-001', barcode: '1234567890007', categoryId: '2', costPrice: 25, sellingPrice: 45.00, taxRate: 8, stockQuantity: 5, minStockLevel: 20, status: 'active', image: 'https://picsum.photos/seed/top3/400/400' },
    { id: 'p8', type: 'simple', name: 'Freesia Flow Skirt', sku: 'DAI-012', barcode: '1234567890008', categoryId: '3', costPrice: 28, sellingPrice: 42.00, taxRate: 8, stockQuantity: 8, minStockLevel: 15, status: 'active', image: 'https://picsum.photos/seed/skirt1/400/400' },
    { id: 'p9', type: 'simple', name: 'Golden Hour Shorts', sku: 'BAK-005', barcode: '1234567890009', categoryId: '3', costPrice: 15, sellingPrice: 32.00, taxRate: 8, stockQuantity: 12, minStockLevel: 25, status: 'active', image: 'https://picsum.photos/seed/shorts1/400/400' },
];

export const MOCK_OFFERS: Offer[] = [
    {
        id: "1",
        name: "25% Off All Dresses",
        description: "Get 25% discount on all dresses - Perfect for any occasion!",
        type: "percentage",
        value: 25,
        applicableOn: "category",
        categoryId: "1",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        status: "active",
    },
    {
        id: "2",
        name: "Buy 2 Get 1 Free - Tops",
        description: "Buy 2 tops and get 1 free! Mix and match any styles",
        type: "buy_x_get_y",
        value: 0,
        applicableOn: "category",
        categoryId: "2",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        status: "active",
    },
    {
        id: "3",
        name: "$15 Off on Orders Above $100",
        description: "Get $15 off on total cart value above $100",
        type: "fixed",
        value: 15,
        minPurchase: 100,
        applicableOn: "all",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        status: "active",
    },
    {
        id: "4",
        name: "Accessories Sale - 30% Off",
        description: "Bags, jewelry, sunglasses and more at 30% off!",
        type: "percentage",
        value: 30,
        applicableOn: "category",
        categoryId: "5",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        status: "active",
    },
    {
        id: "5",
        name: "Winter Outerwear - 20% Off",
        description: "Stay warm and stylish with 20% off all outerwear",
        type: "percentage",
        value: 20,
        applicableOn: "category",
        categoryId: "4",
        startDate: "2024-01-01",
        endDate: "2026-03-31",
        status: "active",
    },
];

// Reconstruct sales properly if needed, but for now copy as is
export const MOCK_SALES: Sale[] = [
    {
        id: 's1', invoiceNo: '#INV-2025-0342', date: '2025-01-20', time: '08:30 PM', items: [
            { ...MOCK_PRODUCTS[0], quantity: 2 },
            { ...MOCK_PRODUCTS[1], quantity: 1 },
            { ...MOCK_PRODUCTS[3], quantity: 1 }
        ], subtotal: 254.85, discount: 0, tax: 20.39, total: 275.24, paymentMethod: 'Cash', status: 'Completed', cashierId: 'u3'
    },
    { id: 's2', invoiceNo: '#INV-2025-0341', date: '2025-01-20', time: '08:15 PM', items: [{ ...MOCK_PRODUCTS[1], quantity: 2 }], subtotal: 71.98, discount: 5, tax: 5.76, total: 72.74, paymentMethod: 'Card', status: 'Completed', cashierId: 'u3' },
    { id: 's3', invoiceNo: '#INV-2025-0340', date: '2025-01-20', time: '08:10 PM', items: [{ ...MOCK_PRODUCTS[2], quantity: 1 }], subtotal: 49.99, discount: 0, tax: 4.00, total: 53.99, paymentMethod: 'Card', status: 'Completed', cashierId: 'u3' },
    { id: 's4', invoiceNo: '#INV-2025-0339', date: '2025-01-20', time: '08:05 PM', items: [{ ...MOCK_PRODUCTS[4], quantity: 1 }], subtotal: 89.99, discount: 0, tax: 7.20, total: 97.19, paymentMethod: 'Cash', status: 'Completed', cashierId: 'u3' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'c1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com', totalSpent: 2500, loyaltyPoints: 250, history: [] },
    { id: 'c2', name: 'Jane Smith', phone: '+1234567891', email: 'jane@example.com', totalSpent: 1200, loyaltyPoints: 120, history: [] },
];

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@pos.com', role: UserRole.ADMIN, status: 'active' },
    { id: 'u2', name: 'John Manager', email: 'manager@pos.com', role: UserRole.MANAGER, status: 'active' },
    { id: 'u3', name: 'Jane Watson', email: 'cashier@pos.com', role: UserRole.CASHIER, status: 'active' },
];

// --- Dashboard Specific Mocks ---

export const MOCK_RECENT_SALES_DASHBOARD = [
    {
        id: "1",
        invoiceNo: "INV-2024-0342",
        date: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
        total: 127.50,
        status: "Completed",
        items: [{ image: "/placeholder-product.jpg" }]
    },
    {
        id: "2",
        invoiceNo: "INV-2024-0341",
        date: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
        total: 89.25,
        status: "Completed",
        items: [{ image: "/placeholder-product.jpg" }]
    },
    {
        id: "3",
        invoiceNo: "INV-2024-0340",
        date: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
        total: 245.80,
        status: "Completed",
        items: [{ image: "/placeholder-product.jpg" }]
    },
    {
        id: "4",
        invoiceNo: "INV-2024-0339",
        date: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 mins ago
        total: 56.40,
        status: "Completed",
        items: [{ image: "/placeholder-product.jpg" }]
    }
];

export const MOCK_TOP_CATEGORIES_STATS = [
    { name: "Dresses", value: 8420, percent: 75 },
    { name: "Tops & Blouses", value: 6230, percent: 55 },
    { name: "Outwear", value: 6230, percent: 55 },
    { name: "Bottoms", value: 5180, percent: 45 },
    { name: "Accessories", value: 4750, percent: 25 },
];

export const MOCK_LOW_STOCK_ITEMS = [
    {
        id: "1",
        name: "Dresses",
        sku: "BEV-001",
        stockQuantity: 5,
        minStockLevel: 20,
        image: "/placeholder-product.jpg"
    },
    {
        id: "2",
        name: "Tops & Blouses",
        sku: "DAI-012",
        stockQuantity: 8,
        minStockLevel: 15,
        image: "/placeholder-product.jpg"
    },
    {
        id: "3",
        name: "Bottoms",
        sku: "BAK-005",
        stockQuantity: 12,
        minStockLevel: 25,
        image: "/placeholder-product.jpg"
    },
    {
        id: "4",
        name: "Outwear",
        sku: "DAI-012",
        stockQuantity: 8,
        minStockLevel: 15,
        image: "/placeholder-product.jpg"
    }
];

export const MOCK_PAYMENT_STATS = [
    { name: "Cash Payments", value: 12546.0 },
    { name: "Card Payments", value: 145.0 },
    { name: "Digital Wallet", value: 89.20 }
];

export const generateMockDailyRevenue = (days = 30) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        // Generate random revenue between 15000 and 25000 with some "trend"
        const baseRevenue = 20000;
        // Using sin/cos based on index to create deterministic "random-looking" variation
        const randomVariation = (Math.sin(i * 1234) * 0.5 + 0.5) * 5000 - 2500;
        const trend = Math.sin(i / 5) * 2000; // distinct curve
        const amount = Math.max(0, baseRevenue + randomVariation + trend);
        data.push({
            date: date.toISOString().split("T")[0],
            total: amount,
        });
    }
    return data;
};

export const MOCK_STATS_CARDS = [
    {
        key: "totalSales",
        translationKey: "stats.totalSales",
        icon: "/icons/TotalSales.png",
        iconBg: "bg-[#FF6B6B]",
    },
    {
        key: "totalProducts",
        translationKey: "stats.totalProducts",
        icon: "/icons/TotalProducts.png",
        iconBg: "bg-[#00D68F]",
    },
    {
        key: "customers",
        translationKey: "stats.customers",
        value: "2",
        icon: "/icons/Customers.png",
        iconBg: "bg-[#A855F7]",
    },
    {
        key: "lowStock",
        translationKey: "stats.lowStock",
        value: "0",
        icon: "/icons/LowStock.png",
        iconBg: "bg-[#FF8A00]",
    },
];

export const MOCK_RETURNS: Return[] = [
    {
        id: 'r1',
        saleId: 's1',
        invoiceNo: '#INV-2025-0342',
        date: '2025-01-21',
        items: [{ ...MOCK_PRODUCTS[0], quantity: 1 }],
        refundAmount: 64.79, // Price + Tax approx
        reason: 'Wrong size',
        status: 'Completed',
        processedBy: 'u1',
        customerName: 'John Doe'
    },
    {
        id: 'r2',
        saleId: 's2',
        invoiceNo: '#INV-2025-0341',
        date: '2025-01-22',
        items: [{ ...MOCK_PRODUCTS[1], quantity: 1 }],
        refundAmount: 35.99,
        reason: 'Defective',
        status: 'Pending',
        processedBy: 'u2',
        customerName: 'Jane Smith'
    }
];

export const MOCK_LOCATIONS: Location[] = [
    { id: 'loc1', name: 'Main Store', address: '123 Main St', type: 'store', status: 'active' },
    { id: 'loc2', name: 'Downtown Branch', address: '456 Market St', type: 'store', status: 'active', priceBookId: 'pb-downtown' },
    { id: 'wh1', name: 'Central Warehouse', address: '789 Industrial Park', type: 'warehouse', status: 'active' },
];

export const MOCK_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [
    {
        id: 'tx1',
        productId: 'p1',
        type: 'IN',
        quantity: 50,
        reason: 'Initial Stock',
        performedBy: 'u1',
        timestamp: '2024-01-01T10:00:00Z',
        locationId: 'loc1'
    },
    {
        id: 'tx2',
        productId: 'p1',
        type: 'OUT',
        quantity: 2,
        reason: 'Sale #INV-2025-0342',
        referenceId: 's1',
        performedBy: 'u3',
        timestamp: '2025-01-20T20:30:00Z',
        locationId: 'loc1'
    }
];

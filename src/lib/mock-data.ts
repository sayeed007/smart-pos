
import { User, UserRole, Category, Product, Offer, Customer, Sale } from "@/types";

export const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Dresses', productCount: 3, totalValue: 6579.03, icon: '👗' },
    { id: '2', name: 'Tops', productCount: 3, totalValue: 5298.32, icon: '👚' },
    { id: '3', name: 'Bottoms', productCount: 3, totalValue: 4846.99, icon: '👖' },
    { id: '4', name: 'Outerwear', productCount: 2, totalValue: 4479.48, icon: '🧥' },
    { id: '5', name: 'Accessories', productCount: 4, totalValue: 6493.52, icon: '👜' },
];

export const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Floral Summer Dress', sku: 'WCL-DR-001', barcode: '1234567890001', categoryId: '1', costPrice: 40, sellingPrice: 59.99, taxRate: 8, stockQuantity: 44, minStockLevel: 20, status: 'active', image: 'https://picsum.photos/seed/dress1/400/400' },
    { id: 'p2', name: 'White Cotton Blouse', sku: 'WCL-TP-001', barcode: '1234567890002', categoryId: '2', costPrice: 20, sellingPrice: 35.99, taxRate: 8, stockQuantity: 59, minStockLevel: 15, status: 'active', image: 'https://picsum.photos/seed/top1/400/400' },
    { id: 'p3', name: 'High-Waist Blue Jeans', sku: 'WCL-BT-001', barcode: '1234567890003', categoryId: '3', costPrice: 30, sellingPrice: 49.99, taxRate: 8, stockQuantity: 35, minStockLevel: 25, status: 'active', image: 'https://picsum.photos/seed/jean1/400/400' },
    { id: 'p4', name: 'Leather Crossbody Bag', sku: 'WCL-AC-001', barcode: '1234567890004', categoryId: '5', costPrice: 50, sellingPrice: 79.99, taxRate: 8, stockQuantity: 25, minStockLevel: 10, status: 'active', image: 'https://picsum.photos/seed/bag1/400/400' },
    { id: 'p5', name: 'Black Evening Dress', sku: 'WCL-DR-002', barcode: '1234567890005', categoryId: '1', costPrice: 60, sellingPrice: 89.99, taxRate: 8, stockQuantity: 20, minStockLevel: 10, status: 'active', image: 'https://picsum.photos/seed/dress2/400/400' },
    { id: 'p6', name: 'Striped T-Shirt', sku: 'WCL-TP-002', barcode: '1234567890006', categoryId: '2', costPrice: 10, sellingPrice: 19.99, taxRate: 8, stockQuantity: 80, minStockLevel: 30, status: 'active', image: 'https://picsum.photos/seed/top2/400/400' },
    { id: 'p7', name: 'Daydreamer Tunic', sku: 'BEV-001', barcode: '1234567890007', categoryId: '2', costPrice: 25, sellingPrice: 45.00, taxRate: 8, stockQuantity: 5, minStockLevel: 20, status: 'active', image: 'https://picsum.photos/seed/top3/400/400' },
    { id: 'p8', name: 'Freesia Flow Skirt', sku: 'DAI-012', barcode: '1234567890008', categoryId: '3', costPrice: 28, sellingPrice: 42.00, taxRate: 8, stockQuantity: 8, minStockLevel: 15, status: 'active', image: 'https://picsum.photos/seed/skirt1/400/400' },
    { id: 'p9', name: 'Golden Hour Shorts', sku: 'BAK-005', barcode: '1234567890009', categoryId: '3', costPrice: 15, sellingPrice: 32.00, taxRate: 8, stockQuantity: 12, minStockLevel: 25, status: 'active', image: 'https://picsum.photos/seed/shorts1/400/400' },
];

export const MOCK_OFFERS: Offer[] = [
    { id: 'o1', name: '25% Off All Dresses', description: 'Get 25% discount on all dresses - Perfect for any occasion!', type: 'percentage', value: 25, applicableOn: 'category', categoryId: '1', expiryDate: '2026-12-31', status: 'active' },
    { id: 'o2', name: 'Buy 2 Get 1 Free - Tops', description: 'Buy 2 tops and get 1 free! Mix and match any styles', type: 'bogo', value: 0, applicableOn: 'category', categoryId: '2', expiryDate: '2026-12-31', status: 'active' },
    { id: 'o3', name: '$15 Off on Orders Above $100', description: 'Get $15 off on total cart value above $100', type: 'fixed', value: 15, applicableOn: 'all', minPurchase: 100, expiryDate: '2026-12-31', status: 'active' },
    { id: 'o4', name: 'Accessories Sale - 30% Off', description: 'Bags, jewelry, sunglasses and more at 30% off!', type: 'percentage', value: 30, applicableOn: 'category', categoryId: '5', expiryDate: '2026-12-31', status: 'active' },
    { id: 'o5', name: 'Winter Outerwear - 20% Off', description: 'Stay warm and stylish with 20% off all outerwear', type: 'percentage', value: 20, applicableOn: 'category', categoryId: '4', expiryDate: '2026-03-31', status: 'active' },
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

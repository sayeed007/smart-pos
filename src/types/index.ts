
export enum UserRole {
    ADMIN = 'Admin',
    MANAGER = 'Manager',
    CASHIER = 'Cashier'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'active' | 'inactive';
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
    status: 'active' | 'inactive';
    image?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Offer {
    id: string;
    name: string;
    description: string;
    type: 'percentage' | 'fixed' | 'bogo';
    value: number;
    minPurchase?: number;
    applicableOn: 'all' | 'category' | 'product';
    categoryId?: string;
    productId?: string;
    expiryDate: string;
    status: 'active' | 'inactive';
}

export interface Sale {
    id: string;
    invoiceNo: string;
    date: string;
    time: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: 'Cash' | 'Card' | 'Digital';
    status: 'Completed' | 'Returned';
    cashierId: string;
    customerName?: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalSpent: number;
    loyaltyPoints: number;
    history: string[];
}

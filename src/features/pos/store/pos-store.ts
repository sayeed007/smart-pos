
import { create } from 'zustand';
import { Product, CartItem, Sale, Variant, Customer } from '@/types';

interface POSState {
    cart: CartItem[];
    search: string;
    selectedCategory: string;
    isProcessingPayment: boolean;
    activeModal: 'none' | 'size' | 'variant-selector' | 'payment-method' | 'cash-detail' | 'card-detail' | 'processing' | 'success' | 'offers' | 'member' | 'split-payment' | 'suspended-list' | 'cash-management';
    selectedProduct: Product | null;

    // Loyalty
    customer: Customer | null;
    setCustomer: (customer: Customer | null) => void;

    redeemedPoints: number;
    setRedeemedPoints: (points: number) => void;

    // Actions
    setSearch: (query: string) => void;
    setCategory: (id: string) => void;
    addToCart: (product: Product, variant?: Variant) => void;
    removeFromCart: (productId: string, name: string) => void;
    updateQuantity: (name: string, delta: number) => void;
    clearCart: () => void;
    setModal: (modal: POSState['activeModal']) => void;
    selectProduct: (product: Product | null) => void;
    setProcessing: (status: boolean) => void;
    setCart: (cart: CartItem[]) => void;
}

export const usePOSStore = create<POSState>((set) => ({
    cart: [],
    search: '',
    selectedCategory: 'all',
    isProcessingPayment: false,
    activeModal: 'none',

    setCart: (cart) => set({ cart }),
    selectedProduct: null,

    customer: null,
    redeemedPoints: 0,

    setCustomer: (customer) => set({ customer, redeemedPoints: 0 }),
    setRedeemedPoints: (points) => set({ redeemedPoints: points }),

    setSearch: (query) => set({ search: query }),
    setCategory: (id) => set({ selectedCategory: id }),

    addToCart: (product, variant) => set((state) => {
        const isVariant = !!variant;
        const cartItemId = isVariant ? variant!.id : product.id;
        const name = isVariant ? `${product.name} - ${variant!.name}` : product.name;
        const price = isVariant ? variant!.price : product.sellingPrice;
        const sku = isVariant ? variant!.sku : product.sku;

        const existing = state.cart.find(
            item => item.id === cartItemId
        );

        if (existing) {
            return {
                cart: state.cart.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            };
        }

        return {
            cart: [
                ...state.cart,
                {
                    ...product,
                    id: cartItemId, // Override ID with Variant ID for uniqueness
                    name,
                    sellingPrice: price,
                    sku,
                    quantity: 1,
                    variants: undefined, // Clear variants from cart item to save memory/confusion
                    originalProductId: product.id // Keep ref to parent
                }
            ]
        };
    }),

    removeFromCart: (productId, name) => set((state) => ({
        cart: state.cart.filter(item => !(item.id === productId && item.name === name))
    })),

    updateQuantity: (name, delta) => set((state) => ({
        cart: state.cart.map(item =>
            item.name === name
                ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                : item
        ).filter(item => item.quantity > 0)
    })),

    clearCart: () => set({ cart: [], customer: null, redeemedPoints: 0 }), // Also clear customer? Maybe keep customer. 
    // Usually keep customer for next sale? No, usually reset for next customer. 
    // I will keep customer but maybe reset points?
    // Let's reset customer on clearCart for safety.

    setModal: (modal) => set({ activeModal: modal }),
    selectProduct: (product) => set({ selectedProduct: product }),
    setProcessing: (status) => set({ isProcessingPayment: status }),
}));

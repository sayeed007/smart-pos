
import { create } from 'zustand';
import { Product, CartItem, Sale } from '@/types';

interface POSState {
    cart: CartItem[];
    search: string;
    selectedCategory: string;
    isProcessingPayment: boolean;
    activeModal: 'none' | 'size' | 'payment-method' | 'cash-detail' | 'card-detail' | 'processing' | 'success' | 'offers' | 'member';
    selectedProduct: Product | null;

    // Actions
    setSearch: (query: string) => void;
    setCategory: (id: string) => void;
    addToCart: (product: Product, size?: string) => void;
    removeFromCart: (productId: string, name: string) => void;
    updateQuantity: (name: string, delta: number) => void;
    clearCart: () => void;
    setModal: (modal: POSState['activeModal']) => void;
    selectProduct: (product: Product | null) => void;
    setProcessing: (status: boolean) => void;
}

export const usePOSStore = create<POSState>((set) => ({
    cart: [],
    search: '',
    selectedCategory: 'all',
    isProcessingPayment: false,
    activeModal: 'none',
    selectedProduct: null,

    setSearch: (query) => set({ search: query }),
    setCategory: (id) => set({ selectedCategory: id }),

    addToCart: (product, size) => set((state) => {
        const name = size ? `${product.name} (${size})` : product.name;
        const existing = state.cart.find(
            item => item.id === product.id && item.name === name
        );

        if (existing) {
            return {
                cart: state.cart.map(item =>
                    (item.id === product.id && item.name === name)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            };
        }

        return { cart: [...state.cart, { ...product, name, quantity: 1 }] };
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

    clearCart: () => set({ cart: [] }),
    setModal: (modal) => set({ activeModal: modal }),
    selectProduct: (product) => set({ selectedProduct: product }),
    setProcessing: (status) => set({ isProcessingPayment: status }),
}));

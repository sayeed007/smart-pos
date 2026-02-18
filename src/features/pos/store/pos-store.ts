import { create } from "zustand";
import { Product, CartItem, Variant, Customer } from "@/types";

type PaymentMethod = "card" | "cash" | "wallet" | "split";

interface POSState {
  cart: CartItem[];
  search: string;
  selectedCategory: string;
  isProcessingPayment: boolean;
  excludedOfferIds: string[];
  modalData: any;
  activeModal:
    | "none"
    | "size"
    | "variant-selector"
    | "checkout"
    | "payment-method"
    | "cash-detail"
    | "card-detail"
    | "processing"
    | "success"
    | "offers"
    | "member"
    | "split-payment"
    | "suspended-list"
    | "cash-management";
  selectedProduct: Product | null;

  // Payment
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;

  // Loyalty
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;

  redeemedPoints: number;
  setRedeemedPoints: (points: number) => void;

  // Actions
  setSearch: (query: string) => void;
  setCategory: (id: string) => void;
  toggleOffer: (offerId: string) => void;
  setExcludedOffers: (offerIds: string[]) => void;
  addToCart: (product: Product, variant?: Variant) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  setModal: (modal: POSState["activeModal"], data?: any) => void;
  selectProduct: (product: Product | null) => void;
  setProcessing: (status: boolean) => void;
  setCart: (cart: CartItem[]) => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],
  search: "",
  selectedCategory: "all",
  isProcessingPayment: false,
  excludedOfferIds: [],
  modalData: null,
  activeModal: "none",

  setCart: (cart) => set({ cart }),
  selectedProduct: null,

  paymentMethod: "card",
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  customer: null,
  redeemedPoints: 0,

  setCustomer: (customer) => set({ customer, redeemedPoints: 0 }),
  setRedeemedPoints: (points) => set({ redeemedPoints: points }),

  setSearch: (query) => set({ search: query }),
  setCategory: (id) => set({ selectedCategory: id }),
  toggleOffer: (offerId) =>
    set((state) => ({
      excludedOfferIds: state.excludedOfferIds.includes(offerId)
        ? state.excludedOfferIds.filter((id) => id !== offerId)
        : [...state.excludedOfferIds, offerId],
    })),
  setExcludedOffers: (offerIds) => set({ excludedOfferIds: offerIds }),

  addToCart: (product, variant) =>
    set((state) => {
      const isVariant = !!variant;
      const cartItemId = isVariant ? variant!.id : product.id;
      const name = isVariant
        ? `${product.name} - ${variant!.name}`
        : product.name;
      const price = isVariant ? variant!.price : product.sellingPrice;
      const sku = isVariant ? variant!.sku : product.sku;

      const existing = state.cart.find((item) => item.id === cartItemId);

      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
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
            variants: undefined, // Clear variants from cart item
            originalProductId: product.id, // Keep ref to parent product
          },
        ],
      };
    }),

  // FIX: Use item ID as the key instead of name to avoid collisions
  removeFromCart: (itemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== itemId),
    })),

  // FIX: Use item ID as the key instead of name
  updateQuantity: (itemId, delta) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () => set({ cart: [], customer: null, redeemedPoints: 0 }),

  setModal: (modal, data = null) =>
    set({ activeModal: modal, modalData: data }),
  selectProduct: (product) => set({ selectedProduct: product }),
  setProcessing: (status) => set({ isProcessingPayment: status }),
}));

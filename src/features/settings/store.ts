import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  discountPercent: number;
}

export interface SettingsState {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeTagline: string;
  storeLogoUrl: string;

  currency: string;
  currencySymbol: string;
  taxEnabled: boolean;
  taxRate: number;
  taxType: "INCLUSIVE" | "EXCLUSIVE";

  // Loyalty Settings
  loyaltyEnabled: boolean;
  loyaltyEarnRate: number;
  loyaltyPointsClaimable: boolean;
  loyaltyRedemptionRate: number;
  loyaltyTiers: LoyaltyTier[];

  receiptHeader: string;
  receiptFooter: string;
  paperWidth: "58mm" | "80mm";

  updateSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: Omit<
  SettingsState,
  "updateSettings" | "resetSettings"
> = {
  storeName: "My POS Store",
  storeAddress: "123 Retail St, City",
  storePhone: "+1 (555) 000-0000",
  storeEmail: "contact@store.com",
  storeTagline: "",
  storeLogoUrl: "",

  currency: "USD",
  currencySymbol: "$",
  taxEnabled: true,
  taxRate: 10,
  taxType: "EXCLUSIVE",

  loyaltyEnabled: false,
  loyaltyEarnRate: 100, // Spend 100 to get 1 point
  loyaltyPointsClaimable: true,
  loyaltyRedemptionRate: 1, // 1 point = $1
  loyaltyTiers: [],

  receiptHeader: "Welcome to Tafuri POS",
  receiptFooter: "Thank you! Visit again.",
  paperWidth: "80mm",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),
      resetSettings: () => set(() => ({ ...DEFAULT_SETTINGS })),
    }),
    {
      name: "pos-settings-storage",
    },
  ),
);

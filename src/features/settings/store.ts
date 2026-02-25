import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeTagline: string;
  storeLogoUrl: string;

  currency: string;
  taxRate: number;
  currencySymbol: string;

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
  taxRate: 10,
  currencySymbol: "$",

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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;

    currency: string;
    taxRate: number;
    currencySymbol: string;

    receiptHeader: string;
    receiptFooter: string;
    paperWidth: '58mm' | '80mm';

    // Actions
    updateSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            storeName: "My POS Store",
            storeAddress: "123 Retail St, City",
            storePhone: "+1 (555) 000-0000",
            storeEmail: "contact@store.com",

            currency: "USD",
            taxRate: 10,
            currencySymbol: "$",

            receiptHeader: "Welcome to Aura POS",
            receiptFooter: "Thank you! Visit again.",
            paperWidth: '80mm',

            updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
        }),
        {
            name: 'pos-settings-storage', // unique name
        }
    )
);

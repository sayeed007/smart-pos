import { create } from 'zustand';
import { InventoryTransaction } from '@/types';
import { MOCK_INVENTORY_TRANSACTIONS } from '@/lib/mock-data';

interface InventoryState {
    transactions: InventoryTransaction[];
    addTransaction: (transaction: InventoryTransaction) => void;
    addTransactions: (transactions: InventoryTransaction[]) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    transactions: [...MOCK_INVENTORY_TRANSACTIONS],
    addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
    })),
    addTransactions: (newTransactions) => set((state) => ({
        transactions: [...newTransactions, ...state.transactions]
    }))
}));

// Remove import
import { create } from "zustand";
import { InventoryTransaction } from "@/types";

interface InventoryState {
  transactions: InventoryTransaction[];
  addTransaction: (transaction: InventoryTransaction) => void;
  addTransactions: (transactions: InventoryTransaction[]) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  transactions: [],
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  addTransactions: (newTransactions) =>
    set((state) => ({
      transactions: [...newTransactions, ...state.transactions],
    })),
}));

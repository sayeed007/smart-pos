
import { create } from 'zustand';
import { db, CashShift } from '@/lib/db';

interface CashState {
    currentShift: CashShift | null;
    isLoading: boolean;
    checkCurrentShift: () => Promise<void>;
    openShift: (startAmount: number, cashierId: string) => Promise<void>;
    closeShift: (endAmount: number, notes?: string) => Promise<void>;
}

export const useCashStore = create<CashState>((set, get) => ({
    currentShift: null,
    isLoading: true,

    checkCurrentShift: async () => {
        try {
            // Find last open shift
            // Dexie 'where' returns a Collection, first()/last() gets item
            const openShifts = await db.cashShifts.where('status').equals('open').toArray();
            const shift = openShifts.length > 0 ? openShifts[0] : null;
            set({ currentShift: shift || null, isLoading: false });
        } catch (error) {
            console.error("Failed to check shift", error);
            set({ isLoading: false });
        }
    },

    openShift: async (startAmount, cashierId) => {
        const id = crypto.randomUUID();
        const newShift: CashShift = {
            id,
            cashierId,
            startTime: new Date().toISOString(),
            startAmount,
            status: 'open'
        };
        await db.cashShifts.add(newShift);
        set({ currentShift: newShift });
    },

    closeShift: async (endAmount, notes) => {
        const { currentShift } = get();
        if (!currentShift) return;

        await db.cashShifts.update(currentShift.id, {
            endAmount,
            status: 'closed',
            endTime: new Date().toISOString(),
            notes
        });
        set({ currentShift: null });
    }
}));

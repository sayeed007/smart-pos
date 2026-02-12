"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { db } from "@/lib/db";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const queryClient = useQueryClient();

  const updatePendingCount = async () => {
    try {
      const count = await db.salesQueue
        .where("status")
        .equals("pending")
        .count();
      setPendingCount(count);
    } catch (e) {
      console.error("DB Error", e);
    }
  };

  const syncSales = async () => {
    if (!navigator.onLine) return;

    try {
      const pendingSales = await db.salesQueue
        .where("status")
        .equals("pending")
        .toArray();
      if (pendingSales.length === 0) return;

      // Simple lock or toast to indicate sync
      const loadingToast = toast.info(
        `Syncing ${pendingSales.length} offline sales...`,
      );

      let synced = 0;
      for (const sale of pendingSales) {
        try {
          await api.post("/sales", {
            items: sale.items,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            payments: sale.payments,
            cashierId: sale.cashierId,
            createdAt: sale.createdAt, // Preserve offline timestamp
          });

          // Delete from queue on success
          await db.salesQueue.delete(sale.id);
          synced++;
        } catch (error) {
          console.error(`Failed to sync sale ${sale.id}`, error);
          // Keep in queue if failed
        }
      }

      if (synced > 0) {
        toast.dismiss(loadingToast);
        toast.success(`Synced ${synced} sales.`);
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
        updatePendingCount();
      }
    } catch (error) {
      console.error("Sync Process Error", error);
    }
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back Online");
      syncSales();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are Offline. Changes saved locally.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Queue Monitor & Auto-Sync
    const interval = setInterval(() => {
      updatePendingCount();
      if (navigator.onLine) {
        syncSales();
      }
    }, 15000); // Check every 15s

    // Initial check
    updatePendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <SyncContext.Provider
      value={{ isOnline, pendingCount, syncNow: syncSales }}
    >
      {children}
      {/* Sync Indicator */}
      {pendingCount > 0 && (
        <div
          className="fixed bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-50 animate-pulse cursor-pointer hover:bg-orange-600 transition-colors"
          onClick={syncSales}
          title="Click to Sync Now"
        >
          {pendingCount} Unsynced Sales
        </div>
      )}
    </SyncContext.Provider>
  );
}

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync must be used inside SyncProvider");
  return context;
};

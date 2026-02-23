"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { db, type SaleQueueItem } from "@/lib/db";
import {
  SalesService,
  type CreateSaleDto,
  type SaleLineDto,
  type SalePaymentDto,
} from "@/lib/services/backend/sales.service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLocationStore } from "@/features/locations/store";

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

const PAYMENT_METHOD_MAP: Record<string, SalePaymentDto["method"]> = {
  card: "CARD",
  Card: "CARD",
  cash: "CASH",
  Cash: "CASH",
  wallet: "DIGITAL_WALLET",
  Wallet: "DIGITAL_WALLET",
  digital: "DIGITAL_WALLET",
  Digital: "DIGITAL_WALLET",
  voucher: "GIFT_CARD",
  Voucher: "GIFT_CARD",
  Split: "OTHER",
};

const mapPaymentMethod = (method: string) =>
  PAYMENT_METHOD_MAP[method] || "OTHER";

const buildSaleDto = (
  sale: SaleQueueItem,
  fallbackLocationId?: string,
): CreateSaleDto | null => {
  const locationId = sale.locationId || fallbackLocationId;
  if (!locationId || locationId === "default") {
    return null;
  }

  const lines: SaleLineDto[] = sale.items.map((item) => {
    const productId = item.originalProductId || item.id;
    const isVariant =
      !!item.originalProductId && item.id !== item.originalProductId;
    return {
      productId,
      variantId: isVariant ? item.id : undefined,
      quantity: item.quantity,
      unitPrice: item.price,
      discountAmount: 0,
    };
  });

  if (lines.length === 0) {
    return null;
  }

  let payments: SalePaymentDto[];
  if (sale.payments && sale.payments.length > 0) {
    payments = sale.payments.map((p) => ({
      method: mapPaymentMethod(p.method),
      amount: p.amount,
    }));
  } else {
    payments = [
      {
        method: mapPaymentMethod(sale.paymentMethod),
        amount: sale.total,
      },
    ];
  }

  return {
    locationId,
    registerId: sale.registerId,
    shiftId: sale.shiftId,
    customerId: sale.customerId,
    isOffline: true,
    offlineId: sale.id,
    loyaltyPointsRedeemed: sale.redeemedPoints || 0,
    loyaltyDiscount:
      sale.loyaltyDiscount ||
      (sale.redeemedPoints ? sale.redeemedPoints / 100 : 0),
    lines,
    payments,
  };
};

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const queryClient = useQueryClient();
  const { currentLocation } = useLocationStore();

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await db.salesQueue
        .where("status")
        .equals("pending")
        .count();
      setPendingCount(count);
    } catch (e) {
      console.error("DB Error", e);
    }
  }, []);

  const syncSales = useCallback(async () => {
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
          const dto = buildSaleDto(sale, currentLocation?.id);
          if (!dto) {
            throw new Error("Missing sale data for sync");
          }

          await SalesService.create(dto);

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
  }, [currentLocation?.id, queryClient, updatePendingCount]);

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
  }, [syncSales, updatePendingCount]);

  return (
    <SyncContext.Provider
      value={{ isOnline, pendingCount, syncNow: syncSales }}
    >
      {children}
      {/* Sync Indicator */}
      {pendingCount > 0 && (
        <div
          className="fixed bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full shadow-lg z-50 animate-pulse cursor-pointer hover:bg-orange-600 transition-colors typo-bold-12"
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

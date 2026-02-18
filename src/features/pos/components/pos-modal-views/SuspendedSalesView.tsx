"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePOSStore } from "@/features/pos/store/pos-store";
import { db, SaleQueueItem } from "@/lib/db";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface SuspendedSalesViewProps {
  onClose: () => void;
}

export function SuspendedSalesView({ onClose }: SuspendedSalesViewProps) {
  const [sales, setSales] = useState<SaleQueueItem[]>([]);
  const { setCart, setModal, setCustomer, setRedeemedPoints } = usePOSStore();
  const { t } = useTranslation(["pos", "common"]);

  useEffect(() => {
    db.suspendedSales.toArray().then(setSales);
  }, []);

  const resume = async (sale: SaleQueueItem) => {
    const restoredItems = sale.items.map((item) => ({
      ...item,
      sellingPrice: item.price,
      originalProductId: item.originalProductId,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCart(restoredItems as any);
    if (sale.customerId) {
      const c = await db.customers.get(sale.customerId);
      setCustomer(c || null);
    } else {
      setCustomer(null);
    }
    setRedeemedPoints(sale.redeemedPoints || 0);
    await db.suspendedSales.delete(sale.id);
    setModal("none");
    toast.success(t("suspended.resumed", "Sale Resumed"));
  };

  const remove = async (id: string) => {
    await db.suspendedSales.delete(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
    toast.success(t("suspended.discarded", "Suspended sale discarded"));
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-125 max-h-[80vh] flex flex-col">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 text-center">
        {t("suspended.title", "Suspended Sales")}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {sales.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            {t("suspended.empty", "No suspended sales found.")}
          </p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="border rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-bold text-sm">
                  {t("suspended.sale", "Sale")} #{sale.id.substr(0, 8)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(sale.createdAt))} ago &bull;{" "}
                  {sale.items.length} {t("suspended.items", "items")}
                </div>
                <div className="font-mono text-emerald-600 font-bold mt-1">
                  ${sale.total.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(sale.id)}
                >
                  {t("suspended.discard", "Discard")}
                </Button>
                <Button size="sm" onClick={() => resume(sale)}>
                  {t("suspended.resume", "Resume")}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button variant="ghost" className="w-full" onClick={onClose}>
          {t("common:close", "Close")}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Sale, CartItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Package, Plus, Minus, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface ProcessReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onConfirm: (
    saleId: string,
    items: { itemId: string; quantity: number }[],
    reason: string,
    restock: boolean,
  ) => void;
}

export function ProcessReturnModal({
  isOpen,
  onClose,
  sale,
  onConfirm,
}: ProcessReturnModalProps) {
  const { t } = useTranslation("sales");

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    if (!sale) return {};
    const initialMap: Record<string, number> = {};
    sale.items.forEach((item) => {
      initialMap[item.id] = 0;
    });
    return initialMap;
  });

  const [reason, setReason] = useState("");
  const [restock, setRestock] = useState(true);

  const handleIncrement = (item: CartItem) => {
    setQuantities((prev) => {
      const current = prev[item.id] || 0;
      if (current < item.quantity) {
        return { ...prev, [item.id]: current + 1 };
      }
      return prev;
    });
  };

  const handleDecrement = (item: CartItem) => {
    setQuantities((prev) => {
      const current = prev[item.id] || 0;
      if (current > 0) {
        return { ...prev, [item.id]: current - 1 };
      }
      return prev;
    });
  };

  const totalRefund = useMemo(() => {
    if (!sale) return 0;
    return sale.items.reduce((acc, item) => {
      const quantityToReturn = quantities[item.id] || 0;
      return acc + item.sellingPrice * quantityToReturn;
    }, 0);
  }, [sale, quantities]);

  const totalItemsToReturn = useMemo(() => {
    return Object.values(quantities).reduce((a, b) => a + b, 0);
  }, [quantities]);

  const handleProcess = () => {
    if (!sale) return;
    const itemsToReturn = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));

    if (itemsToReturn.length === 0) return;

    onConfirm(sale.id, itemsToReturn, reason, restock);
    onClose();
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {t("modal.title", "Process Return")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t("modal.subtitle", "Select items to return and provide a reason")}
          </p>
        </DialogHeader>

        <div className="px-6 py-4 bg-muted/30 border-y border-border flex justify-between items-center text-sm">
          <div>
            <p className="text-muted-foreground">Invoice</p>
            <p className="font-bold text-foreground">{sale.invoiceNo}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-bold text-foreground">
              {format(new Date(sale.date), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Total</p>
            <p className="font-bold text-foreground">
              ${sale.total.toFixed(2)}
            </p>
          </div>
        </div>

        <ScrollArea className="h-75 px-6 py-4">
          <div className="space-y-4">
            {sale.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card"
              >
                <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    ${item.sellingPrice.toFixed(2)} • {t("modal.max", "Max")}:{" "}
                    {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDecrement(item)}
                    disabled={(quantities[item.id] || 0) <= 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-4 text-center font-medium">
                    {quantities[item.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleIncrement(item)}
                    disabled={(quantities[item.id] || 0) >= item.quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right min-w-20">
                  <p className="text-xs text-muted-foreground">
                    {t("modal.refund", "Refund")}
                  </p>
                  <p className="font-bold text-destructive">
                    $
                    {(item.sellingPrice * (quantities[item.id] || 0)).toFixed(
                      2,
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("modal.reasonLabel", "Reason for Return *")}
            </label>
            <Textarea
              placeholder={t(
                "modal.reasonPlaceholder",
                "e.g., Wrong size, Defective item...",
              )}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <input
              type="checkbox"
              id="restock"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="restock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Restock items to inventory?
            </label>
          </div>
        </ScrollArea>

        <div className="p-6 bg-muted/30 border-t border-border mt-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              {t("modal.itemsToReturn", "Items to Return:")}
            </span>
            <span className="font-bold">{totalItemsToReturn}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-bold">
              {t("modal.totalRefund", "Total Refund:")}
            </span>
            <span className="text-lg font-bold text-destructive">
              ${totalRefund.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleProcess}
              disabled={totalItemsToReturn === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("modal.processReturn", "Process Return")}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t("modal.cancel", "Cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

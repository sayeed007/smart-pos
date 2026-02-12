"use client";

import { useLocationStore } from "@/features/locations/store";
import { db, updateLocalStock } from "@/lib/db";
import { StockTransfer, InventoryTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function ViewTransferDialog({
  transfer,
  open,
  onOpenChange,
}: {
  transfer: StockTransfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { currentLocation } = useLocationStore();
  if (!transfer) return null;

  const isIncoming = transfer.toLocationId === currentLocation.id;
  const canReceive = isIncoming && transfer.status === "shipped";

  const handleReceive = async () => {
    try {
      // 1. Update Transfer Status
      await db.stockTransfers.update(transfer.id, {
        status: "received",
        receivedBy: "u1", // Default User
        updatedAt: new Date().toISOString(),
      });

      // 2. Create IN Transactions
      const transactions: InventoryTransaction[] = transfer.items.map(
        (item) => ({
          id: `tx-${crypto.randomUUID()}`,
          productId: item.productId,
          variantId: item.variantId,
          type: "IN",
          quantity: item.quantity,
          reason: `Transfer from ${transfer.fromLocationId} (Ref: ${transfer.id.slice(0, 8)})`,
          referenceId: transfer.id,
          performedBy: "u1",
          timestamp: new Date().toISOString(),
          locationId: currentLocation.id,
        }),
      );

      await updateLocalStock(transactions); // Updates Destination Inventory Level

      toast.success("Transfer received successfully.");
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to receive transfer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer #{transfer.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              From: <strong>{transfer.fromLocationId}</strong>
            </span>
            <span>
              To: <strong>{transfer.toLocationId}</strong>
            </span>
          </div>

          <div className="border rounded-lg p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {transfer.items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-right font-mono">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {canReceive && (
            <Button
              className="w-full py-6 text-md font-bold bg-green-600 hover:bg-green-700"
              onClick={handleReceive}
            >
              <CheckCircle2 className="mr-2" />
              Receive Inventory
            </Button>
          )}

          {!canReceive && (
            <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded">
              Status:{" "}
              <span className="font-bold uppercase">{transfer.status}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

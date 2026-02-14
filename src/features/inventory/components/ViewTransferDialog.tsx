"use client";

import { useLocationStore } from "@/features/locations/store";
import { StockTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useReceiveTransfer } from "@/hooks/api/inventory";

export function ViewTransferDialog({
  transfer,
  open,
  onOpenChange,
  currentLocationId,
}: {
  transfer: StockTransfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocationId?: string;
}) {
  const { t } = useTranslation("inventory");
  const { currentLocation } = useLocationStore();
  const effectiveLocationId = currentLocationId || currentLocation.id;
  const receiveTransfer = useReceiveTransfer();

  if (!transfer) return null;

  const isIncoming = transfer.toLocationId === effectiveLocationId;
  const canReceive = isIncoming && transfer.status === "SHIPPED";

  const handleReceive = async () => {
    try {
      await receiveTransfer.mutateAsync(transfer.id);
      toast.success(t("dialogs.viewTransfer.successMessage"));
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error(t("dialogs.viewTransfer.errorMessage"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("dialogs.viewTransfer.title", { ref: transfer.id.slice(0, 8) })}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Transfer details for {transfer.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {t("dialogs.viewTransfer.from")}{" "}
              <strong>
                {transfer.fromLocation?.name || transfer.fromLocationId}
              </strong>
            </span>
            <span>
              {t("dialogs.viewTransfer.to")}{" "}
              <strong>
                {transfer.toLocation?.name || transfer.toLocationId}
              </strong>
            </span>
          </div>

          <div className="border rounded-lg p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">
                    {t("dialogs.viewTransfer.item")}
                  </th>
                  <th className="p-2 text-right">
                    {t("dialogs.viewTransfer.qty")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {transfer.lines.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">
                      {item.variant ? item.variant.name : item.product.name}
                    </td>
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
              {t("dialogs.viewTransfer.receiveInventory")}
            </Button>
          )}

          {!canReceive && (
            <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded">
              {t("dialogs.viewTransfer.status")}{" "}
              <span className="font-bold uppercase">{transfer.status}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

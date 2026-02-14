"use client";

import { useState } from "react";
import { StockTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, Eye } from "lucide-react";
import { ViewTransferDialog } from "./ViewTransferDialog";
import { useTranslation } from "react-i18next";
import { useTransfers } from "@/hooks/api/inventory";

export function StockTransferList({
  locationId,
  onView,
}: {
  locationId: string;
  onView?: (transfer: StockTransfer) => void;
}) {
  const { t: translate } = useTranslation("inventory");
  const [selectedTransfer, setSelectedTransfer] =
    useState<StockTransfer | null>(null);

  const { data: transfersData } = useTransfers(locationId);
  const transfers = transfersData || [];

  if (transfers.length === 0)
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-lg bg-muted/10">
        {translate("dialogs.transferList.noTransfers")}
      </div>
    );

  const handleView = (t: StockTransfer) => {
    setSelectedTransfer(t);
    onView?.(t);
  };

  return (
    <>
      <ViewTransferDialog
        transfer={selectedTransfer}
        open={!!selectedTransfer}
        onOpenChange={(open) => !open && setSelectedTransfer(null)}
        currentLocationId={locationId}
      />

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground">
                {translate("dialogs.transferList.ref")}
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                {translate("dialogs.transferList.date")}
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                {translate("dialogs.transferList.route")}
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                {translate("dialogs.transferList.status")}
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                {translate("dialogs.transferList.items")}
              </th>
              <th className="p-3 text-right font-medium text-muted-foreground">
                {translate("dialogs.transferList.action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => {
              const isIncoming = t.toLocationId === locationId;
              return (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {t.id.slice(0, 8)}
                  </td>
                  <td className="p-3">
                    {format(new Date(t.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={
                          !isIncoming ? "font-bold" : "text-muted-foreground"
                        }
                      >
                        {t.fromLocation?.name || t.fromLocationId}
                      </span>
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <span
                        className={
                          isIncoming ? "font-bold" : "text-muted-foreground"
                        }
                      >
                        {t.toLocation?.name || t.toLocationId}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        t.status === "RECEIVED"
                          ? "default"
                          : t.status === "CANCELLED"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col text-xs max-w-50">
                      {t.lines.slice(0, 2).map((line, idx) => (
                        <span key={idx} className="truncate">
                          {line.quantity} x{" "}
                          {line.variant ? line.variant.name : line.product.name}
                        </span>
                      ))}
                      {t.lines.length > 2 && (
                        <span className="text-muted-foreground text-[10px]">
                          +{t.lines.length - 2} {translate("common:more")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleView(t)}
                    >
                      <Eye size={16} />
                    </Button>
                    {isIncoming && t.status === "SHIPPED" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="ml-2 h-7 text-xs"
                        onClick={() => handleView(t)}
                      >
                        {translate("dialogs.transferList.receive")}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

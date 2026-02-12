"use client";

import { useState, useEffect } from "react";
import { useLocationStore } from "@/features/locations/store";
import { db } from "@/lib/db";
import { StockTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, Eye } from "lucide-react";
import { ViewTransferDialog } from "./ViewTransferDialog";

export function StockTransferList({
  onView,
}: {
  onView?: (transfer: StockTransfer) => void;
}) {
  const { currentLocation } = useLocationStore();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] =
    useState<StockTransfer | null>(null);

  useEffect(() => {
    const load = async () => {
      const sent = await db.stockTransfers
        .where("fromLocationId")
        .equals(currentLocation.id)
        .toArray();
      const received = await db.stockTransfers
        .where("toLocationId")
        .equals(currentLocation.id)
        .toArray();

      const map = new Map<string, StockTransfer>();
      sent.forEach((t) => map.set(t.id, t));
      received.forEach((t) => map.set(t.id, t));

      setTransfers(
        Array.from(map.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    };
    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [currentLocation]);

  if (transfers.length === 0)
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-lg bg-muted/10">
        No transfers found for this location.
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
      />

      <div className="border rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground">
                Ref
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                Date
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                Route
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="p-3 text-left font-medium text-muted-foreground">
                Items
              </th>
              <th className="p-3 text-right font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => {
              const isIncoming = t.toLocationId === currentLocation.id;
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
                        {t.fromLocationId}
                      </span>
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <span
                        className={
                          isIncoming ? "font-bold" : "text-muted-foreground"
                        }
                      >
                        {t.toLocationId}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={
                        t.status === "received"
                          ? "default"
                          : t.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-3">{t.items.length}</td>
                  <td className="p-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleView(t)}
                    >
                      <Eye size={16} />
                    </Button>
                    {isIncoming && t.status === "shipped" && (
                      <Button
                        size="sm"
                        variant="default"
                        className="ml-2 h-7 text-xs"
                        onClick={() => handleView(t)}
                      >
                        Receive
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

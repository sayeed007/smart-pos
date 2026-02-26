"use client";

import { StockTransferList } from "./StockTransferList";

export function InventoryTransfers({ locationId }: { locationId: string }) {
  return <StockTransferList locationId={locationId} />;
}

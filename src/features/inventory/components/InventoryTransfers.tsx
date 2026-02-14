"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockTransferList } from "./StockTransferList";
import { useTranslation } from "react-i18next";

export function InventoryTransfers({ locationId }: { locationId: string }) {
  const { t } = useTranslation("inventory");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.transferHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <StockTransferList locationId={locationId} />
      </CardContent>
    </Card>
  );
}

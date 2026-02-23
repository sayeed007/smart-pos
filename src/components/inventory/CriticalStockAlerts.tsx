"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useTranslation } from "react-i18next";
import { ServerImage } from "@/components/ui/server-image";
import { Package } from "lucide-react";

interface CriticalStockAlertsProps {
  products: Product[];
  totalAlerts: number;
  onRestock: (product: Product) => void;
}

export function CriticalStockAlerts({
  products,
  totalAlerts,
  onRestock,
}: CriticalStockAlertsProps) {
  const { t } = useTranslation("inventory");

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {t("sections.criticalAlerts", "Critical Stock Alerts")}
        </CardTitle>
        <span className="bg-red-100 text-red-600 px-2 py-1 rounded typo-bold-12">
          {totalAlerts} {t("alerts.units", "items")}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-orange-50/50 border border-orange-100"
          >
            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0">
              {product.image ? (
                <ServerImage
                  src={product.image}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 m-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate typo-bold-14">{product.name}</h4>
              <p className="text-muted-foreground truncate typo-regular-12">
                SKU: {product.sku} • {t("alerts.min", "Min")}:{" "}
                {product.minStockLevel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-red-600 typo-bold-14">
                {product.stockQuantity} {t("alerts.units", "units")}
              </p>
              <Button
                size="sm"
                className="h-7 bg-red-600 hover:bg-red-700 mt-1 typo-regular-12"
                onClick={() => onRestock(product)}
              >
                {t("alerts.restock", "Restock")}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

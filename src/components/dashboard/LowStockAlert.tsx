"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Product } from "@/types";
import { ShoppingBag } from "lucide-react";

import { MOCK_LOW_STOCK_ITEMS } from "@/lib/mock-data";

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const { t } = useTranslation("dashboard");

  // Dummy data matching reference image
  const lowStockItems = useMemo(() => {
    if (products && products.length > 0) {
      // Filter actual low stock items if available
      return products
        .filter((p) => p.stockQuantity <= (p.minStockLevel || 10))
        .slice(0, 4);
    }

    // Fallback dummy data
    return MOCK_LOW_STOCK_ITEMS;
  }, [products]);

  return (
    <Card className="col-span-1 bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.lowStockAlert", "Low Stock Alert")}
        </CardTitle>
        <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-1 rounded-md font-medium">
          {lowStockItems.length} {t("sales.items", "Items")}
        </span>
      </CardHeader>
      <CardContent className="space-y-6">
        {lowStockItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="typo-medium-14 text-foreground truncate max-w-[120px]">
                  {item.name}
                </p>
                <p className="typo-regular-12 text-muted-foreground">
                  SKU: {item.sku}
                </p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="typo-bold-14 text-orange-500">
                {item.stockQuantity} {t("units", "units")}
              </p>
              <p className="typo-medium-12 text-muted-foreground">
                Min: {item.minStockLevel}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

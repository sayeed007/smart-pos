"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { MOCK_RECENT_SALES_DASHBOARD } from "@/lib/mock-data";

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  const { t } = useTranslation("dashboard");

  // Generate some realistic dummy sales if the list is empty or short
  const displaySales = useMemo(() => {
    if (sales.length >= 4) return sales.slice(0, 4);

    // Use fallback mock data
    return MOCK_RECENT_SALES_DASHBOARD;
  }, [sales]);

  return (
    <Card className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.recentSales", "Recent Sales")}
        </CardTitle>
        <Link
          href="/sales"
          className="typo-semibold-14 text-blue-500 hover:text-blue-600 transition-colors"
        >
          {t("sales.viewAll", "View All")}
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        {displaySales.map((sale, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                {sale.items?.[0]?.image ? (
                  <Image
                    src={sale.items[0].image}
                    alt="Product"
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
                <p className="typo-medium-14 text-foreground">
                  #{sale.invoiceNo || sale.id.substring(0, 8)}
                </p>
                <p className="typo-regular-12 text-muted-foreground">
                  {formatDistanceToNow(new Date(sale.date || new Date()), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="typo-bold-14 text-foreground">
                ${sale.total.toFixed(2)}
              </p>
              <p className="typo-medium-12 text-green-500">
                {sale.status || "Completed"}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

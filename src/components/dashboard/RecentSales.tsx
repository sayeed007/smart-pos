"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types";
import { useTranslation } from "react-i18next";
import { ServerImage } from "@/components/ui/server-image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  const { t } = useTranslation("dashboard");

  const displaySales = useMemo(() => {
    return sales ? sales.slice(0, 4) : [];
  }, [sales]);

  return (
    <Card className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.recentSales", "Recent Sales")}
        </CardTitle>
        <Link
          href="/admin/sales"
          className="typo-semibold-14 text-blue-500 hover:text-blue-600 transition-colors"
        >
          {t("sales.viewAll", "View All")}
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        {displaySales.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={t("charts.noRecentSales", "No recent sales found")}
          />
        ) : (
          displaySales.map((sale, index) => (
            <div
              key={index}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  {sale.lines?.[0]?.product?.imageUrl ? (
                    <ServerImage
                      src={sale.lines[0].product?.imageUrl || ""}
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
                    {formatDistanceToNow(
                      new Date(
                        sale.completedAt || sale.createdAt || new Date(),
                      ),
                      {
                        addSuffix: true,
                      },
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="typo-bold-14 text-foreground">
                  ${Number(sale.total || 0).toFixed(2)}
                </p>
                <p className="typo-medium-12 text-green-500">
                  {sale.status || "Completed"}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

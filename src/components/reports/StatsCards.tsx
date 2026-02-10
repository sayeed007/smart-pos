"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types";
import { useMemo } from "react";

interface StatsCardsProps {
  sales: Sale[] | undefined;
}

export function StatsCards({ sales }: StatsCardsProps) {
  const stats = useMemo(() => {
    if (!sales) return { revenue: 0, profit: 0, count: 0 };

    let revenue = 0;
    let profit = 0;

    sales.forEach((sale) => {
      revenue += sale.total;
      sale.items.forEach((item) => {
        profit += (item.sellingPrice - item.costPrice) * item.quantity;
      });
    });

    return {
      revenue,
      profit,
      count: sales.length,
    };
  }, [sales]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            $
            {stats.revenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Profit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            $
            {stats.profit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.count}</div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsSummary } from "@/lib/services/backend/reports.service";

interface StatsCardsProps {
  summary?: ReportsSummary;
}

export function StatsCards({ summary }: StatsCardsProps) {
  const revenue = summary?.totalRevenue || 0;
  const profit = summary?.totalProfit || 0;
  const count = summary?.totalOrders || 0;

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
            {revenue.toLocaleString(undefined, {
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
            {profit.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {summary?.profitEstimated && (
            <p className="text-xs text-muted-foreground mt-1">Estimated</p>
          )}
        </CardContent>
      </Card>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{count}</div>
        </CardContent>
      </Card>
    </div>
  );
}

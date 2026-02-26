"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/features/settings/store";

interface RevenueChartProps {
  data?: Array<{ date: string; revenue: number }>;
  className?: string;
}

export function RevenueChart({ data = [], className }: RevenueChartProps) {
  const { t } = useTranslation("dashboard");
  const settings = useSettingsStore();

  // Format date for display on X axis
  const formatTickDate = (dateString: unknown) => {
    if (!dateString || typeof dateString !== "string") return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Format date for tooltip
  const formatTooltipDate = (dateString: unknown) => {
    if (!dateString || typeof dateString !== "string") return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className={cn(
        "bg-card rounded-xl border-0 shadow-sm overflow-hidden",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="typo-bold-16 text-foreground">
              {t("charts.revenueOverview")}
            </CardTitle>
            <p className="typo-regular-12 text-muted-foreground mt-1">
              {t("charts.selectedRange", "Selected range")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data || []}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.09} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={formatTickDate}
              minTickGap={30}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
              }
              dx={-10}
              domain={[0, "auto"]}
            />
            <Tooltip
              labelFormatter={formatTooltipDate}
              cursor={{ stroke: "hsl(var(--sidebar-border))", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--sidebar-border))",
                backgroundColor: "hsl(var(--card))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
                fontWeight: 600,
                fontSize: "12px",
              }}
              itemStyle={{
                color: "#3b82f6",
                fontSize: "12px",
              }}
              formatter={(value: number | undefined) => [
                `${settings.currencySymbol} ${Number(value || 0).toFixed(2)}`,
                t("charts.revenueOverview"),
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

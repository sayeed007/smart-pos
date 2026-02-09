"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface RevenueChartProps {
  data?: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  const { t } = useTranslation("dashboard");
  const [dateRange, setDateRange] = useState("7");

  // Filter data based on selected date range
  const filteredData = data.slice(-parseInt(dateRange));

  // Format date for display (e.g., "Mon", "Tue", etc.)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  // Prepare chart data with formatted dates
  const chartData = filteredData.map((item) => ({
    ...item,
    displayDate: formatDate(item.date),
  }));

  return (
    <Card className="col-span-4 bg-card rounded-xl border-0 shadow-sm overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="typo-bold-16 text-foreground">
              {t("charts.revenueOverview")}
            </CardTitle>
            <p className="typo-regular-12 text-muted-foreground mt-1">
              {t("charts.last7Days")}
            </p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32 h-9 typo-regular-12 border-sidebar-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7" className="typo-regular-12">
                {t("charts.last7days")}
              </SelectItem>
              <SelectItem value="14" className="typo-regular-12">
                {t("charts.last14days")}
              </SelectItem>
              <SelectItem value="30" className="typo-regular-12">
                {t("charts.last30days")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
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
                color: "hsl(var(--chart-1))",
                fontSize: "12px",
              }}
              formatter={(value: number | undefined) => [
                `$${Number(value || 0).toFixed(2)}`,
                t("charts.revenueOverview"),
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-1))"
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

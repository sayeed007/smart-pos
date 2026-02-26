"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

interface RevenueTrendChartProps {
  data?: RevenueTrendPoint[];
}
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useSettingsStore } from "@/features/settings/store";

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const settings = useSettingsStore();

  const chartData = useMemo(() => {
    // Map backend 'revenue' to 'total' expected by chart, or just use 'revenue'
    if (!data) return [];
    return data.map((d) => ({
      date: d.date,
      total: d.revenue,
    }));
  }, [data]);

  return (
    <Card className="rounded-xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${settings.currencySymbol} ${value}`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number | undefined) => [
                  `${settings.currencySymbol} ${Number(value || 0).toFixed(2)}`,
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#f87171"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

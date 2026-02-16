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

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const trendData = data || [];

  const chartData = useMemo(() => {
    // Map backend 'revenue' to 'total' expected by chart, or just use 'revenue'
    if (!trendData) return [];
    return trendData.map((d) => ({
      date: d.date,
      total: d.revenue,
    }));
  }, [trendData]);

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
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [
                  `$${Number(value).toFixed(2)}`,
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

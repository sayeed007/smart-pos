"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#f87171", "#3b82f6", "#fbbf24", "#34d399", "#a78bfa"];

interface TopCategoryPoint {
  name: string;
  value: number;
}

interface SalesByCategoryChartProps {
  data?: TopCategoryPoint[];
}

export function SalesByCategoryChart({ data }: SalesByCategoryChartProps) {
  const categoryChartData = data || [];
  const totalValue = categoryChartData.reduce(
    (sum, entry) => sum + (Number(entry.value) || 0),
    0,
  );

  return (
    <Card className="rounded-xl border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          {categoryChartData.map((entry, index) => {
            const percent =
              totalValue > 0
                ? ((Number(entry.value) || 0) / totalValue) * 100
                : 0;
            return (
            <div
              key={entry.name}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              ></div>
              {entry.name}
              <span className="text-[11px] font-semibold text-gray-400">
                {percent.toFixed(1)}%
              </span>
            </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

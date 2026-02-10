"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_TOP_CATEGORIES_STATS } from "@/lib/mock-data";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#f87171", "#3b82f6", "#fbbf24", "#34d399", "#a78bfa"];

export function SalesByCategoryChart() {
  const categoryChartData = MOCK_TOP_CATEGORIES_STATS;

  return (
    <Card className="rounded-[2.5rem] border-0 shadow-sm">
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
          {categoryChartData.map((entry, index) => (
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

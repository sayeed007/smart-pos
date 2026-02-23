"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export interface CategoryStockData {
  name: string;
  count: number;
  color: string;
}

interface StockByCategoryProps {
  data: CategoryStockData[];
}

export function StockByCategory({ data }: StockByCategoryProps) {
  const { t } = useTranslation("inventory");
  const maxCount = Math.max(...data.map((c) => c.count), 1);

  return (
    <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader>
        <CardTitle>
          {t("sections.stockByCategory", "Stock by Category")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((cat, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between typo-medium-14">
              <span>{cat.name}</span>
              <span>{cat.count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${cat.color}`}
                style={{
                  width: `${(cat.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

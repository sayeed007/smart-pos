"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { MOCK_TOP_CATEGORIES_STATS } from "@/lib/mock-data";
import { Sale } from "@/types";

interface TopCategoriesProps {
  sales: Sale[];
}

export function TopCategories({ sales }: TopCategoriesProps) {
  const { t } = useTranslation("dashboard");

  // Predefined color palette for categories
  const COLORS = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-cyan-400",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  // Dummy data matching the design
  const categories = useMemo(() => MOCK_TOP_CATEGORIES_STATS, []);

  return (
    <Card className="col-span-3 bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-4">
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.topCategories", "Top Categories")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="typo-medium-14 text-foreground">
                {category.name}
              </span>
              <span className="typo-bold-14 text-foreground">
                ${category.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${COLORS[index % COLORS.length]}`}
                style={{ width: `${category.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

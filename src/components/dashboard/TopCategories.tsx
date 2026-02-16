"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { PieChart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface TopCategoryData {
  name: string;
  value: number;
}

interface TopCategoriesProps {
  data?: TopCategoryData[];
  className?: string;
}

export function TopCategories({ data, className }: TopCategoriesProps) {
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

  // Use provided data or return empty if undefined
  const categories = useMemo(() => {
    if (data && data.length > 0) {
      // Calculate percentages
      const total = data.reduce((acc, cat) => acc + cat.value, 0);
      return data.map((cat) => ({
        ...cat,
        percent: total > 0 ? (cat.value / total) * 100 : 0,
      }));
    }
    return [];
  }, [data]);

  return (
    <Card
      className={cn(
        "bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.topCategories", "Top Categories")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title={t("charts.noCategoryData", "No category data available")}
          />
        ) : (
          categories.map((category, index) => (
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
          ))
        )}
      </CardContent>
    </Card>
  );
}

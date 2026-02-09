"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Sale, Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopCategories } from "@/components/dashboard/TopCategories";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { PaymentMethods } from "@/components/dashboard/PaymentMethods";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

import { generateMockDailyRevenue, MOCK_STATS_CARDS } from "@/lib/mock-data";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");

  const { data: sales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => (await api.get("/sales")).data,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  // Generate realistic dummy data for the last 30 days for better visualization
  const dummySales = useMemo(() => generateMockDailyRevenue(30), []);

  const isLoading = salesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  const totalRevenue = sales?.reduce((acc, sale) => acc + sale.total, 0) || 0;
  const totalProducts = products?.length || 0;

  const displayData = sales?.length && sales.length > 7 ? sales : dummySales;

  // Prepare chart data (Revenue by Day)
  const chartData = displayData
    .reduce(
      (
        acc: { date: string; revenue: number }[],
        sale: { date: string; total: number },
      ) => {
        const existing = acc.find((d) => d.date === sale.date);
        if (existing) {
          existing.revenue += sale.total;
        } else {
          acc.push({ date: sale.date, revenue: sale.total });
        }
        return acc;
      },
      [],
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Stats cards configuration using centralized mock data
  const lowStockCount = products?.filter(
    (p) => p.stockQuantity <= (p.minStockLevel || 10),
  ).length;

  const statsCards = MOCK_STATS_CARDS.map((stat) => {
    let value = stat.value;

    if (stat.key === "totalSales") {
      value = `$${totalRevenue.toFixed(2)}`;
    } else if (stat.key === "totalProducts") {
      value = totalProducts.toString();
    } else if (stat.key === "lowStock" && typeof lowStockCount === "number") {
      value = lowStockCount.toString();
    }

    return {
      title: t(stat.translationKey),
      value: value,
      icon: stat.icon,
      iconBg: stat.iconBg,
    };
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="typo-bold-18 text-foreground tracking-tight">
          {t("page.title")}
        </h1>
        <p className="typo-regular-14 text-muted-foreground mt-1">
          {t("page.subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className="bg-card rounded-lg border-0 shadow-sm overflow-hidden gap-0 py-0"
          >
            <CardContent className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="typo-regular-12 text-muted-foreground mb-2">
                    {stat.title}
                  </p>
                  <h3 className="typo-bold-18 text-foreground">{stat.value}</h3>
                </div>
                <div
                  className={`w-8 h-8 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Image
                    src={stat.icon}
                    alt={stat.title}
                    width={32}
                    height={32}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-full">
        {/* Revenue Chart */}
        <RevenueChart data={chartData} />

        {/* Top Categories */}
        <TopCategories sales={sales || []} />
      </div>

      {/* Recent Sales & Stats Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <RecentSales sales={sales || []} />
        <LowStockAlert products={products || []} />
        <PaymentMethods sales={sales || []} />
      </div>
    </div>
  );
}

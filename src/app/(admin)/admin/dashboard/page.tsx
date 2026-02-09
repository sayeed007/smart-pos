"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Sale, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

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

  const isLoading = salesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  const totalRevenue = sales?.reduce((acc, sale) => acc + sale.total, 0) || 0;
  const totalOrders = sales?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = products?.length || 0;

  // Prepare chart data (Revenue by Day) - Last 7 days
  const chartData = sales
    ?.reduce((acc: any[], sale) => {
      const existing = acc.find((d) => d.date === sale.date);
      if (existing) {
        existing.revenue += sale.total;
      } else {
        acc.push({ date: sale.date, revenue: sale.total });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days

  // Stats cards configuration matching the reference design
  const statsCards = [
    {
      title: t("stats.totalSales"),
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "/icons/TotalSales.png",
      iconBg: "bg-[#FF6B6B]", // Red/coral
    },
    {
      title: t("stats.totalProducts"),
      value: totalProducts.toString(),
      icon: "/icons/TotalProducts.png",
      iconBg: "bg-[#00D68F]", // Green
    },
    {
      title: t("stats.customers"),
      value: "2", // Placeholder - update with actual customer count
      icon: "/icons/Customers.png",
      iconBg: "bg-[#A855F7]", // Purple
    },
    {
      title: t("stats.lowStock"),
      value: "0", // Placeholder - update with actual low stock count
      icon: "/icons/LowStock.png",
      iconBg: "bg-[#FF8A00]", // Orange
    },
  ];

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
            <CardContent className="p-2">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4 bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="typo-bold-16 text-foreground">
              {t("charts.recentRevenue")}
            </CardTitle>
            <p className="typo-regular-12 text-muted-foreground mt-1">
              {t("charts.last7Days")}
            </p>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--sidebar-border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--sidebar-border))",
                    backgroundColor: "hsl(var(--card))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 600,
                  }}
                  itemStyle={{
                    color: "hsl(var(--chart-1))",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="col-span-3 bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="typo-bold-16 text-foreground">
              {t("charts.recentSales")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sales?.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-chart-1/10 flex items-center justify-center typo-semibold-14 text-chart-1 border border-chart-1/20">
                    {sale.customerName?.charAt(0) || "G"}
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="typo-semibold-14 text-foreground leading-none">
                      {sale.invoiceNo}
                    </p>
                    <p className="typo-regular-12 text-muted-foreground">
                      {sale.items.length} {t("sales.items")}
                    </p>
                  </div>
                  <div className="typo-bold-14 text-chart-1">
                    +${sale.total.toFixed(2)}
                  </div>
                </div>
              ))}
              {(!sales || sales.length === 0) && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ShoppingBag
                    size={48}
                    className="mb-4 text-muted-foreground/30"
                  />
                  <p className="typo-semibold-14">{t("sales.noSales")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

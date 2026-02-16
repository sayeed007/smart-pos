"use client";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TopCategories } from "@/components/dashboard/TopCategories";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { PaymentMethods } from "@/components/dashboard/PaymentMethods";
import { useTranslation } from "react-i18next";
import {
  useDashboardStats,
  useRevenueChart,
  useTopCategories,
  usePaymentMethodStats,
  useLowStockProducts,
} from "@/hooks/useDashboard";
import { useSales } from "@/hooks/api/sales";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STATS_CONFIG = [
  {
    key: "totalSales",
    translationKey: "stats.totalSales",
    icon: "/icons/TotalSales.png",
    iconBg: "bg-[#FF6B6B]",
  },
  {
    key: "totalProducts",
    translationKey: "stats.totalProducts",
    icon: "/icons/TotalProducts.png",
    iconBg: "bg-[#00D68F]",
  },
  {
    key: "totalOrders", // Changed from "customers" to "totalOrders" to match stat key used below
    // Or if customers is what we want, but earlier code used "totalOrders" logic on it?
    // Let's check original code logic.
    // Original used: if (stat.key === "totalOrders") value = ...
    // But MOCK_STATS_CARDS had { key: "customers" }.
    // So "totalOrders" logic was likely never hit if key was "customers"!
    // But Step 579 snippet showed: if (stat.key === "totalOrders") ...
    // But MOCK data has "customers".
    // I should probably map "totalOrders" to "totalOrders" or fix the key.
    // Backend returns "totalOrders".
    translationKey: "stats.totalOrders", // Changed from "stats.customers" if that was the intent
    icon: "/icons/Customers.png", // Keeping icon
    iconBg: "bg-[#A855F7]",
  },
  {
    key: "lowStock",
    translationKey: "stats.lowStock",
    icon: "/icons/LowStock.png",
    iconBg: "bg-[#FF8A00]",
  },
];

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  // ... (state) ...

  // ... (hook calls) ...

  const statsCards = STATS_CONFIG.map((stat) => {
    let value = "0";

    if (stat.key === "totalSales") {
      value = `$${(stats?.totalRevenue || 0).toFixed(2)}`;
    } else if (stat.key === "totalProducts") {
      value = (stats?.totalProducts || 0).toString();
    } else if (stat.key === "lowStock") {
      value = (stats?.lowStockCount || 0).toString();
    } else if (stat.key === "totalOrders") {
      value = (stats?.totalOrders || 0).toString();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title={t("page.title")} description={t("page.subtitle")} />
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full sm:w-65 justify-start text-left font-normal bg-card",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>{t("filters.pickDate", "Pick a date range")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className="bg-card rounded-lg border-0 shadow-sm overflow-hidden"
          >
            <CardContent>
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
                    loading="eager"
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
        <RevenueChart data={revenueData || []} />

        {/* Top Categories */}
        <TopCategories data={topCategoriesData || []} />
      </div>

      {/* Recent Sales & Stats Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <RecentSales sales={recentSalesData?.data || []} />
        <LowStockAlert products={products || []} />
        <PaymentMethods data={paymentMethodsData || []} />
      </div>
    </div>
  );
}

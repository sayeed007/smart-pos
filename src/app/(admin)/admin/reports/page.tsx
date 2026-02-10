"use client";

import { PaymentMethodsList } from "@/components/reports/PaymentMethodsList";
import { ProductPerformanceTable } from "@/components/reports/ProductPerformanceTable";
import { RevenueTrendChart } from "@/components/reports/RevenueTrendChart";
import { SalesByCategoryChart } from "@/components/reports/SalesByCategoryChart";
import { SalesTransactionsTable } from "@/components/reports/SalesTransactionsTable";
import { StatsCards } from "@/components/reports/StatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/axios";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_SALES } from "@/lib/mock-data";
import { Category, Product, Sale } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const { data: sales, isLoading: sLoading } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => (await api.get("/sales")).data,
    initialData: MOCK_SALES,
  });

  const { data: products, isLoading: pLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
    initialData: MOCK_PRODUCTS,
  });

  const { data: categories, isLoading: cLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
    initialData: MOCK_CATEGORIES,
  });

  if (sLoading || pLoading || cLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Sales Reports
        </h1>
        <p className="text-gray-400 font-medium">
          View detailed sales analytics
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards sales={sales} />

      {/* Common Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <RevenueTrendChart />

        {/* Sales by Category */}
        <SalesByCategoryChart />
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50 rounded-lg p-1">
            <TabsTrigger
              value="sales"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Sales Report
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Product Report
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Payment Methods
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sales">
          <SalesTransactionsTable sales={sales} />
        </TabsContent>

        <TabsContent value="products">
          <ProductPerformanceTable
            products={products}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethodsList sales={sales} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

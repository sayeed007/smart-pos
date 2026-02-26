"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import { PaymentMethodsList } from "@/components/reports/PaymentMethodsList";
import { ProductPerformanceTable } from "@/components/reports/ProductPerformanceTable";
import { RevenueTrendChart } from "@/components/reports/RevenueTrendChart";
import { SalesByCategoryChart } from "@/components/reports/SalesByCategoryChart";
import { SalesTransactionsTable } from "@/components/reports/SalesTransactionsTable";
import { StatsCards } from "@/components/reports/StatsCards";
import { PageHeader } from "@/components/ui/page-header";
import { DataPagination } from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocationStore } from "@/features/locations/store";
import { useLocations } from "@/hooks/api/locations";
import {
  useReportsPaymentMethods,
  useReportsProducts,
  useReportsRevenueTrend,
  useReportsSales,
  useReportsSummary,
  useReportsTopCategories,
} from "@/hooks/api/reports";
import { ReportsService } from "@/lib/services/backend/reports.service";
import { startOfMonth } from "date-fns";

export default function ReportsPage() {
  const { currentLocation } = useLocationStore();
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = startOfMonth(end);
    return { from: start, to: end };
  });
  const [locationFilter, setLocationFilter] = useState(() =>
    currentLocation.id !== "default" ? currentLocation.id : "all",
  );
  const [salesPage, setSalesPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(20);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(20);
  const [exportingSales, setExportingSales] = useState(false);
  const [exportingProducts, setExportingProducts] = useState(false);

  // Sync reports location filter when admin switches location in the sidebar
  useEffect(() => {
    setLocationFilter(
      currentLocation.id !== "default" ? currentLocation.id : "all",
    );
  }, [currentLocation.id]);

  const { data: locations = [], isLoading: locationsLoading } = useLocations();

  const { startDate, endDate } = useMemo(() => {
    const end = date?.to ? new Date(date.to) : new Date();
    const start = date?.from ? new Date(date.from) : new Date(end);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [date]);

  const locationId = locationFilter === "all" ? undefined : locationFilter;

  const { data: summary, isLoading: summaryLoading } = useReportsSummary({
    startDate,
    endDate,
    locationId,
  });
  const { data: revenueTrend, isLoading: revenueLoading } =
    useReportsRevenueTrend({
      startDate,
      endDate,
      locationId,
    });
  const { data: topCategories, isLoading: categoriesLoading } =
    useReportsTopCategories({
      limit: 5,
      startDate,
      endDate,
      locationId,
    });
  const { data: paymentMethods, isLoading: paymentsLoading } =
    useReportsPaymentMethods({
      startDate,
      endDate,
      locationId,
    });
  const { data: salesResult, isLoading: salesLoading } = useReportsSales({
    startDate,
    endDate,
    locationId,
    page: salesPage,
    limit: salesPageSize,
  });
  const { data: productsResult, isLoading: productsLoading } =
    useReportsProducts({
      locationId,
      page: productsPage,
      limit: productsPageSize,
    });

  const isLoading =
    summaryLoading ||
    revenueLoading ||
    categoriesLoading ||
    paymentsLoading ||
    locationsLoading;

  const handleExportSales = async () => {
    try {
      setExportingSales(true);
      const payload = await ReportsService.exportSales({
        startDate,
        endDate,
        locationId,
      });
      const blob = new Blob([payload.content], {
        type: payload.mimeType || "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = payload.filename || "sales-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExportingSales(false);
    }
  };

  const handleExportProducts = async () => {
    try {
      setExportingProducts(true);
      const payload = await ReportsService.exportProducts({
        locationId,
      });
      const blob = new Blob([payload.content], {
        type: payload.mimeType || "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = payload.filename || "products-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExportingProducts(false);
    }
  };

  useEffect(() => {
    setSalesPage(1);
    setProductsPage(1);
  }, [startDate, endDate, locationId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Sales Reports"
          description="View detailed sales analytics"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <DateRangePicker
            date={date}
            onDateChange={setDate}
            className="w-full sm:w-65"
            align="end"
          />

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={summary} />

      {/* Common Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <RevenueTrendChart data={revenueTrend || []} />

        {/* Sales by Category */}
        <SalesByCategoryChart data={topCategories || []} />
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
          <SalesTransactionsTable
            sales={salesResult?.data || []}
            onExport={handleExportSales}
            exporting={exportingSales}
            loading={salesLoading}
            pagination={
              <DataPagination
                page={salesResult?.meta.page || 1}
                totalPages={salesResult?.meta.totalPages || 1}
                totalItems={salesResult?.meta.total}
                hasPreviousPage={salesResult?.meta.hasPreviousPage}
                hasNextPage={salesResult?.meta.hasNextPage}
                onPageChange={setSalesPage}
                pageSize={salesPageSize}
                onPageSizeChange={(nextPageSize) => {
                  setSalesPageSize(nextPageSize);
                  setSalesPage(1);
                }}
              />
            }
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductPerformanceTable
            products={productsResult?.data || []}
            onExport={handleExportProducts}
            exporting={exportingProducts}
            loading={productsLoading}
            pagination={
              <DataPagination
                page={productsResult?.meta.page || 1}
                totalPages={productsResult?.meta.totalPages || 1}
                totalItems={productsResult?.meta.total}
                hasPreviousPage={productsResult?.meta.hasPreviousPage}
                hasNextPage={productsResult?.meta.hasNextPage}
                onPageChange={setProductsPage}
                pageSize={productsPageSize}
                onPageSizeChange={(nextPageSize) => {
                  setProductsPageSize(nextPageSize);
                  setProductsPage(1);
                }}
              />
            }
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethodsList data={paymentMethods || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

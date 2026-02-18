"use client";

import { useMemo, useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { PaymentMethodsList } from "@/components/reports/PaymentMethodsList";
import { ProductPerformanceTable } from "@/components/reports/ProductPerformanceTable";
import { RevenueTrendChart } from "@/components/reports/RevenueTrendChart";
import { SalesByCategoryChart } from "@/components/reports/SalesByCategoryChart";
import { SalesTransactionsTable } from "@/components/reports/SalesTransactionsTable";
import { StatsCards } from "@/components/reports/StatsCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { from: start, to: end };
  });
  const [locationFilter, setLocationFilter] = useState("all");
  const [salesPage, setSalesPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [exportingSales, setExportingSales] = useState(false);
  const [exportingProducts, setExportingProducts] = useState(false);

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
    limit: 20,
  });
  const { data: productsResult, isLoading: productsLoading } =
    useReportsProducts({
      locationId,
      page: productsPage,
      limit: 20,
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
                  <span>Pick a date range</span>
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
          />
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (salesResult?.meta.hasPreviousPage) {
                      setSalesPage((page) => Math.max(1, page - 1));
                    }
                  }}
                  className={
                    salesResult?.meta.hasPreviousPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm font-medium text-muted-foreground px-4">
                  Page {salesResult?.meta.page || 1} of{" "}
                  {salesResult?.meta.totalPages || 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (salesResult?.meta.hasNextPage) {
                      setSalesPage((page) =>
                        salesResult?.meta.totalPages
                          ? Math.min(salesResult.meta.totalPages, page + 1)
                          : page + 1,
                      );
                    }
                  }}
                  className={
                    salesResult?.meta.hasNextPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </TabsContent>

        <TabsContent value="products">
          <ProductPerformanceTable
            products={productsResult?.data || []}
            onExport={handleExportProducts}
            exporting={exportingProducts}
            loading={productsLoading}
          />
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (productsResult?.meta.hasPreviousPage) {
                      setProductsPage((page) => Math.max(1, page - 1));
                    }
                  }}
                  className={
                    productsResult?.meta.hasPreviousPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm font-medium text-muted-foreground px-4">
                  Page {productsResult?.meta.page || 1} of{" "}
                  {productsResult?.meta.totalPages || 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (productsResult?.meta.hasNextPage) {
                      setProductsPage((page) =>
                        productsResult?.meta.totalPages
                          ? Math.min(productsResult.meta.totalPages, page + 1)
                          : page + 1,
                      );
                    }
                  }}
                  className={
                    productsResult?.meta.hasNextPage
                      ? "cursor-pointer"
                      : "pointer-events-none opacity-50"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethodsList data={paymentMethods || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

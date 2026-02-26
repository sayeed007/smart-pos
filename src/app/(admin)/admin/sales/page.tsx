"use client";

import { ReturnFormModal } from "@/components/returns/ReturnFormModal";
import { InvoiceDetailsModal } from "@/components/sales/InvoiceDetailsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { DataPagination } from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { SaleDetailsDrawer } from "@/components/sales/SaleDetailsDrawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocationStore } from "@/features/locations/store";
import { useCreateReturn } from "@/hooks/api/returns";
import { useSales, useSalesSummary } from "@/hooks/api/sales";
import { Sale } from "@/types";
import { endOfDay, format, startOfDay, startOfMonth } from "date-fns";
import { Loader2, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function SalesHistoryPage() {
  const { t } = useTranslation("sales");
  const { currentLocation } = useLocationStore();
  const locationId =
    currentLocation.id !== "default" ? currentLocation.id : undefined;

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: now,
    };
  });

  const handleDateChange = (val: DateRange | undefined) => {
    setDate(val);
    setPage(1);
  };
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [returnSale, setReturnSale] = useState<Sale | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [drawerSale, setDrawerSale] = useState<Sale | null>(null);

  // Format dates for API
  const dateParams = useMemo(() => {
    return {
      startDate: date?.from ? startOfDay(date.from).toISOString() : undefined,
      endDate: date?.from
        ? endOfDay(date.to || date.from).toISOString()
        : undefined,
      page,
      limit: pageSize,
    };
  }, [date, page, pageSize]);

  const { data: sales, isLoading: salesLoading } = useSales({
    ...dateParams,
    locationId,
  });
  const { data: summary, isLoading: summaryLoading } = useSalesSummary({
    ...dateParams,
    locationId,
  });
  const createReturnMutation = useCreateReturn();

  const handleViewInvoice = (saleId: string) => {
    const sale = sales?.data?.find((s) => s.id === saleId);
    if (sale) {
      setViewSale(sale);
    }
  };

  const handleReturnClick = (saleId: string) => {
    const sale = sales?.data?.find((s) => s.id === saleId);
    if (sale) {
      setReturnSale(sale);
    }
  };

  const handleReturnConfirm = (
    data: Partial<import("@/types").Return> & { restock?: boolean },
  ) => {
    if (createReturnMutation.isPending) return;

    const items = data.items || [];
    if (!data.saleId || items.length === 0) {
      toast.error(t("returns.validation.invalidData", "Invalid return data."));
      return;
    }

    createReturnMutation.mutate(
      {
        saleId: data.saleId,
        reason: data.reason || "",
        restock: data.restock,
        locationId: returnSale?.locationId,
        lines: items.map((item) => ({
          saleLineId: item.id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          if (data.restock !== false) {
            toast.success(
              t(
                "returns.validation.successRestocked",
                "Items returned and restocked to inventory.",
              ),
            );
          } else {
            toast.success(
              t("returns.validation.success", "Return processed successfully."),
            );
          }
          setReturnSale(null);
        },
        onError: () => {
          toast.error(
            t(
              "returns.validation.failure",
              "Failed to process return. Please try again.",
            ),
          );
        },
      },
    );
  };

  // Transform sales to order-level display data instead of flattening items.
  const displayedSales = useMemo(() => {
    const salesList = sales?.data || [];
    if (!Array.isArray(salesList)) return [];

    return salesList.map((sale) => {
      const totalItems =
        sale.lines?.reduce(
          (sum, line) => sum + (Number(line.quantity) || 0),
          0,
        ) || 0;

      return {
        // Expose both simple mapped elements and the full raw sale for the Drawer
        ...sale,
        customerName:
          sale.customer?.name || t("table.walkInCustomer", "Walk-in Customer"),
        totalItems,
        totalAmount: Number(sale.total) || 0,
        time: sale.completedAt
          ? format(new Date(sale.completedAt), "hh:mm a")
          : "",
        paymentMethod: sale.payments?.[0]?.method || "CASH",
      };
    });
  }, [sales, t]);

  if (salesLoading || summaryLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader title={t("title")} description={t("subtitle")} />

      {/* Date Filter - DateRangePicker */}
      <div className="flex items-center gap-2">
        <DateRangePicker
          date={date}
          onDateChange={handleDateChange}
          className="w-full sm:w-65"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-1 typo-semibold-14">
              {t("stats.totalRevenue")}
            </p>
            <p className="text-green-600 typo-bold-24">
              ${summary?.totalSales?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-1 typo-semibold-14">
              {t("stats.totalOrders")}
            </p>
            <p className="text-foreground typo-bold-24">
              {summary?.totalOrders || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-1 typo-semibold-14">
              {t("stats.avgOrderValue")}
            </p>
            <p className="text-blue-600 typo-bold-24">
              ${summary?.averageOrderValue?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-1 typo-semibold-14">
              {t("stats.totalDiscount")}
            </p>
            <p className="text-orange-500 typo-bold-24">
              ${summary?.totalDiscount?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-card">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-1 typo-semibold-14">
              {t("stats.totalTax")}
            </p>
            <p className="text-purple-600 typo-bold-24">
              ${summary?.totalTax?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-card">
        <div className="px-6 pt-2">
          <h2 className="text-foreground mb-4 typo-bold-18">
            {t("table.title")}
          </h2>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5 border-t border-b">
                <TableRow className="typo-semibold-14 border-b-0 p-2">
                  <TableHead className="w-15 pl-6 text-primary">
                    {t("table.headers.sl")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.invoiceNo")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.customer", "Customer")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.totalItems", "Items")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.totalAmount", "Total")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.time")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.payment")}
                  </TableHead>
                  <TableHead className="w-25 text-center text-primary">
                    {t("table.headers.status")}
                  </TableHead>
                  <TableHead className="w-20 text-center pr-6 text-primary">
                    {t("table.headers.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSales.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t("table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSales.map((sale, index) => (
                    <TableRow
                      key={sale.id}
                      className="border-sidebar-border p-2 odd:bg-card even:bg-muted hover:bg-muted/60 transition-colors"
                    >
                      <TableCell className="pl-6 py-4 typo-medium-14 text-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="typo-bold-14 text-foreground tracking-tight">
                        {sale.invoiceNo}
                      </TableCell>
                      <TableCell className="typo-medium-14 text-foreground">
                        {sale.customerName}
                      </TableCell>
                      <TableCell className="text-muted-foreground typo-regular-14">
                        {sale.totalItems}{" "}
                        {sale.totalItems === 1 ? "item" : "items"}
                      </TableCell>
                      <TableCell className="typo-bold-14 text-foreground">
                        ${sale.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground typo-regular-12">
                        {sale.time}
                      </TableCell>
                      <TableCell>
                        <span className="typo-medium-14 text-foreground">
                          {sale.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const s = (sale.status || "COMPLETED").toUpperCase();
                          const colorMap: Record<string, string> = {
                            COMPLETED: "bg-emerald-50 text-emerald-600",
                            RETURNED: "bg-red-50 text-red-500",
                            PARTIALLY_RETURNED: "bg-orange-50 text-orange-500",
                            VOIDED: "bg-gray-100 text-gray-500",
                          };
                          const cls =
                            colorMap[s] || "bg-muted text-muted-foreground";
                          return (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full typo-medium-12 ${cls}`}
                            >
                              {t(`status.${s}`, s)}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => setDrawerSale(sale)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReturnFormModal
        key={returnSale?.id}
        isOpen={!!returnSale}
        onClose={() => setReturnSale(null)}
        initialInvoiceNo={returnSale?.invoiceNo}
        onSubmit={handleReturnConfirm}
      />

      <InvoiceDetailsModal
        isOpen={!!viewSale}
        onClose={() => setViewSale(null)}
        sale={viewSale}
      />

      {/* Pagination Controls */}
      <DataPagination
        page={sales?.meta?.page || 1}
        totalPages={sales?.meta?.totalPages || 1}
        totalItems={sales?.meta?.total}
        hasPreviousPage={sales?.meta?.hasPreviousPage}
        hasNextPage={sales?.meta?.hasNextPage}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />

      <SaleDetailsDrawer
        sale={drawerSale}
        isOpen={!!drawerSale}
        onClose={() => setDrawerSale(null)}
        onReturn={handleReturnClick}
        onViewInvoice={handleViewInvoice}
      />
    </div>
  );
}

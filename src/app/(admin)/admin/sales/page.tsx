"use client";

import { Sale } from "@/types";
import { useSales, useSalesSummary } from "@/hooks/api/sales";
import { useCategories } from "@/hooks/api/categories";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Calendar as CalendarIcon,
  FileText,
  ArrowRightLeft,
  Package,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { format, startOfDay, endOfDay, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ServerImage } from "@/components/ui/server-image";
import { ReturnFormModal } from "@/components/returns/ReturnFormModal";
import { InvoiceDetailsModal } from "@/components/sales/InvoiceDetailsModal";
import { useInventoryStore } from "@/features/inventory/store/inventory-store";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

// Mock mapping if categories aren't populated in items
const CATEGORY_MAP: Record<string, string> = {
  "1": "Dresses",
  "2": "Tops",
  "3": "Bottoms",
  "4": "Outerwear",
  "5": "Accessories",
};

export default function SalesHistoryPage() {
  const { t } = useTranslation("sales");
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
  const [returnSale, setReturnSale] = useState<Sale | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  // Format dates for API
  const dateParams = useMemo(() => {
    return {
      startDate: date?.from ? startOfDay(date.from).toISOString() : undefined,
      endDate: date?.from
        ? endOfDay(date.to || date.from).toISOString()
        : undefined,
      page,
      limit: 10,
    };
  }, [date, page]);

  const { data: sales, isLoading: salesLoading } = useSales(dateParams);
  const { data: summary, isLoading: summaryLoading } =
    useSalesSummary(dateParams);

  const { data: categories } = useCategories();

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
    // In a real app, this would be an API call to create a Return entity
    const items = data.items || [];
    const reason = data.reason || "";
    const restock = data.restock || false;
    const saleId = data.saleId || "";

    if (restock) {
      // Optimistically update inventory if requested
      const transactions = items.map((i) => ({
        id: `ret-${Date.now()}-${i.id}`,
        productId: i.id,
        type: "IN" as const,
        quantity: i.quantity,
        reason: `Return: ${reason}`,
        referenceId: saleId,
        performedBy: "admin",
        createdAt: new Date().toISOString(),
        locationId: "loc1",
      }));
      useInventoryStore.getState().addTransactions(transactions);
      toast.success("Items returned and restocked to inventory.");
    } else {
      toast.success("Return processed (Items discarded).");
    }

    setReturnSale(null);
  };

  // Flatten sales to items for the table view (matching reference)
  const soldItems = useMemo(() => {
    // Check if sales exists and has data property (paginated response)
    const salesList = sales?.data || [];
    if (!Array.isArray(salesList)) return [];

    // Create a flat list of sold items
    return salesList.flatMap((sale) =>
      (sale.lines || []).map((item) => ({
        id: `${sale.id}-${item.id || Math.random()}`,
        saleId: sale.id, // Added for return action
        invoiceNo: sale.invoiceNo,
        productName: item.name,
        categoryName:
          categories?.find((c) => c.id === item.product?.categoryId)?.name ||
          CATEGORY_MAP[item.product?.categoryId || ""] ||
          "General",
        price: Number(item.unitPrice), // Unit price
        image: item.product?.imageUrl,
        time: sale.completedAt
          ? format(new Date(sale.completedAt), "hh:mm a")
          : "",
        paymentMethod: sale.payments?.[0]?.method || "CASH",
        status: sale.status,
        date: sale.completedAt,
      })),
    );
  }, [sales, categories]);

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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-75 justify-start text-left bg-card typo-regular-14",
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
                <span>{t("filters.pickDate")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
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
                    {t("table.headers.product")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.category")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.price")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.time")}
                  </TableHead>
                  <TableHead className="text-primary">
                    {t("table.headers.payment")}
                  </TableHead>
                  <TableHead className="w-20 text-center text-primary">
                    {t("table.headers.return")}
                  </TableHead>
                  <TableHead className="w-25 text-center text-primary">
                    {t("table.headers.status")}
                  </TableHead>
                  <TableHead className="w-20 text-center pr-6 text-primary">
                    {t("table.headers.invoice")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t("table.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  soldItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="border-sidebar-border p-2 odd:bg-card even:bg-muted hover:bg-muted/60 transition-colors"
                    >
                      <TableCell className="pl-6 py-4 typo-medium-14 text-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="typo-bold-14 text-foreground tracking-tight">
                        {item.invoiceNo}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                            {item.image ? (
                              <ServerImage
                                src={item.image}
                                alt={item.productName}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col align-center">
                            <p className="typo-semibold-14 text-foreground">
                              {item.productName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground typo-regular-14">
                        {item.categoryName}
                      </TableCell>
                      <TableCell className="typo-bold-14 text-foreground">
                        ${item.price?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground typo-regular-12">
                        {item.time}
                      </TableCell>
                      <TableCell>
                        <span className="typo-medium-14 text-foreground">
                          {item.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-400 hover:text-orange-500 hover:bg-orange-50"
                          onClick={() => handleReturnClick(item.saleId)}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-500 typo-medium-12">
                          {t(
                            `status.${(item.status || "completed").toLowerCase()}`,
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewInvoice(item.saleId)}
                        >
                          <FileText className="h-4 w-4" />
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
      <div className="flex items-center justify-end space-x-2 p-4 pt-0">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (sales?.meta?.hasPreviousPage) {
                    setPage((p) => Math.max(1, p - 1));
                  }
                }}
                className={
                  !sales?.meta?.hasPreviousPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            <PaginationItem>
              <span className="text-muted-foreground px-4 typo-medium-14">
                Page {sales?.meta?.page || 1} of {sales?.meta?.totalPages || 1}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (sales?.meta?.hasNextPage) {
                    setPage((p) => p + 1);
                  }
                }}
                className={
                  !sales?.meta?.hasNextPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

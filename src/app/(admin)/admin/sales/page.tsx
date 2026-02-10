"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Sale, Category } from "@/types";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { ProcessReturnModal } from "@/components/sales/ProcessReturnModal";

// Mock mapping if categories aren't populated in items
const CATEGORY_MAP: Record<string, string> = {
  "1": "Dresses",
  "2": "Tops",
  "3": "Bottoms",
  "4": "Outerwear",
  "5": "Accessories",
};

interface SaleItem {
  id: string;
  name: string;
  categoryId: string;
  sellingPrice: number;
  costPrice?: number;
  quantity: number;
  image?: string;
}

export default function SalesHistoryPage() {
  const { data: sales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => (await api.get("/sales")).data,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const { t } = useTranslation("sales");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [returnSale, setReturnSale] = useState<Sale | null>(null);

  const handleReturnClick = (saleId: string) => {
    const sale = sales?.find((s) => s.id === saleId);
    if (sale) {
      setReturnSale(sale);
    }
  };

  const handleReturnConfirm = (
    saleId: string,
    items: { itemId: string; quantity: number }[],
    reason: string,
  ) => {
    console.log("Return processed:", { saleId, items, reason });
    // TODO: Implement API call
    setReturnSale(null);
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!sales) return { revenue: 0, profit: 0, count: 0 };

    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const count = sales.length;

    // Estimate profit (Revenue - 20% cost assumed if costPrice missing, or calculate from items)
    // In a real app, calculate strict markup. Here we assume generic ~15-20% margin for demo if cost missing
    // or use item cost if available.
    const profit = sales.reduce((sum, sale) => {
      // Try to calculate exact profit from items
      const saleProfit = (sale.items as unknown as SaleItem[]).reduce(
        (acc, item) => {
          const cost = item.costPrice || item.sellingPrice * 0.7; // Fallback cost
          return acc + (item.sellingPrice - cost) * (item.quantity || 1);
        },
        0,
      );
      return sum + saleProfit;
    }, 0);

    return { revenue, profit, count };
  }, [sales]);

  // Flatten sales to items for the table view (matching reference)
  const soldItems = useMemo(() => {
    if (!sales) return [];

    // Create a flat list of sold items
    return sales.flatMap((sale) =>
      ((sale.items as unknown as SaleItem[]) || []).map((item) => ({
        id: `${sale.id}-${item.id || Math.random()}`,
        saleId: sale.id, // Added for return action
        invoiceNo: sale.invoiceNo,
        productName: item.name,
        categoryName:
          categories?.find((c) => c.id === item.categoryId)?.name ||
          CATEGORY_MAP[item.categoryId] ||
          "General",
        price: item.sellingPrice, // Unit price
        image: item.image,
        time: sale.time, // "08:30 PM"
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        date: sale.date,
      })),
    );
  }, [sales, categories]);

  if (salesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
      </div>

      {/* Date Filter - DatePicker */}
      <div className="flex items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-60 justify-start text-left font-normal bg-card",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                format(date, "PPP")
              ) : (
                <span>{t("filters.pickDate")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-none shadow-sm bg-white">
          <CardContent>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {t("stats.totalRevenue")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              ${stats.revenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-white">
          <CardContent>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {t("stats.totalProfit")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              ${stats.profit.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none shadow-sm bg-white">
          <CardContent>
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              {t("stats.totalSales")}
            </p>
            <p className="text-2xl font-bold text-foreground">{stats.count}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="px-6 pt-2">
          <h2 className="text-lg font-bold text-foreground mb-4">
            {t("table.title")}
          </h2>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted border-0">
                <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
                  <TableHead className="w-15 pl-6">
                    {t("table.headers.sl")}
                  </TableHead>
                  <TableHead>{t("table.headers.invoiceNo")}</TableHead>
                  <TableHead>{t("table.headers.product")}</TableHead>
                  <TableHead>{t("table.headers.category")}</TableHead>
                  <TableHead>{t("table.headers.price")}</TableHead>
                  <TableHead>{t("table.headers.time")}</TableHead>
                  <TableHead>{t("table.headers.payment")}</TableHead>
                  <TableHead className="w-20 text-center">
                    {t("table.headers.return")}
                  </TableHead>
                  <TableHead className="w-25 text-center">
                    {t("table.headers.status")}
                  </TableHead>
                  <TableHead className="w-20 text-center pr-6">
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
                              <Image
                                src={item.image}
                                alt={item.productName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-500">
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

      <ProcessReturnModal
        key={returnSale?.id}
        isOpen={!!returnSale}
        onClose={() => setReturnSale(null)}
        sale={returnSale}
        onConfirm={handleReturnConfirm}
      />
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataPagination } from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAllInventoryTransactions } from "@/hooks/api/inventory";
import { InventoryTransaction } from "@/types";
import { format, startOfDay, endOfDay, startOfMonth } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

interface InventoryLedgerProps {
  locationId: string;
  locationName: string;
}

export function InventoryLedger({
  locationId,
  locationName,
}: InventoryLedgerProps) {
  const { t } = useTranslation("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const end = new Date();
    const start = startOfMonth(end);
    return { from: start, to: end };
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDateChange = (val: DateRange | undefined) => {
    setDate(val);
    setPage(1);
  };

  const startDate = date?.from
    ? startOfDay(date.from).toISOString()
    : undefined;
  const endDate = date?.from
    ? endOfDay(date.to || date.from).toISOString()
    : undefined;

  // Fetch transactions from API for selected location
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useAllInventoryTransactions(locationId, page, pageSize, startDate, endDate);

  const transactions: InventoryTransaction[] = Array.isArray(
    transactionsData?.data,
  )
    ? transactionsData.data
    : Array.isArray(
          (
            transactionsData as unknown as {
              data?: { data?: InventoryTransaction[] };
            }
          )?.data?.data,
        )
      ? (transactionsData as unknown as {
          data?: { data?: InventoryTransaction[] };
        })!.data!.data!
      : Array.isArray(transactionsData)
        ? transactionsData
        : [];

  interface PaginatedMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }

  const meta = ((
    transactionsData as unknown as {
      data?: {
        meta?: PaginatedMeta;
      };
    }
  )?.data?.meta ||
    (transactionsData as unknown as { meta?: PaginatedMeta })?.meta) as
    | PaginatedMeta
    | undefined;

  // Filter Logic (Client-side search/filter still applies to the fetched page, but ideally should be backend)
  // Since we are moving to backend pagination, client-side filtering only filters the current page.
  // Ideally, search and type filter should also be passed to backend, but the backend endpoint
  // doesn't support them yet based on my previous read.
  // For now, I will keep client-side filtering on the current page data.
  const filteredTransactions = transactions?.filter((tx) => {
    const searchString =
      `${tx.product?.name || ""} ${tx.product?.sku || ""} ${tx.reason} ${tx.referenceId}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: InventoryTransaction["type"]) => {
    switch (type) {
      case "IN":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t("transactionTypes.in")}
          </Badge>
        );
      case "OUT":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            {t("transactionTypes.out")}
          </Badge>
        );
      case "ADJUST":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-500"
          >
            {t("transactionTypes.adjust")}
          </Badge>
        );
      case "TRANSFER_IN":
        return (
          <Badge variant="secondary">{t("transactionTypes.transfer_in")}</Badge>
        );
      case "TRANSFER_OUT":
        return (
          <Badge variant="secondary">
            {t("transactionTypes.transfer_out")}
          </Badge>
        );
      case "SALE":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            {t("transactionTypes.sale")}
          </Badge>
        );
      case "RETURN":
        return (
          <Badge className="bg-blue-500">{t("transactionTypes.return")}</Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.transactions")}</CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
          {/* Date Filter */}
          <DateRangePicker
            date={date}
            onDateChange={handleDateChange}
            className="w-full sm:w-60"
          />

          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("filters.search")}
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder={t("filters.filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
              <SelectItem value="IN">{t("transactionTypes.in")}</SelectItem>
              <SelectItem value="OUT">{t("transactionTypes.out")}</SelectItem>
              <SelectItem value="ADJUST">
                {t("transactionTypes.adjust")}
              </SelectItem>
              <SelectItem value="TRANSFER_IN">
                {t("transactionTypes.transfer_in")}
              </SelectItem>
              <SelectItem value="TRANSFER_OUT">
                {t("transactionTypes.transfer_out")}
              </SelectItem>
              <SelectItem value="SALE">{t("transactionTypes.sale")}</SelectItem>
              <SelectItem value="RETURN">
                {t("transactionTypes.return")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingTransactions ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden  mb-4">
              <Table>
                <TableHeader className="bg-muted/50 border-0">
                  <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
                    <TableHead>#</TableHead>
                    <TableHead>{t("tableHeaders.dateTime")}</TableHead>
                    <TableHead>{t("tableHeaders.type")}</TableHead>
                    <TableHead>{t("tableHeaders.product")}</TableHead>
                    <TableHead>{t("tableHeaders.location")}</TableHead>
                    <TableHead>{t("tableHeaders.qty")}</TableHead>
                    <TableHead>{t("tableHeaders.reasonRef")}</TableHead>
                    <TableHead>{t("tableHeaders.user")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx, index) => {
                      const sn = meta
                        ? (meta.page - 1) * meta.limit + index + 1
                        : index + 1;
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-muted-foreground typo-regular-14">
                            {sn}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap typo-medium-12">
                            {format(
                              new Date(
                                tx.createdAt || tx.timestamp || new Date(),
                              ),
                              "MMM dd, yyyy HH:mm",
                            )}
                          </TableCell>
                          <TableCell>{getTypeBadge(tx.type)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="typo-semibold-14">
                                {tx.product?.name ||
                                  t("messages.unknownProduct")}
                              </span>
                              <span className="text-muted-foreground typo-regular-12">
                                {tx.product?.sku || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="typo-regular-14">
                            {locationName}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                tx.type === "IN" || tx.type === "RETURN"
                                  ? "text-green-600 typo-bold-14"
                                  : "text-red-600 typo-bold-14"
                              }
                            >
                              {tx.type === "OUT" ? "-" : "+"}
                              {Math.abs(tx.quantity)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col typo-regular-14 text-left max-w-50">
                                    <span className="truncate">
                                      {tx.reason}
                                    </span>
                                    {tx.referenceId && (
                                      <span className="text-muted-foreground typo-regular-12 truncate">
                                        {tx.referenceId}
                                      </span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col gap-1 text-sm max-w-sm">
                                    <span>{tx.reason}</span>
                                    {tx.referenceId && (
                                      <span className="text-muted-foreground">
                                        Ref: {tx.referenceId}
                                      </span>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-muted-foreground typo-regular-14">
                            {tx?.performer?.name || tx.performedBy || "N/A"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {t("messages.noTransactions")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {meta && (
              <DataPagination
                page={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                hasPreviousPage={meta.hasPreviousPage}
                hasNextPage={meta.hasNextPage}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={(nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPage(1);
                }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

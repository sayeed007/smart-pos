"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllInventoryTransactions } from "@/hooks/api/inventory";
import { cn } from "@/lib/utils";
import { InventoryTransaction } from "@/types";
import { format, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Search } from "lucide-react";
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
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
    to: new Date(),
  });
  const [page, setPage] = useState(1);

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
    useAllInventoryTransactions(locationId, page, 10, startDate, endDate);

  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta;

  // Filter Logic (Client-side search/filter still applies to the fetched page, but ideally should be backend)
  // Since we are moving to backend pagination, client-side filtering only filters the current page.
  // Ideally, search and type filter should also be passed to backend, but the backend endpoint
  // doesn't support them yet based on my previous read.
  // For now, I will keep client-side filtering on the current page data.
  const filteredTransactions = transactions.filter((tx) => {
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
      case "TRANSFER":
        return (
          <Badge variant="secondary">{t("transactionTypes.transfer")}</Badge>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-60 justify-start text-left typo-regular-14",
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
              <SelectItem value="TRANSFER">
                {t("transactionTypes.transfer")}
              </SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
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
                  filteredTransactions.map((tx) => {
                    return (
                      <TableRow key={tx.id}>
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
                              {tx.product?.name || t("messages.unknownProduct")}
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
                          <div className="flex flex-col typo-regular-14">
                            <span>{tx.reason}</span>
                            {tx.referenceId && (
                              <span className="text-muted-foreground typo-regular-12">
                                {tx.referenceId}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground typo-regular-14">
                          {tx.performedBy}
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

            {/* Pagination Controls */}
            {meta && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          if (meta.hasPreviousPage) {
                            setPage((p) => Math.max(1, p - 1));
                          }
                        }}
                        className={
                          !meta.hasPreviousPage
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-muted-foreground px-4 typo-medium-14">
                        Page {meta.page} of {meta.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          if (meta.hasNextPage) {
                            setPage((p) => p + 1);
                          }
                        }}
                        className={
                          !meta.hasNextPage
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

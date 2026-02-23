"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransfers } from "@/hooks/api/inventory";
import { cn } from "@/lib/utils";
import { StockTransfer } from "@/types";
import { format, startOfDay, endOfDay } from "date-fns";
import { ArrowRight, Calendar as CalendarIcon, Eye } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { ViewTransferDialog } from "./ViewTransferDialog";

export function StockTransferList({
  locationId,
  onView,
}: {
  locationId: string;
  onView?: (transfer: StockTransfer) => void;
}) {
  const { t: translate } = useTranslation("inventory");
  const [selectedTransfer, setSelectedTransfer] =
    useState<StockTransfer | null>(null);
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
  const endDate = date?.to ? endOfDay(date.to).toISOString() : undefined;

  const { data: transfersData } = useTransfers(
    locationId,
    page,
    10,
    startDate,
    endDate,
  );
  const transfers = transfersData?.data || [];
  const meta = transfersData?.meta;

  const handleView = (t: StockTransfer) => {
    setSelectedTransfer(t);
    onView?.(t);
  };

  return (
    <>
      <ViewTransferDialog
        transfer={selectedTransfer}
        open={!!selectedTransfer}
        onOpenChange={(open) => !open && setSelectedTransfer(null)}
        currentLocationId={locationId}
      />

      <div className="space-y-4">
        {/* Date Filter */}
        <div className="flex items-center">
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
                  <span>{translate("filters.pickDate")}</span>
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

        <div className="border border-border rounded-lg bg-card overflow-hidden">
          {transfers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/10">
              {translate("dialogs.transferList.noTransfers")}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{translate("dialogs.transferList.ref")}</TableHead>
                  <TableHead>
                    {translate("dialogs.transferList.date")}
                  </TableHead>
                  <TableHead>
                    {translate("dialogs.transferList.route")}
                  </TableHead>
                  <TableHead>
                    {translate("dialogs.transferList.status")}
                  </TableHead>
                  <TableHead>
                    {translate("dialogs.transferList.items")}
                  </TableHead>
                  <TableHead className="text-right">
                    {translate("dialogs.transferList.action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => {
                  const isIncoming = transfer.toLocationId === locationId;
                  return (
                    <TableRow key={transfer.id}>
                      <TableCell className="text-muted-foreground typo-regular-12">
                        {transfer.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(transfer.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 typo-regular-12">
                          <span
                            className={
                              !isIncoming
                                ? "typo-bold-14"
                                : "text-muted-foreground"
                            }
                          >
                            {transfer.fromLocation?.name ||
                              transfer.fromLocationId}
                          </span>
                          <ArrowRight
                            size={12}
                            className="text-muted-foreground"
                          />
                          <span
                            className={
                              isIncoming
                                ? "typo-bold-14"
                                : "text-muted-foreground"
                            }
                          >
                            {transfer.toLocation?.name || transfer.toLocationId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transfer.status === "RECEIVED"
                              ? "default"
                              : transfer.status === "CANCELLED"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-50 typo-regular-12">
                          {transfer.lines.slice(0, 2).map((line, idx) => (
                            <span key={idx} className="truncate">
                              {line.quantity} x{" "}
                              {line.variant
                                ? line.variant.name
                                : line.product.name}
                            </span>
                          ))}
                          {transfer.lines.length > 2 && (
                            <span className="text-muted-foreground text-[10px]">
                              +{transfer.lines.length - 2}{" "}
                              {translate("common:more")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleView(transfer)}
                        >
                          <Eye size={16} />
                        </Button>
                        {isIncoming && transfer.status === "SHIPPED" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="ml-2 h-7 typo-regular-12"
                            onClick={() => handleView(transfer)}
                          >
                            {translate("dialogs.transferList.receive")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

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
      </div>
    </>
  );
}

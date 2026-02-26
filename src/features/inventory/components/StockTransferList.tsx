"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataPagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransfers } from "@/hooks/api/inventory";
import { StockTransfer } from "@/types";
import { endOfDay, format, startOfDay, startOfMonth } from "date-fns";
import { ArrowRight, Eye } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { ViewTransferDialog } from "./ViewTransferDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const endDate = date?.to ? endOfDay(date.to).toISOString() : undefined;

  const { data: transfersData } = useTransfers(
    locationId,
    page,
    pageSize,
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
      <Card>
        <CardHeader>
          <CardTitle>{translate("cards.transferHistory")}</CardTitle>

          {/* Date Filter */}
          <div className="flex items-center">
            <DateRangePicker
              date={date}
              onDateChange={handleDateChange}
              className="w-full sm:w-60"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden mb-2">
            <Table>
              <TableHeader className="bg-muted/50 border-0">
                <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
                  <TableHead>#</TableHead>
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
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {translate("dialogs.transferList.noTransfers")}
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((transfer, index) => {
                    const isIncoming = transfer.toLocationId === locationId;
                    const sn = meta
                      ? (meta.page - 1) * meta.limit + index + 1
                      : index + 1;
                    return (
                      <TableRow key={transfer.id}>
                        <TableCell className="text-muted-foreground typo-regular-14">
                          {sn}
                        </TableCell>
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
                              {transfer.toLocation?.name ||
                                transfer.toLocationId}
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
                              <span className="text-muted-foreground typo-regular-10">
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
                  })
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
        </CardContent>
      </Card>

      <ViewTransferDialog
        transfer={selectedTransfer}
        open={!!selectedTransfer}
        onOpenChange={(open) => !open && setSelectedTransfer(null)}
        currentLocationId={locationId}
      />
    </>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Return } from "@/types";
import { DeleteButton } from "@/components/ui/delete-button";

interface ReturnListTableProps {
  returns: Return[] | undefined;
  isLoading: boolean;
  onDelete: (ret: Return) => void;
  onInvoiceClick?: (ret: Return) => void;
}

import { useTranslation } from "react-i18next";

export function ReturnListTable({
  returns,
  // isLoading,
  onDelete,
  onInvoiceClick,
}: ReturnListTableProps) {
  const { t } = useTranslation(["returns", "common"]);

  return (
    <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted border-0">
          <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
            <TableHead>{t("table.invoiceNo", "Invoice No")}</TableHead>
            <TableHead>{t("table.date", "Date")}</TableHead>
            <TableHead>{t("table.customer", "Customer")}</TableHead>
            <TableHead>{t("table.reason", "Reason")}</TableHead>
            <TableHead>{t("table.status", "Status")}</TableHead>
            <TableHead className="text-right">
              {t("table.refundAmount", "Refund Amount")}
            </TableHead>
            <TableHead className="text-right">
              {t("table.actions", "Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t("table.noReturns", "No returns found.")}
              </TableCell>
            </TableRow>
          ) : (
            returns?.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell className="typo-medium-14">
                  {onInvoiceClick && ret.saleId ? (
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => onInvoiceClick(ret)}
                      className="p-0 h-auto typo-semibold-14"
                    >
                      {ret.invoiceNo}
                    </Button>
                  ) : (
                    ret.invoiceNo
                  )}
                </TableCell>
                <TableCell>{new Date(ret.date).toLocaleDateString()}</TableCell>
                <TableCell>{ret.customerName || "N/A"}</TableCell>
                <TableCell>{ret.reason}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ret.status === "Completed"
                        ? "default"
                        : ret.status === "Pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {t(`status.${ret.status}`, ret.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right typo-bold-14">
                  ${ret.refundAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DeleteButton
                      onClick={() => onDelete(ret)}
                      label="Delete return"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

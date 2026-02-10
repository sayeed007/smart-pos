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
import { Edit, Eye, Trash2 } from "lucide-react";

interface ReturnListTableProps {
  returns: Return[] | undefined;
  isLoading: boolean;
  onEdit: (ret: Return) => void;
  onDelete: (ret: Return) => void;
}

export function ReturnListTable({
  returns,
  isLoading,
  onEdit,
  onDelete,
}: ReturnListTableProps) {
  return (
    <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted border-0">
          <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
            <TableHead>Invoice No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Refund Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No returns found.
              </TableCell>
            </TableRow>
          ) : (
            returns?.map((ret) => (
              <TableRow key={ret.id}>
                <TableCell className="font-medium">{ret.invoiceNo}</TableCell>
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
                    {ret.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">
                  ${ret.refundAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(ret)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(ret)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
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

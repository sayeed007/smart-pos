"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sale } from "@/types";

interface SalesTransactionsProps {
  sales: Sale[] | undefined;
  onExport?: () => void;
  exporting?: boolean;
  loading?: boolean;
}

export function SalesTransactionsTable({
  sales,
  onExport,
  exporting,
  loading,
}: SalesTransactionsProps) {
  const hasSales = Array.isArray(sales) && sales.length > 0;

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Transactions</CardTitle>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onExport}
          disabled={!onExport || exporting}
        >
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading sales...
                  </div>
                </TableCell>
              </TableRow>
            ) : !hasSales ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No sales data available
                </TableCell>
              </TableRow>
            ) : (
              sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="typo-medium-14">
                    {sale.invoiceNo}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      sale.completedAt || sale.createdAt,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {sale.lines?.length || 0} items
                  </TableCell>
                  <TableCell>{sale.payments?.[0]?.method || "Cash"}</TableCell>
                  <TableCell className="text-right typo-bold-14">
                    ${Number(sale.total || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

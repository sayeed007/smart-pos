"use client";

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
}

export function SalesTransactionsTable({ sales }: SalesTransactionsProps) {
  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sales Transactions</CardTitle>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
            {sales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No sales data available
                </TableCell>
              </TableRow>
            ) : (
              sales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">
                    {sale.invoiceNo}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      sale.date || sale.completedAt,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {(sale.items || sale.lines)?.length || 0} items
                  </TableCell>
                  <TableCell>{sale.paymentMethod || "Cash"}</TableCell>
                  <TableCell className="text-right font-bold">
                    ${sale.total.toFixed(2)}
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

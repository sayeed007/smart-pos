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
import { Category } from "@/types";
import { ReportsProduct } from "@/lib/services/backend/reports.service";

interface ProductPerformanceProps {
  products: ReportsProduct[] | undefined;
  categories?: Category[] | undefined;
  onExport?: () => void;
  exporting?: boolean;
  loading?: boolean;
}

export function ProductPerformanceTable({
  products,
  categories,
  onExport,
  exporting,
  loading,
}: ProductPerformanceProps) {
  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Performance</CardTitle>
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
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading products...
                  </div>
                </TableCell>
              </TableRow>
            ) : !hasProducts ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No product data available
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => {
                const cat = categories?.find(
                  (c) => c.id === product.categoryId,
                );
                const categoryName =
                  product.categoryName || cat?.name || "Unknown";
                // Assuming Value means Inventory Value (Stock * Price)
                const value =
                  Number(product.stockQuantity || 0) *
                  Number(product.sellingPrice || 0);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{categoryName}</TableCell>
                    <TableCell className="text-right">
                      ${Number(product.sellingPrice || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.stockQuantity}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${value.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

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
import { Category, Product } from "@/types";

interface ProductPerformanceProps {
  products: Product[] | undefined;
  categories: Category[] | undefined;
}

export function ProductPerformanceTable({
  products,
  categories,
}: ProductPerformanceProps) {
  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Performance</CardTitle>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
            {products?.map((product) => {
              const cat = categories?.find((c) => c.id === product.categoryId);
              // Assuming Value means Inventory Value (Stock * Price)
              const value = product.stockQuantity * product.sellingPrice;
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{cat?.name || "Unknown"}</TableCell>
                  <TableCell className="text-right">
                    ${product.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stockQuantity}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${value.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

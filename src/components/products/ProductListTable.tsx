"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, Search, SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import { ProductDeleteDialog } from "@/components/products/ProductDeleteDialog";
import { Category, Product } from "@/types";
import { useTranslation } from "react-i18next";

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductListTable({
  products,
  isLoading,
  categories,
  onEdit,
  onDelete,
}: ProductListTableProps) {
  const { t } = useTranslation("products");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-muted border-0">
        <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
          <TableHead className="w-75">{t("page.headers.product")}</TableHead>
          <TableHead>{t("page.headers.sku")}</TableHead>
          <TableHead>{t("page.headers.category")}</TableHead>
          <TableHead>{t("page.headers.price")}</TableHead>
          <TableHead>{t("page.headers.stock")}</TableHead>
          <TableHead>{t("page.headers.status")}</TableHead>
          <TableHead className="text-right">
            {t("page.headers.actions")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className="border-sidebar-border p-2 odd:bg-card even:bg-muted hover:bg-muted/60 transition-colors"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col align-center">
                  <p className="typo-semibold-14 text-foreground">
                    {product.name}
                  </p>
                  <p className="typo-regular-12 mt-1 text-muted-foreground">
                    {product.id
                      ? product.id.substring(0, 8).toUpperCase()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground typo-regular-14">
              {product.sku}
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground typo-regular-14">
                {categories?.find((c) => c.id === product.categoryId)?.name ||
                  t("fields.uncategorized", "Uncategorized")}
              </span>
            </TableCell>
            <TableCell className="text-foreground typo-bold-14">
              ${product.sellingPrice.toFixed(2)}
            </TableCell>
            <TableCell>
              <span
                className={
                  product.stockQuantity < 10
                    ? "typo-bold-14 text-destructive"
                    : "text-muted-foreground typo-regular-14"
                }
              >
                {product.stockQuantity}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === "inactive"
                    ? "bg-muted text-muted-foreground ring-1 ring-inset ring-border"
                    : "bg-chart-2/10 text-chart-2 ring-1 ring-inset ring-chart-2/20"
                }`}
              >
                {product.status === "inactive"
                  ? t("fields.inactive")
                  : t("fields.active")}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => onEdit(product)}
                >
                  <SquarePen className="w-4 h-4" />
                </Button>

                {onDelete && (
                  <ProductDeleteDialog
                    product={product}
                    onConfirm={onDelete}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" color="red" />
                      </Button>
                    }
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {products.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-12 text-muted-foreground"
            >
              <div className="flex flex-col items-center gap-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p>{t("page.noProducts.description")}</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

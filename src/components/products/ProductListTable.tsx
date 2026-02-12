"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Package,
  Search,
  SquarePen,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { ProductDeleteDialog } from "@/components/products/ProductDeleteDialog";
import { Category, Product } from "@/types";
import { useTranslation } from "react-i18next";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => Promise<void> | void;
}

export function ProductListTable({
  products,
  isLoading,
  categories,
  onEdit,
  onDelete,
}: ProductListTableProps) {
  const { t } = useTranslation("products");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Columns Definition
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="pl-0 hover:bg-transparent"
          >
            {t("page.headers.product")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
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
              <p className="typo-semibold-14 text-foreground">{product.name}</p>
              <p className="typo-regular-12 mt-1 text-muted-foreground">
                {product.id ? product.id.substring(0, 8).toUpperCase() : "N/A"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sku",
      header: t("page.headers.sku"),
      cell: ({ getValue }) => (
        <div className="text-muted-foreground typo-regular-14">
          {getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: t("page.headers.category"),
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-foreground typo-regular-14">
          {categories?.find((c) => c.id === getValue())?.name ||
            t("fields.uncategorized", "Uncategorized")}
        </span>
      ),
    },
    {
      accessorKey: "price", // Virtual accessor
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 hover:bg-transparent"
        >
          {t("page.headers.price")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => {
        // Return min price for sorting
        if (row.type === "variable" && row.variants?.length) {
          return Math.min(...row.variants.map((v) => v.price));
        }
        return row.sellingPrice;
      },
      cell: ({ row }) => {
        const product = row.original;
        const content =
          product.type === "variable" && product.variants?.length
            ? (() => {
                const prices = product.variants.map((v) => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max
                  ? `$${min.toFixed(2)}`
                  : `$${min.toFixed(2)} - $${max.toFixed(2)}`;
              })()
            : `$${product.sellingPrice?.toFixed(2) || "0.00"}`;

        return <div className="text-foreground typo-bold-14">{content}</div>;
      },
    },
    {
      accessorKey: "stockQuantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0 hover:bg-transparent"
        >
          {t("page.headers.stock")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => {
        if (row.type === "variable" && row.variants) {
          return row.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
        }
        return row.stockQuantity;
      },
      cell: ({ row, getValue }) => {
        const stock = getValue() as number;
        return (
          <span
            className={
              stock < 10
                ? "typo-bold-14 text-destructive"
                : "text-muted-foreground typo-regular-14"
            }
          >
            {stock}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("page.headers.status"),
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              status === "inactive"
                ? "bg-muted text-muted-foreground ring-1 ring-inset ring-border"
                : "bg-chart-2/10 text-chart-2 ring-1 ring-inset ring-chart-2/20"
            }`}
          >
            {status === "inactive" ? t("fields.inactive") : t("fields.active")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">{t("page.headers.actions")}</div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
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
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                }
              />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader className="bg-muted border-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="typo-semibold-14 border-b border-sidebar-border p-2"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-sidebar-border p-2 odd:bg-card even:bg-muted hover:bg-muted/60 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <Search className="w-8 h-8 opacity-50" />
                  <p>{t("page.noProducts.description")}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 p-4 pt-0">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getPrePaginationRowModel().rows.length} products
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

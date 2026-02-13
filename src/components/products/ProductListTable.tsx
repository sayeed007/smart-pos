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
} from "lucide-react";
import { ServerImage } from "@/components/ui/server-image";
import { ProductDeleteDialog } from "@/components/products/ProductDeleteDialog";
import { Category, Product } from "@/types";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductListTableProps {
  products: Product[];
  isLoading: boolean;
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => Promise<void> | void;
  pageCount: number;
  pagination: { pageIndex: number; pageSize: number };
  onPageChange: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function ProductListTable({
  products,
  isLoading,
  categories,
  onEdit,
  onDelete,
  pageCount,
  pagination,
  onPageChange,
}: ProductListTableProps) {
  const { t } = useTranslation("products");
  const [sorting, setSorting] = useState<SortingState>([]);

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
                <ServerImage
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
        // Calculate total stock from locationWiseStock array
        if (row.locationWiseStock && row.locationWiseStock.length > 0) {
          return row.locationWiseStock.reduce((acc, loc) => acc + loc.stock, 0);
        }

        // Fallback to variants for variable products
        if (row.type === "variable" && row.variants) {
          // Sum from variant locationWiseStock if available
          return row.variants.reduce((acc, v) => {
            if (v.locationWiseStock && v.locationWiseStock.length > 0) {
              return (
                acc +
                v.locationWiseStock.reduce((sum, loc) => sum + loc.stock, 0)
              );
            }
            return acc + (v.stockQuantity || 0);
          }, 0);
        }

        return row.stockQuantity || 0;
      },
      cell: ({ row, getValue }) => {
        const product = row.original;
        const totalStock = getValue() as number;

        // Determine if we have location-wise data to show
        const hasLocationData =
          product.locationWiseStock && product.locationWiseStock.length > 0;

        // For variable products, aggregate all variant locations
        let locationStockMap: Map<
          string,
          { locationName: string; stock: number }
        > | null = null;

        if (product.type === "variable" && product.variants) {
          locationStockMap = new Map();
          product.variants.forEach((variant) => {
            if (variant.locationWiseStock) {
              variant.locationWiseStock.forEach((loc) => {
                const existing = locationStockMap!.get(loc.locationId);
                if (existing) {
                  existing.stock += loc.stock;
                } else {
                  locationStockMap!.set(loc.locationId, {
                    locationName: loc.locationName,
                    stock: loc.stock,
                  });
                }
              });
            }
          });
        }

        const stockContent = (
          <span
            className={
              totalStock < 10
                ? "typo-bold-14 text-destructive"
                : "text-muted-foreground typo-regular-14"
            }
          >
            {totalStock}
          </span>
        );

        // If no location data, just show the number
        if (
          !hasLocationData &&
          (!locationStockMap || locationStockMap.size === 0)
        ) {
          return stockContent;
        }

        // Show tooltip with location breakdown
        const locationData = hasLocationData
          ? product.locationWiseStock
          : Array.from(locationStockMap!.values()).map((item, idx) => ({
              locationId: `loc-${idx}`,
              locationName: item.locationName,
              stock: item.stock,
            }));

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">{stockContent}</div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1">
                  <p className="typo-semibold-12 text-foreground mb-2">
                    Stock by Location
                  </p>
                  {locationData!.map((loc) => (
                    <div
                      key={loc.locationId}
                      className="flex justify-between gap-4 typo-regular-12"
                    >
                      <span className="text-muted-foreground">
                        {loc.locationName}:
                      </span>
                      <span className="text-foreground font-medium">
                        {loc.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
    pageCount,
    state: {
      sorting,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      // Handle both functional updates and direct values
      if (typeof updater === "function") {
        onPageChange(updater(pagination));
      } else {
        onPageChange(updater);
      }
    },
    manualPagination: true,
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
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (table.getCanPreviousPage()) table.previousPage();
                }}
                className={
                  !table.getCanPreviousPage()
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {/* Simple Page Indicator for now to avoid logic complexity without a helper, or we can iterate */}
            <PaginationItem>
              <span className="text-sm font-medium text-muted-foreground px-4">
                Page {pagination.pageIndex + 1} of {pageCount}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (table.getCanNextPage()) table.nextPage();
                }}
                className={
                  !table.getCanNextPage()
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

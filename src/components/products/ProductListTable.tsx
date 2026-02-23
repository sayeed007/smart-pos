"use client";

import { useMemo, useState } from "react";
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
  Barcode,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { generateBarcodesPDF } from "@/lib/pdf-utils";

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
  const [printOpen, setPrintOpen] = useState(false);
  const [printProduct, setPrintProduct] = useState<Product | null>(null);
  const [simpleQty, setSimpleQty] = useState(1);
  const [variantSelections, setVariantSelections] = useState<
    Record<string, { checked: boolean; qty: number; disabled: boolean }>
  >({});

  const resolveBarcode = (barcode?: string, barcodes?: string[]) =>
    barcode?.trim() || barcodes?.[0]?.trim() || "";

  const openPrintDialog = (product: Product) => {
    setPrintProduct(product);
    if (product.type === "variable") {
      const selections: Record<
        string,
        { checked: boolean; qty: number; disabled: boolean }
      > = {};
      (product.variants || []).forEach((variant) => {
        const barcode = resolveBarcode(variant.barcode, variant.barcodes);
        const disabled = !barcode;
        selections[variant.id] = {
          checked: !disabled,
          qty: 1,
          disabled,
        };
      });
      setVariantSelections(selections);
    } else {
      setSimpleQty(1);
      setVariantSelections({});
    }
    setPrintOpen(true);
  };

  const handlePrint = () => {
    if (!printProduct) return;

    const labels: Array<{
      name: string;
      sku: string;
      barcode: string;
      price: number;
    }> = [];

    const sanitize = (str: string) =>
      str.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    let filename = "";

    if (printProduct.type === "variable") {
      const selectedVariants = (printProduct.variants || []).filter(
        (v) =>
          variantSelections[v.id]?.checked &&
          (variantSelections[v.id]?.qty || 0) > 0,
      );

      selectedVariants.forEach((variant) => {
        const selection = variantSelections[variant.id];
        const barcode = resolveBarcode(variant.barcode, variant.barcodes);
        if (!barcode) return;
        const qty = Math.max(1, Math.floor(selection.qty));
        for (let i = 0; i < qty; i += 1) {
          labels.push({
            name: `${printProduct.name} - ${variant.name}`,
            sku: variant.sku,
            barcode,
            price: variant.price,
          });
        }
      });

      if (selectedVariants.length === 1) {
        const v = selectedVariants[0];
        const bc = resolveBarcode(v.barcode, v.barcodes);
        filename = `${sanitize(printProduct.name)}_${sanitize(
          v.sku || "",
        )}_${sanitize(bc)}.pdf`;
      } else {
        filename = `${sanitize(printProduct.name)}_variants.pdf`;
      }
    } else {
      const barcode = resolveBarcode(
        printProduct.barcode,
        printProduct.barcodes,
      );
      if (!barcode) {
        return;
      }
      const qty = Math.max(1, Math.floor(simpleQty || 1));
      for (let i = 0; i < qty; i += 1) {
        labels.push({
          name: printProduct.name,
          sku: printProduct.sku || "",
          barcode,
          price: printProduct.sellingPrice,
        });
      }
      filename = `${sanitize(printProduct.name)}_${sanitize(
        printProduct.sku || "",
      )}_${sanitize(barcode)}.pdf`;
    }

    if (labels.length === 0) return;

    generateBarcodesPDF(labels, filename);
  };

  const canPrint = useMemo(() => {
    if (!printProduct) return false;
    if (printProduct.type === "variable") {
      return Object.values(variantSelections).some(
        (selection) => selection.checked && selection.qty > 0,
      );
    }
    return Boolean(resolveBarcode(printProduct.barcode, printProduct.barcodes));
  }, [printProduct, variantSelections]);

  const variantSelectionStats = useMemo(() => {
    const selections = Object.values(variantSelections);
    const selectable = selections.filter((selection) => !selection.disabled);
    const selected = selectable.filter((selection) => selection.checked);
    return {
      selectableCount: selectable.length,
      selectedCount: selected.length,
    };
  }, [variantSelections]);

  const selectAllState = useMemo<"indeterminate" | boolean>(() => {
    if (variantSelectionStats.selectableCount === 0) return false;
    if (variantSelectionStats.selectedCount === 0) return false;
    if (
      variantSelectionStats.selectedCount ===
      variantSelectionStats.selectableCount
    ) {
      return true;
    }
    return "indeterminate";
  }, [variantSelectionStats]);

  const handleSelectAllVariants = (checked: boolean) => {
    setVariantSelections((prev) => {
      const next: typeof prev = {};
      Object.entries(prev).forEach(([id, selection]) => {
        next[id] = selection.disabled ? selection : { ...selection, checked };
      });
      return next;
    });
  };

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
      cell: ({ row }) => {
        const product = row.original;
        const variantSkus = Array.from(
          new Set(
            (product.variants || [])
              .map((variant) => variant.sku)
              .filter((sku): sku is string => Boolean(sku)),
          ),
        );

        if (product.type === "variable" && variantSkus.length > 0) {
          const preview = variantSkus.slice(0, 2).join(", ");
          const remaining = variantSkus.length - 2;
          const label = remaining > 0 ? `${preview} +${remaining}` : preview;

          return (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="text-muted-foreground typo-regular-14 cursor-help">
                    {label}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="p-3 bg-popover border-border shadow-lg"
                  sideOffset={8}
                >
                  <div className="space-y-2 min-w-[160px]">
                    <p className="text-foreground border-b border-border pb-1.5 mb-2 typo-semibold-12">
                      Variant SKUs
                    </p>
                    <div className="space-y-1.5">
                      {variantSkus.map((sku) => (
                        <div
                          key={sku}
                          className="text-muted-foreground typo-medium-12"
                        >
                          {sku}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return (
          <div className="text-muted-foreground typo-regular-14">
            {product.sku || "-"}
          </div>
        );
      },
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
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="cursor-help inline-flex items-center gap-1">
                  {stockContent}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="p-3 bg-popover border-border shadow-lg"
                sideOffset={8}
              >
                <div className="space-y-2 min-w-[180px]">
                  <p className="text-foreground border-b border-border pb-1.5 mb-2 typo-semibold-12">
                    Stock by Location
                  </p>
                  <div className="space-y-1.5">
                    {locationData!.map((loc, index) => (
                      <div
                        key={loc.locationId}
                        className={`flex items-center justify-between gap-6 typo-regular-12 ${
                          index !== locationData!.length - 1
                            ? "pb-1.5 border-b border-border/50"
                            : ""
                        }`}
                      >
                        <span className="text-muted-foreground typo-medium-14">
                          {loc.locationName}
                        </span>
                        <span className="text-foreground tabular-nums typo-bold-14">
                          {loc.stock}
                        </span>
                      </div>
                    ))}
                  </div>
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
            className={`inline-flex items-center px-2 py-1 rounded-full typo-medium-12 ${
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

            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => openPrintDialog(product)}
              title="Print barcode"
            >
              <Barcode className="w-4 h-4" />
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
              <span className="text-muted-foreground px-4 typo-medium-14">
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

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Print Barcodes</DialogTitle>
          </DialogHeader>

          {printProduct ? (
            printProduct.type === "variable" ? (
              <div className="space-y-3">
                {(printProduct.variants || []).length === 0 && (
                  <p className="text-muted-foreground typo-regular-14">
                    No variants available.
                  </p>
                )}
                {(printProduct.variants || []).length > 0 && (
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectAllState}
                        disabled={variantSelectionStats.selectableCount === 0}
                        onCheckedChange={(checked) =>
                          handleSelectAllVariants(checked === true)
                        }
                      />
                      <span className="text-muted-foreground typo-regular-14">
                        Select all
                      </span>
                    </div>
                    <span className="text-muted-foreground typo-regular-12">
                      {variantSelectionStats.selectedCount}/
                      {variantSelectionStats.selectableCount} selected
                    </span>
                  </div>
                )}
                {(printProduct.variants || []).map((variant) => {
                  const selection = variantSelections[variant.id];
                  const barcode = resolveBarcode(
                    variant.barcode,
                    variant.barcodes,
                  );
                  return (
                    <div
                      key={variant.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <Checkbox
                        checked={selection?.checked || false}
                        disabled={selection?.disabled}
                        onCheckedChange={(checked) =>
                          setVariantSelections((prev) => ({
                            ...prev,
                            [variant.id]: {
                              checked: checked === true,
                              qty: prev[variant.id]?.qty || 1,
                              disabled: prev[variant.id]?.disabled || false,
                            },
                          }))
                        }
                      />
                      <div className="flex-1">
                        <p className="typo-semibold-14">{variant.name}</p>
                        <p className="text-muted-foreground typo-regular-12">
                          {variant.sku || "-"} - {barcode || "No barcode"}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        value={selection?.qty || 1}
                        disabled={selection?.disabled || false}
                        onChange={(e) =>
                          setVariantSelections((prev) => ({
                            ...prev,
                            [variant.id]: {
                              checked: prev[variant.id]?.checked ?? true,
                              qty: Math.max(
                                1,
                                Math.floor(Number(e.target.value) || 1),
                              ),
                              disabled: prev[variant.id]?.disabled || false,
                            },
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="typo-semibold-14">{printProduct.name}</p>
                  <p className="text-muted-foreground typo-regular-12">
                    {printProduct.sku || "-"} -{" "}
                    {resolveBarcode(
                      printProduct.barcode,
                      printProduct.barcodes,
                    ) || "No barcode"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground typo-regular-14">
                    Copies
                  </span>
                  <Input
                    type="number"
                    min={1}
                    className="w-24"
                    value={simpleQty}
                    onChange={(e) =>
                      setSimpleQty(
                        Math.max(1, Math.floor(Number(e.target.value) || 1)),
                      )
                    }
                  />
                </div>
                {!resolveBarcode(
                  printProduct.barcode,
                  printProduct.barcodes,
                ) && (
                  <p className="text-destructive typo-regular-12">
                    No barcode available for this product.
                  </p>
                )}
              </div>
            )
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintOpen(false)}>
              Cancel
            </Button>
            <PrimaryActionButton onClick={handlePrint} disabled={!canPrint}>
              Print
            </PrimaryActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

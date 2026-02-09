"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Product, Category } from "@/types";
import { Input } from "@/components/ui/input";
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
  Search,
  Loader2,
  Plus,
  SquarePen,
  Package,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  ProductFormModal,
  ProductFormData,
} from "@/components/products/ProductFormModal";
import { ProductDeleteDialog } from "@/components/products/ProductDeleteDialog";
import { useTranslation } from "react-i18next";

export default function CashierProductsPage() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t } = useTranslation("products");

  const queryClient = useQueryClient();

  // Queries
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await api.get("/products");
        return res.data;
      } catch (err) {
        console.error("Failed to fetch products", err);
        return [];
      }
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await api.get("/categories");
        return res.data;
      } catch (err) {
        console.error("Failed to fetch categories", err);
        return [];
      }
    },
  });

  // Derived state
  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  // Handlers
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsAddOpen(true);
  };

  const handleSave = async (data: ProductFormData) => {
    // API Simulation handled here
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (data.id) {
      toast.success(t("toasts.updateSuccess"));
    } else {
      toast.success(t("toasts.createSuccess"));
    }

    queryClient.invalidateQueries({ queryKey: ["products"] });
    setSelectedProduct(null);
  };

  const handleDelete = async (product: Product) => {
    // API Simulation handled here
    await new Promise((resolve) => setTimeout(resolve, 500));

    toast.success(t("toasts.deleteSuccess"));
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="typo-bold-18 text-foreground tracking-tight">
            {t("page.title")}
          </h1>
          <p className="typo-regular-14 text-muted-foreground mt-1">
            {t("page.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-chart-1 hover:bg-chart-1/90 typo-semibold-14 text-card shadow-lg shadow-chart-1/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("page.addProduct")}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-card p-1 rounded-xl shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <Input
          placeholder={t("page.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0 h-9"
        />
      </div>

      {/* Product Table */}
      <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <Table className="">
            <TableHeader className="bg-muted border-0">
              <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
                <TableHead className="w-75">
                  {t("page.headers.product")}
                </TableHead>
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
              {filteredProducts?.map((product) => (
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
                      {categories?.find((c) => c.id === product.categoryId)
                        ?.name || t("fields.uncategorized", "Uncategorized")}
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
                        onClick={() => handleEdit(product)}
                      >
                        <SquarePen className="w-4 h-4" />
                      </Button>

                      {/* Delete Modal Trigger */}
                      <ProductDeleteDialog
                        product={product}
                        onConfirm={handleDelete}
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts?.length === 0 && (
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
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <ProductFormModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        productToEdit={selectedProduct}
        categories={categories || []}
        onSave={handleSave}
      />
    </div>
  );
}

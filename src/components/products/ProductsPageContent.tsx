"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  ProductFormModal,
  ProductFormData,
} from "@/components/products/ProductFormModal";
import { useTranslation } from "react-i18next";
import { ProductListTable } from "@/components/products/ProductListTable";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";

export function ProductsPageContent() {
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
      <ProductFilterBar search={search} onSearchChange={setSearch} />

      {/* Product Table */}
      <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
        <ProductListTable
          products={filteredProducts || []}
          isLoading={isLoading}
          categories={categories || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

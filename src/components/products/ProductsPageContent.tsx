"use client";

import { useState } from "react";
import { Product } from "@/types";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/api/products";
import { useCategories } from "@/hooks/api/categories";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  ProductFormModal,
  ProductSubmissionData,
} from "@/components/products/ProductFormModal";
import { useTranslation } from "react-i18next";
import { ProductListTable } from "@/components/products/ProductListTable";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";

export function ProductsPageContent() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { t } = useTranslation("products");

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // Queries
  const { data: productsData, isLoading } = useProducts({
    page: pagination.pageIndex + 1, // API is 1-indexed
    limit: pagination.pageSize,
    search: search || undefined, // Pass search to backend
  });
  const { data: categories } = useCategories();

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Derived state
  const productList = productsData?.data || [];
  const pageCount = productsData?.meta?.totalPages || 1;

  // We rely on backend filtering mostly, but if we have local list we use it.
  // Actually, search is now backend-side, so just use productList directly.
  const filteredProducts = productList;

  // Handlers
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsAddOpen(true);
  };

  const handleSave = async (data: ProductSubmissionData) => {
    try {
      if (data.id) {
        const { id, ...updateData } = data;
        await updateProduct.mutateAsync({ id, data: updateData });
        toast.success(t("toasts.updateSuccess"));
      } else {
        // Remove id from data if it's undefined or empty, though strictly typing handles it
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...rest } = data;
        const createData = {
          ...rest,
          barcode: rest.barcode || "",
          taxRate: rest.taxRate || 0,
          minStockLevel: rest.minStockLevel || 0,
        };
        await createProduct.mutateAsync(createData);
        toast.success(t("toasts.createSuccess"));
      }

      setSelectedProduct(null);
      setIsAddOpen(false); // Close modal on success
    } catch (error: any) {
      console.error("Failed to save product", error);

      // Extract error message from backend response
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save product";
      toast.error(errorMessage);

      // Keep modal open so user can fix the error (e.g., change SKU)
      // Don't close modal or clear selectedProduct
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(t("toasts.deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error(t("toasts.deleteError", "Failed to delete product"));
    }
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
        <PrimaryActionButton onClick={handleAddClick} icon={Plus}>
          {t("page.addProduct")}
        </PrimaryActionButton>
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
          pageCount={pageCount}
          pagination={pagination}
          onPageChange={setPagination}
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

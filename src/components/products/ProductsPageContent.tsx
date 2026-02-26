"use client";

import { useState } from "react";
import type { Product } from "@/types";
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
import { getErrorMessage } from "@/lib/errors";
import {
  ProductFormModal,
  ProductSubmissionData,
} from "@/components/products/ProductFormModal";
import { useTranslation } from "react-i18next";
import { ProductListTable } from "@/components/products/ProductListTable";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";
import { PageHeader } from "@/components/ui/page-header";

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
  const totalItems = productsData?.meta?.total || productList.length;

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
    } catch (error) {
      console.error("Failed to save product", error);
      toast.error(
        getErrorMessage(error, t("toasts.saveError", "Failed to save product")),
      );

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
      toast.error(
        getErrorMessage(
          error,
          t("toasts.deleteError", "Failed to delete product"),
        ),
      );
    }
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader title={t("page.title")} description={t("page.subtitle")}>
        <PrimaryActionButton onClick={handleAddClick} icon={Plus}>
          {t("page.addProduct")}
        </PrimaryActionButton>
      </PageHeader>

      {/* Filter Bar */}
      <ProductFilterBar search={search} onSearchChange={setSearch} />

      {/* Product Table */}
      <ProductListTable
        products={filteredProducts || []}
        isLoading={isLoading}
        categories={categories || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pageCount={pageCount}
        totalItems={totalItems}
        pagination={pagination}
        onPageChange={setPagination}
      />

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

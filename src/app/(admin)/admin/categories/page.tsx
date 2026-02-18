"use client";

import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Category } from "@/types";
import { Loader2, Plus, SquarePen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/api/categories";
import { PageHeader } from "@/components/ui/page-header";

export default function CategoriesPage() {
  const { t } = useTranslation(["categories", "common"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  // Queries
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Remove manual calculation as backend provides stats (productCount, totalValue)
  const categoriesList = categories || [];

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleSave = async (categoryData: Partial<Category>) => {
    try {
      if (selectedCategory) {
        // Edit
        await updateCategory.mutateAsync({
          id: selectedCategory.id,
          data: categoryData,
        });
        toast.success(t("updateSuccess", "Category updated successfully"));
      } else {
        // Create
        if (!categoryData.name) {
          throw new Error("Category name is required");
        }
        await createCategory.mutateAsync({
          name: categoryData.name,
          icon: categoryData.icon,
        });
        toast.success(t("createSuccess", "Category created successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(error, t("common:errorMessage", "An error occurred")),
      );
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <PageHeader
        title={t("title", "Categories")}
        description={t("subtitle", "Product categories overview")}
      >
        <PrimaryActionButton onClick={handleAdd} icon={Plus}>
          {t("addCategory", "Add Category")}
        </PrimaryActionButton>
      </PageHeader>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoriesList.map((category) => (
          <Card
            key={category.id}
            className="p-4 flex flex-row items-center gap-4 border-none shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <span className="text-2xl" role="img" aria-label={category.name}>
                {category.icon || "📦"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="typo-semibold-16 truncate">{category.name}</h3>
              <p className="typo-regular-14 text-muted-foreground">
                {category.productCount || 0} {t("products", "products")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Total Value Replaced by Icon (already shown on left), so we remove this block */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleEdit(category)}
              >
                <SquarePen className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {categoriesList.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t("noCategories", "No categories found")}
          </div>
        )}
      </div>

      <CategoryFormModal
        key={isModalOpen ? selectedCategory?.id || "new" : "closed"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categoryToEdit={selectedCategory}
        onSave={handleSave}
      />
    </div>
  );
}

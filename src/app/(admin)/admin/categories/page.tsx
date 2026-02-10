"use client";

import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/axios";
import { Category, Product } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, SquarePen } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { t } = useTranslation(["categories", "common"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const queryClient = useQueryClient();

  // Queries
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const categoriesWithStats = useMemo(() => {
    if (!categories || !products) return [];
    return categories.map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      const count = catProducts.length;
      const value = catProducts.reduce(
        (sum, p) => sum + p.stockQuantity * p.sellingPrice,
        0,
      );
      return {
        ...cat,
        computedCount: count,
        computedValue: value,
      };
    });
  }, [categories, products]);

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
      if (categoryData.id) {
        // Edit simulation
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(t("updateSuccess", "Category updated successfully"));
      } else {
        // Create simulation
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(t("createSuccess", "Category created successfully"));
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("common:error", "An error occurred"));
    }
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="typo-bold-18 tracking-tight text-foreground">
            {t("title", "Categories")}
          </h1>
          <p className="typo-regular-16 text-muted-foreground">
            {t("subtitle", "Product categories overview")}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-chart-1 hover:bg-chart-1/90 text-card"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("addCategory", "Add Category")}
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoriesWithStats.map((category) => (
          <Card
            key={category.id}
            className="p-4 flex flex-row items-center gap-4 border-none shadow-sm"
          >
            <Image
              src="/icons/Category.png"
              alt={category.name}
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div className="flex-1 min-w-0">
              <h3 className="typo-semibold-16 truncate">{category.name}</h3>
              <p className="typo-regular-14 text-muted-foreground">
                {category.computedCount} {t("products", "products")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right whitespace-nowrap">
                <span className="typo-bold-16">
                  ${category.computedValue.toFixed(2)}
                </span>
              </div>
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
        {categoriesWithStats.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t("noCategories", "No categories found")}
          </div>
        )}
      </div>

      <CategoryFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        categoryToEdit={selectedCategory}
        onSave={handleSave}
      />
    </div>
  );
}

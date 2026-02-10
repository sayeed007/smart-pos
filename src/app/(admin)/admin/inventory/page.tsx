"use client";

import { RestockModal } from "@/components/inventory/RestockModal";
import { StatsCard } from "@/components/inventory/StatsCard";
import { StockByCategory } from "@/components/inventory/StockByCategory";
import { CriticalStockAlerts } from "@/components/inventory/CriticalStockAlerts";
import { ProductListTable } from "@/components/products/ProductListTable";
import { ProductFilterBar } from "@/components/products/ProductFilterBar";
import { api } from "@/lib/axios";
import { Category, Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function InventoryPage() {
  const { t } = useTranslation("inventory");
  const [search, setSearch] = useState("");
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  // Queries
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  // Derived Statistics
  const stats = useMemo(() => {
    if (!products)
      return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, value: 0 };
    return products.reduce(
      (acc, p) => ({
        total: acc.total + 1,
        inStock: acc.inStock + (p.stockQuantity > 0 ? 1 : 0),
        lowStock:
          acc.lowStock +
          (p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0 ? 1 : 0),
        outOfStock: acc.outOfStock + (p.stockQuantity === 0 ? 1 : 0),
        value: acc.value + p.stockQuantity * p.sellingPrice,
      }),
      { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, value: 0 },
    );
  }, [products]);

  // Critical Alerts
  const criticalAlerts = useMemo(() => {
    return (
      products?.filter((p) => p.stockQuantity <= p.minStockLevel).slice(0, 5) ||
      []
    );
  }, [products]);

  // Stock by Category
  const categoryStock = useMemo(() => {
    if (!products || !categories) return [];
    return categories
      .map((c) => ({
        name: c.name,
        count: products
          .filter((p) => p.categoryId === c.id)
          .reduce((sum, p) => sum + p.stockQuantity, 0),
        color:
          c.id === "1"
            ? "bg-blue-500"
            : c.id === "2"
              ? "bg-green-500"
              : c.id === "3"
                ? "bg-purple-500"
                : "bg-orange-500",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [products, categories]);

  // Filtered Products
  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRestock = (productId: string, quantity: number) => {
    console.log("Restocking", productId, quantity);
    // TODO: Mutation
    setRestockProduct(null);
  };

  const handleEdit = (product: Product) => {
    setRestockProduct(product);
  };

  const statsCards = useMemo(
    () => [
      {
        title: t("stats.totalProducts", "Total Products"),
        value: stats.total,
        iconSrc: "/icons/InventoryTotalProducts.png",
        description: t("stats.requiresAttention", "Requires attention"),
        bg: "bg-blue-50",
        valueColor: "text-blue-900",
      },
      {
        title: t("stats.inStock", "In Stock"),
        value: stats.inStock,
        iconSrc: "/icons/InStock.png",
        description: "",
        bg: "bg-green-50",
        valueColor: "text-green-900",
      },
      {
        title: t("stats.lowStock", "Low Stock"),
        value: stats.lowStock,
        iconSrc: "/icons/LowStock.png",
        description: t("stats.requiresAttention", "Requires attention"),
        bg: "bg-orange-50",
        valueColor: "text-orange-900",
      },
      {
        title: t("stats.outOfStock", "Out of Stock"),
        value: stats.outOfStock,
        iconSrc: "/icons/OutOfStock.png",
        description: t("stats.immediateRestock", "Immediate restock needed"),
        bg: "bg-red-50",
        valueColor: "text-red-900",
      },
      {
        title: t("stats.inventoryValue", "Inventory Value"),
        value: `$${(stats.value / 1000).toFixed(0)}K`,
        iconSrc: "/icons/InventoryValue.png",
        description: "",
        bg: "bg-purple-50",
        valueColor: "text-purple-900",
      },
    ],
    [stats, t],
  );

  if (productsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="typo-bold-18 tracking-tight text-foreground">
          {t("title", "Inventory Management")}
        </h1>
        <p className="typo-regular-16 text-muted-foreground">
          {t("subtitle", "Monitor and manage your stock")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {statsCards.map((card, i) => (
          <StatsCard
            key={i}
            title={card.title}
            value={card.value}
            icon={
              <Image
                src={card.iconSrc}
                alt={card.title}
                width={40}
                height={40}
              />
            }
            description={card.description}
            bg={card.bg}
            valueColor={card.valueColor}
          />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Stock by Category Component */}
        <StockByCategory data={categoryStock} />

        {/* Critical Stock Alerts Component */}
        <CriticalStockAlerts
          products={criticalAlerts}
          totalAlerts={stats.lowStock + stats.outOfStock}
          onRestock={setRestockProduct}
        />
      </div>

      {/* Inventory Table (Reused Components) */}
      <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
        <div className="p-6 space-y-4">
          <ProductFilterBar search={search} onSearchChange={setSearch} />

          <div className="rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">
            <ProductListTable
              products={filteredProducts || []}
              isLoading={productsLoading}
              categories={categories || []}
              onEdit={handleEdit}
            />
          </div>
        </div>
      </Card>

      <RestockModal
        key={restockProduct?.id}
        product={restockProduct}
        isOpen={!!restockProduct}
        onClose={() => setRestockProduct(null)}
        onRestock={handleRestock}
      />
    </div>
  );
}

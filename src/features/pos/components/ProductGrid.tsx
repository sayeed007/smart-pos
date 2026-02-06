"use client";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { cn } from "@/lib/utils";
import { Product, Category } from "@/types";
import { Scan } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
}

export function ProductGrid({ products, categories }: ProductGridProps) {
  const {
    search,
    setSearch,
    selectedCategory,
    setCategory,
    addToCart,
    setModal,
    selectProduct,
  } = usePOSStore();

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product: Product) => {
    // If category is dresses or tops, show size modal (simulated requirement)
    if (["1", "2"].includes(product.categoryId)) {
      selectProduct(product);
      setModal("size");
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="flex-1 min-w-0 max-w-full flex flex-col h-full overflow-hidden space-y-4">
      {/* Search Bar */}
      <div className="relative group shrink-0">
        <Scan
          className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f87171]"
          size={20}
        />
        <input
          type="text"
          placeholder="Scan barcode or search product.."
          className="w-full pl-16 pr-6 py-3 bg-[#F3F3F5] rounded-lg border-transparent focus:border-[#f87171] focus:ring-0 focus:outline-none shadow-sm placeholder:text-gray-400 transition-all text-semibold-14"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 pb-2 shrink-0">
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "px-4 py-2 rounded-xl transition-all",
            selectedCategory === "all"
              ? "bg-[#f87171] text-white shadow-lg shadow-red-100"
              : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100",
            "text-regular-12",
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-xl transition-all whitespace-nowrap",
              selectedCategory === cat.id
                ? "bg-[#f87171] text-white shadow-lg shadow-red-100"
                : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100",
              "text-regular-12",
            )}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-4 overflow-y-auto pr-2 pb-20">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} onClick={handleProductClick} />
        ))}
      </div>
    </div>
  );
}

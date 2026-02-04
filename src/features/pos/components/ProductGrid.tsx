"use client";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { Product, Category } from "@/types";
import { Scan } from "lucide-react";

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
          className="w-full pl-16 pr-6 py-5 bg-white rounded-3xl border-transparent focus:border-[#f87171] focus:ring-0 focus:outline-none shadow-sm text-lg placeholder:text-gray-400 transition-all font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        <button
          onClick={() => setCategory("all")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategory === "all" ? "bg-[#f87171] text-white shadow-lg shadow-red-100" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat.id ? "bg-[#f87171] text-white shadow-lg shadow-red-100" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"}`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-4 overflow-y-auto pr-2 pb-20">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => handleProductClick(p)}
            className="bg-white rounded-[2rem] p-4 border border-gray-100 hover:border-[#f87171] transition-all cursor-pointer group flex flex-col shadow-sm hover:shadow-xl hover:shadow-red-50 h-[280px]"
          >
            <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50">
              {/* Use real image or placeholder */}
              {p.image ? (
                <img
                  src={p.image}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={p.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">
              {p.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-tighter">
              {p.sku}
            </p>
            <div className="mt-auto flex justify-between items-center">
              <p className="text-[#f87171] text-lg font-bold">
                ${p.sellingPrice.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-400 font-medium uppercase">
                Stock: {p.stockQuantity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

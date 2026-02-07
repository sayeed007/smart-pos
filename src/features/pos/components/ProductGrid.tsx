"use client";

import { useState, useRef, MouseEvent } from "react";
import { usePOSStore } from "@/features/pos/store/pos-store";
import { cn } from "@/lib/utils";
import { Product, Category } from "@/types";
import { Scan } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  // Drag to scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className="flex-1 min-w-0 max-w-full flex flex-col h-full overflow-hidden space-y-4">
      {/* Search & Categories */}
      <div className="flex flex-col gap-3 p-3 bg-card shadow-sm">
        {/* Search Bar */}
        <div className="relative group shrink-0">
          <Scan
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary"
            size={20}
          />
          <Input
            type="text"
            placeholder="Scan barcode or search product.."
            className="bg-background w-full pl-10 pr-4 h-10 rounded-lg border-transparent focus-visible:ring-1 focus-visible:ring-primary shadow-sm placeholder:text-muted-foreground transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5 shrink-0 mask-fade-right cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <Button
            variant="ghost"
            onClick={() => setCategory("all")}
            className={cn(
              "px-3 py-1.5 h-auto rounded-lg transition-all shrink-0 font-medium hover:bg-transparent",
              selectedCategory === "all"
                ? "bg-chart-1 hover:bg-chart-1/90 text-white! shadow-md shadow-chart-1/20 font-bold"
                : "bg-card text-muted-foreground hover:bg-muted border border-border",
              "text-xs",
            )}
          >
            All
          </Button>
          {[...categories, ...categories].map((cat, index) => (
            <Button
              key={`${cat.id}-${index}`}
              variant="ghost"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 h-auto rounded-lg transition-all whitespace-nowrap shrink-0 font-medium hover:bg-transparent",
                selectedCategory === cat.id
                  ? "bg-chart-1 hover:bg-chart-1/90 text-white! shadow-md shadow-chart-1/20 font-bold"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border",
                "text-xs",
              )}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>
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

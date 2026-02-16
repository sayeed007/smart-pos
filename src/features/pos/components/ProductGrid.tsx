"use client";

import { useState, useRef, MouseEvent, useEffect } from "react";
import { usePOSStore } from "@/features/pos/store/pos-store";
import { cn } from "@/lib/utils";
import { Product, Category } from "@/types";
import { Scan } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface ProductGridProps {
  products: Product[];
  categories: Category[];
}

// ... imports
import { useVirtualizer } from "@tanstack/react-virtual";

// ... interface

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
  const { t } = useTranslation("pos");

  // Dedup categories just in case
  const uniqueCategories = Array.from(
    new Map(categories.map((item) => [item.id, item])).values(),
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product: Product) => {
    if (product.type === "variable") {
      selectProduct(product);
      setModal("variant-selector");
    } else {
      addToCart(product);
    }
  };

  // Drag Scroll Logic (Search/Cats)
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
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Virtualization Logic
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!parentRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(parentRef.current);
    return () => ro.disconnect();
  }, []);

  // Columns: <1280(xl)=2, >=1280=3, >=1536(2xl)=4
  const getColumns = (width: number) => {
    if (width >= 1536) return 8;
    if (width >= 1280) return 6;
    if (width >= 768) return 4;
    return 3; // Default (grid-cols-3)
  };

  const columns = getColumns(containerWidth);
  const rows = Math.ceil(filteredProducts.length / columns);

  // Estimate Row Height:
  // Card Width = (ContainerWidth - (Gap * (Columns - 1))) / Columns
  // Card Height = Card Width (Image Aspect Square) + Approx 120px (Content)
  // Gap = 16px (gap-4), Row gap = 16px vertical spacing between rows
  const GAP = 16;
  const ROW_GAP = 16;
  const cardWidth = (containerWidth - GAP * (columns - 1)) / columns;
  const estimateRowHeight = cardWidth + 120 + ROW_GAP; // 120px for text/price content + row gap
  const bottomSpacer = Math.max(48, Math.round(estimateRowHeight * 0.35));

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight || 350,
    overscan: 2,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  return (
    <div className="flex-1 min-w-0 max-w-full flex flex-col h-full overflow-hidden space-y-4">
      {/* Search & Categories */}
      <div className="flex flex-col gap-3 p-3 bg-card shadow-sm shrink-0">
        <div className="relative group shrink-0">
          <Scan
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary"
            size={20}
          />
          <Input
            type="text"
            placeholder={t("productSearch")}
            className="bg-background w-full pl-10 pr-4 h-10 rounded-lg border-transparent focus-visible:ring-1 focus-visible:ring-primary shadow-sm placeholder:text-muted-foreground transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
            {t("categoryAll")}
          </Button>
          {uniqueCategories.map((cat, index) => (
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

      {/* Virtualized Products Grid */}
      <div
        ref={parentRef}
        className="flex-1 w-full overflow-y-auto p-4 pb-10"
        style={{ contain: "strict" }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columns;
            const endIndex = Math.min(
              startIndex + columns,
              filteredProducts.length,
            );
            const rowProducts = filteredProducts.slice(startIndex, endIndex);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full grid gap-4"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  paddingBottom: `${ROW_GAP}px`,
                }}
              >
                {rowProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ height: bottomSpacer }} />
        {filteredProducts.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}

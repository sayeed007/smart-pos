"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Scan, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

interface ProductSearchComboboxProps {
  onSelect: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export function ProductSearchCombobox({
  onSelect,
  placeholder = "Search products...",
  className,
}: ProductSearchComboboxProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastSelectedBarcodeRef = useRef<string | null>(null);
  const allowOpenOnFocusRef = useRef(false);
  const suppressOpenRef = useRef(false);
  const BATCH_SIZE = 20;

  // Check if we're currently debouncing
  const isDebouncing = search !== debouncedSearch;

  // Auto-focus input on mount and after selection
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle product selection
  const handleSelect = useCallback(
    (product: Product) => {
      // Track this barcode to prevent duplicate selections
      lastSelectedBarcodeRef.current =
        product.barcode || product.sku || product.id;

      onSelect(product);
      setSearch("");
      setIsOpen(false);
      setOffset(0);
      setHasMore(true);

      // Clear the tracking after a short delay
      setTimeout(() => {
        lastSelectedBarcodeRef.current = null;
      }, 500);

      // Refocus input for next scan
      suppressOpenRef.current = true;
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [onSelect],
  );

  // Load products based on search
  useEffect(() => {
    const query = debouncedSearch.trim();
    let active = true;

    // Reset offset when search changes
    setOffset(0);
    setHasMore(true);

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let results: Product[];

        if (!query) {
          // Load products in batches when no search query
          results = await db.products.limit(BATCH_SIZE).toArray();
          setHasMore(results.length === BATCH_SIZE);
        } else {
          // Search products
          const lower = query.toLowerCase();
          const baseResults = await db.products
            .where("name")
            .startsWithIgnoreCase(query)
            .or("sku")
            .startsWithIgnoreCase(query)
            .or("barcode")
            .startsWithIgnoreCase(query)
            .limit(8)
            .toArray();

          results = baseResults;

          if (results.length < 8) {
            const variantMatches = await db.products
              .filter((product) =>
                (product.variants || []).some((variant) => {
                  const sku = variant.sku?.toLowerCase() || "";
                  const barcode = variant.barcode?.toLowerCase() || "";
                  const name = variant.name?.toLowerCase() || "";
                  return (
                    sku.includes(lower) ||
                    barcode.includes(lower) ||
                    name.includes(lower)
                  );
                }),
              )
              .limit(8 - results.length)
              .toArray();

            const map = new Map(results.map((p) => [p.id, p]));
            variantMatches.forEach((p) => map.set(p.id, p));
            results = Array.from(map.values());
          }

          // Check for exact barcode or SKU match (case-insensitive)
          const exactMatch = results.find((product) => {
            // Check main product barcode/SKU
            const mainBarcodeMatch = product.barcode?.toLowerCase() === lower;
            const mainSkuMatch = product.sku?.toLowerCase() === lower;

            if (mainBarcodeMatch || mainSkuMatch) {
              return true;
            }

            // Check variant barcodes/SKUs
            if (product.variants) {
              const variantMatch = product.variants.some((variant) => {
                const variantBarcodeMatch =
                  variant.barcode?.toLowerCase() === lower;
                const variantSkuMatch = variant.sku?.toLowerCase() === lower;

                return variantBarcodeMatch || variantSkuMatch;
              });

              if (variantMatch) {
              }
              return variantMatch;
            }
            return false;
          });

          // If exact match found, check if we haven't just selected this product
          if (exactMatch && active) {
            const productIdentifier =
              exactMatch.barcode || exactMatch.sku || exactMatch.id;

            // Prevent duplicate selection of the same product
            if (lastSelectedBarcodeRef.current === productIdentifier) {
              setIsLoading(false);
              return;
            }

            handleSelect(exactMatch);
            setIsLoading(false);
            return;
          }

          setHasMore(false); // No pagination for search results
        }

        // Sort alphabetically by name
        results.sort((a, b) => a.name.localeCompare(b.name));

        if (active) {
          setProducts(results);
          setSelectedIndex(0);
        }
      } catch {
        if (active) setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Execute search immediately (debouncing is handled by useDebounce)
    loadProducts();

    return () => {
      active = false;
    };
  }, [debouncedSearch, handleSelect]);

  // Load more products
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || search.trim()) return;

    setIsLoading(true);
    try {
      const newOffset = offset + BATCH_SIZE;
      const moreProducts = await db.products
        .offset(newOffset)
        .limit(BATCH_SIZE)
        .toArray();

      if (moreProducts.length > 0) {
        // Sort and merge
        const merged = [...products, ...moreProducts];
        merged.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(merged);
        setOffset(newOffset);
        setHasMore(moreProducts.length === BATCH_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more products", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, search, offset, products]);

  // Handle scroll to load more
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollPercentage =
        (target.scrollTop + target.clientHeight) / target.scrollHeight;

      // Load more when scrolled 80% down
      if (scrollPercentage > 0.8 && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && products.length > 0) {
      setIsOpen(true);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % products.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + products.length) % products.length,
      );
    } else if (e.key === "Enter") {
      // Prevent Enter from selecting while search is debouncing or loading
      // This fixes barcode scanner issue where Enter comes before search completes
      if (isDebouncing || isLoading) {
        e.preventDefault();
        return;
      }

      if (products.length > 0) {
        e.preventDefault();
        handleSelect(products[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
      allowOpenOnFocusRef.current = false;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        allowOpenOnFocusRef.current = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Scan className="text-muted-foreground" size={20} strokeWidth={2.5} />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onPointerDown={() => {
            allowOpenOnFocusRef.current = true;
            if (document.activeElement === inputRef.current) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suppressOpenRef.current) {
              suppressOpenRef.current = false;
              return;
            }
            if (allowOpenOnFocusRef.current || search.trim()) {
              setIsOpen(true);
            }
            allowOpenOnFocusRef.current = false;
          }}
          onKeyDown={handleKeyDown}
          className="pl-11 pr-10 h-12 font-medium"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {isOpen && products.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border-2 border-primary/20 bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div
            className="max-h-80 overflow-y-auto scrollbar-thin"
            onScroll={handleScroll}
          >
            {products.map((product, index) => (
              <Button
                variant="ghost"
                key={product.id}
                className={cn(
                  "w-full justify-between h-auto px-4 py-3 border-b border-border/50 last:border-b-0 rounded-none",
                  index === selectedIndex
                    ? "bg-primary/15 border-primary/30"
                    : "hover:bg-primary/10 active:bg-primary/15",
                )}
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {product.type === "variable" && product.variants?.length
                      ? `${product.variants.length} variant${product.variants.length > 1 ? "s" : ""}`
                      : product.sku || "No SKU"}
                  </p>
                </div>
                <div className="text-sm font-bold text-chart-1 shrink-0">
                  $
                  {product.type === "variable" && product.variants?.length
                    ? Math.min(...product.variants.map((v) => v.price)).toFixed(
                        2,
                      )
                    : Number(product.sellingPrice || 0).toFixed(2)}
                </div>
              </Button>
            ))}
            {isLoading && (
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                Loading more...
              </div>
            )}
            {!hasMore && !search.trim() && products.length > 0 && (
              <div className="px-4 py-3 text-center text-xs text-muted-foreground">
                All products loaded
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

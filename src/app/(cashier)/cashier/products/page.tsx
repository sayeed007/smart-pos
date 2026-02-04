"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Product, Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Package } from "lucide-react";
import { ProductGrid } from "@/features/pos/components/ProductGrid";

export default function CashierProductsPage() {
  const [search, setSearch] = useState("");

  // Reuse the POS Grid component for viewing products, but maybe wrapped or different context?
  // Actually, the POS ProductGrid is coupled to POS store.
  // Let's create a simpler view for just browsing or reuse if meaningful.
  // The requirement was "Products (Read-only/Search)".
  // Let's build a simple grid view similar to POS but without the "Add to Cart" intent primarily, or maybe just list them.

  // Re-using the same table structure as Admin but without Actions is cleaner.

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Products Lookup
        </h1>
        <p className="text-gray-400 font-medium">
          Search inventory across all categories
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          placeholder="Search product name or SKU..."
          className="pl-12 py-6 rounded-2xl bg-white border-0 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts?.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
                {p.image && (
                  <img
                    src={p.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {p.sku}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-black text-[#f87171]">
                  ${p.sellingPrice.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500">
                  {p.stockQuantity} Stock
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

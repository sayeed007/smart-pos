"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { db } from "@/lib/db";
import { Product, Category, Offer } from "@/types";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { POSModals } from "./components/POSModals";
import { Loader2 } from "lucide-react";

import { useOfflineProducts } from "@/hooks/use-offline-products";

// ...

export default function POSFeature() {
  const { data: products, isLoading: pLoading } = useOfflineProducts();

  const { data: categories, isLoading: cLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["offers"],
    queryFn: async () =>
      await db.offers.where("status").equals("active").toArray(),
  });

  if (pLoading || cLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <ProductGrid products={products || []} categories={categories || []} />
      <CartPanel offers={offers} />
      <POSModals />
    </div>
  );
}

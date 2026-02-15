"use client";

import { useEffect } from "react";
import { Offer } from "@/types";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { POSModals } from "./components/POSModals";
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/api/products";
import { useCategories } from "@/hooks/api/categories";
import { useActiveOffers } from "@/hooks/api/offers";
import { useLocations } from "@/hooks/api/locations";
import { useLocationStore } from "@/features/locations/store";

export default function POSFeature() {
  // Fetch products from the real backend
  const { data: productsResult, isLoading: pLoading } = useProducts({
    limit: 1000,
  });
  const products = productsResult?.data || [];

  // Fetch categories from the real backend
  const { data: categories, isLoading: cLoading } = useCategories();

  // Fetch active offers from the real backend
  const { data: activeOffers } = useActiveOffers();
  const offers: Offer[] = activeOffers || [];

  // Fetch real locations and populate the location store
  const { data: locationsData } = useLocations();
  const { setLocations } = useLocationStore();

  useEffect(() => {
    if (
      locationsData &&
      Array.isArray(locationsData) &&
      locationsData.length > 0
    ) {
      setLocations(locationsData);
    }
  }, [locationsData, setLocations]);

  if (pLoading || cLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <ProductGrid
        products={products}
        categories={Array.isArray(categories) ? categories : []}
      />
      <CartPanel offers={offers} />
      <POSModals offers={offers} />
    </div>
  );
}

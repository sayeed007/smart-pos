"use client";

import { useEffect } from "react";
import { Offer } from "@/types";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { POSModals } from "./components/POSModals";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/api/categories";
import { useActiveOffers } from "@/hooks/api/offers";
import { useLocations } from "@/hooks/api/locations";
import { useLocationStore } from "@/features/locations/store";
import { useOfflineProducts } from "@/hooks/use-offline-products";

export default function POSFeature() {
  // Fetch products from local DB (synced from backend)
  const { data: products = [], isLoading: pLoading } = useOfflineProducts();

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
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* ProductGrid - Hidden on mobile (< lg), visible on desktop */}
      <div className="hidden lg:flex lg:flex-1 min-w-0 h-full">
        <ProductGrid
          products={products}
          categories={Array.isArray(categories) ? categories : []}
        />
      </div>

      {/* CartPanel - Full screen on mobile, sidebar on desktop */}
      <div className="flex-1 lg:flex-initial lg:w-[320px] xl:w-96 shrink-0">
        <CartPanel offers={offers} />
      </div>

      <POSModals offers={offers} />
    </div>
  );
}

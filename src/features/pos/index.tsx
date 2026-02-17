"use client";

import { useEffect } from "react";
import { Offer } from "@/types";
import { ProductGrid } from "./components/ProductGrid";
import { CartPanel } from "./components/CartPanel";
import { POSModals } from "./components/POSModals";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCategories } from "@/hooks/api/categories";
import { useActiveOffers } from "@/hooks/api/offers";
import { useLocations } from "@/hooks/api/locations";
import { useLocationStore } from "@/features/locations/store";
import { ProductsService } from "@/lib/services/backend/products.service";

export default function POSFeature() {
  // Fetch products from the real backend (paginated, capped at 100 per page)
  const { data: products = [], isLoading: pLoading } = useQuery({
    queryKey: ["products", "pos"],
    queryFn: async () => {
      const limit = 100;
      const firstPage = await ProductsService.list({ page: 1, limit });
      const totalPages = firstPage?.meta?.totalPages ?? 1;

      if (totalPages <= 1) {
        return firstPage.data || [];
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          ProductsService.list({ page: index + 2, limit }),
        ),
      );

      return [
        ...(firstPage.data || []),
        ...remainingPages.flatMap((page) => page.data || []),
      ];
    },
  });

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

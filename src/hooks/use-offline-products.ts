
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { db } from "@/lib/db";
import { Product, PriceOverride } from "@/types";
import { toast } from "sonner";

import { useLocationStore } from "@/features/locations/store";
import { syncProductsToLocal } from "@/lib/db";

export function useOfflineProducts() {
    const { currentLocation } = useLocationStore();

    return useQuery<Product[]>({
        queryKey: ["products", "offline-sync", currentLocation.id],
        queryFn: async () => {
            let products: Product[] = [];

            // 1. Try Online First
            try {
                if (navigator.onLine) {
                    const res = await api.get("/products");
                    // Sync to local DB (using helper that handles inventoryLevels)
                    await syncProductsToLocal(res.data);
                }
            } catch (error) {
                console.warn("Online fetch failed, falling back to DB", error);
                if (!navigator.onLine) {
                    toast.error("Offline Mode: Serving local data");
                }
            }

            // 2. Fetch from Local DB (Source of Truth for offline/multilocation)
            try {
                const localProducts = await db.products.toArray();
                const levels = await db.inventoryLevels.where('locationId').equals(currentLocation.id).toArray();

                let overrides: PriceOverride[] = [];
                if (currentLocation.priceBookId) {
                    overrides = await db.priceOverrides.where('priceBookId').equals(currentLocation.priceBookId).toArray();
                }

                // Merge Inventory Levels AND Prices
                products = localProducts.map(p => {
                    const level = levels.find(l => l.productId === p.id && !l.variantId);
                    const override = overrides.find(o => o.productId === p.id && !o.variantId);

                    return {
                        ...p,
                        sellingPrice: override ? override.price : p.sellingPrice,
                        stockQuantity: level ? level.quantity : 0,
                        variants: p.variants?.map(v => {
                            const vLevel = levels.find(l => l.variantId === v.id);
                            const vOverride = overrides.find(o => o.variantId === v.id);

                            return {
                                ...v,
                                stockQuantity: vLevel ? vLevel.quantity : 0,
                                price: vOverride ? vOverride.price : v.price
                            };
                        })
                    }
                });

                if (products.length === 0 && navigator.onLine) {
                    // Fallback if DB empty but we are online (and api call above might have failed or not returned data yet?)
                    // Actually if API succeeded, syncProductsToLocal ran, so DB should have data.
                    // If DB empty here, something is wrong or it's fresh start.
                }

                return products;
            } catch (dbError) {
                console.error("Critical: DB Access Failed", dbError);
                throw dbError;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes fresh
        retry: 1, // Minimize retries on failure to quickly fallback
    });
}

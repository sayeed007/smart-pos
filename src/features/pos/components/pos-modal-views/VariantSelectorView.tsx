"use client";

import { Button } from "@/components/ui/button";
import { Product, Variant } from "@/types";
import { useTranslation } from "react-i18next";
import { useLocationStore } from "@/features/locations/store";

interface VariantSelectorViewProps {
  product: Product;
  onSelect: (product: Product, variant: Variant) => void;
  onClose: () => void;
}

export function VariantSelectorView({
  product,
  onSelect,
  onClose,
}: VariantSelectorViewProps) {
  const { t } = useTranslation(["pos", "common"]);
  const { currentLocation } = useLocationStore();

  return (
    <div className="bg-card rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 min-w-80 max-w-md">
      <h3 className="text-foreground tracking-tight mb-1 text-center typo-regular-20 typo-bold-14">
        {t("variant.selectOption", "Select Option")}
      </h3>
      <p className="text-muted-foreground mb-6 text-center typo-medium-14">
        {product.name}
      </p>

      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
        {product.variants && product.variants.length > 0 ? (
          product.variants.map((v) => {
            const currentStock = currentLocation
              ? (v.locationWiseStock?.find(
                  (s) => s.locationId === currentLocation.id,
                )?.stock ?? 0)
              : v.stockQuantity;

            return (
              <Button
                key={v.id}
                variant="outline"
                onClick={() => onSelect(product, v)}
                className="h-auto w-full flex flex-col items-center justify-center p-4 bg-card border border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group whitespace-normal"
              >
                <div className="typo-bold-14 text-foreground line-clamp-2 text-center">
                  {v.name}
                </div>
                <div className="typo-semibold-12 text-muted-foreground">
                  {v.sku}
                </div>
                <div className="text-primary typo-bold-16">
                  ${v.price.toFixed(2)}
                </div>
                <div
                  className={`typo-bold-11 uppercase mt-1 ${
                    currentStock > 0 ? "text-green-500" : "text-red-400"
                  }`}
                >
                  {currentStock > 0
                    ? t("product.inStock", "{{count}} In Stock", {
                        count: currentStock,
                      })
                    : t("product.outOfStock", "Out of Stock")}
                </div>
              </Button>
            );
          })
        ) : (
          <div className="col-span-2 text-center text-muted-foreground py-8">
            {t("variant.noVariants", "No variants available for this product.")}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground border border-border"
          onClick={onClose}
        >
          {t("common:cancel", "Cancel")}
        </Button>
      </div>
    </div>
  );
}

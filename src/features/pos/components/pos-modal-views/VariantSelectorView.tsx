"use client";

import { Button } from "@/components/ui/button";
import { Product, Variant } from "@/types";
import { useTranslation } from "react-i18next";

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

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 min-w-80 max-w-md">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1 text-center">
        {t("variant.selectOption", "Select Option")}
      </h3>
      <p className="text-sm text-gray-400 font-medium mb-6 text-center">
        {product.name}
      </p>

      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
        {product.variants && product.variants.length > 0 ? (
          product.variants.map((v) => (
            <Button
              key={v.id}
              variant="outline"
              onClick={() => onSelect(product, v)}
              className="h-auto w-full flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group whitespace-normal"
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
                  v.stockQuantity > 0 ? "text-green-500" : "text-red-400"
                }`}
              >
                {v.stockQuantity > 0
                  ? t("product.inStock", "{{count}} In Stock", {
                      count: v.stockQuantity,
                    })
                  : t("product.outOfStock", "Out of Stock")}
              </div>
            </Button>
          ))
        ) : (
          <div className="col-span-2 text-center text-muted-foreground py-8">
            {t("variant.noVariants", "No variants available for this product.")}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full text-gray-400 hover:text-gray-900"
          onClick={onClose}
        >
          {t("common:cancel", "Cancel")}
        </Button>
      </div>
    </div>
  );
}

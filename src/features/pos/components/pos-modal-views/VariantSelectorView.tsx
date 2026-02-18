"use client";

import { Button } from "@/components/ui/button";
import { Product, Variant } from "@/types";

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
  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 min-w-80 max-w-md">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1 text-center">
        Select Option
      </h3>
      <p className="text-sm text-gray-400 font-medium mb-6 text-center">
        {product.name}
      </p>

      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
        {product.variants && product.variants.length > 0 ? (
          product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => onSelect(product, v)}
              className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="font-bold text-base text-gray-900">{v.name}</div>
              <div className="text-xs text-gray-400 mb-1">{v.sku}</div>
              <div className="text-primary font-bold text-lg">
                ${v.price.toFixed(2)}
              </div>
              <div
                className={`text-[10px] font-bold uppercase mt-1 ${
                  v.stockQuantity > 0 ? "text-green-500" : "text-red-400"
                }`}
              >
                {v.stockQuantity > 0
                  ? `${v.stockQuantity} In Stock`
                  : "Out of Stock"}
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-2 text-center text-muted-foreground py-8">
            No variants available for this product.
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full text-gray-400 hover:text-gray-900"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

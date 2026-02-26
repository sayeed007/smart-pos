"use client";

import { Card } from "@/components/ui/card";
import { Product } from "@/types";
import { ServerImage } from "@/components/ui/server-image";
import { useLocationStore } from "@/features/locations/store";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const { currentLocation } = useLocationStore();

  const currentStock = currentLocation
    ? (product.locationWiseStock?.find(
        (s) => s.locationId === currentLocation.id,
      )?.stock ?? 0)
    : product.stockQuantity;

  return (
    <Card
      onClick={() => onClick(product)}
      className="rounded-xl p-4 border-border hover:border-primary transition-all cursor-pointer group flex flex-col shadow-sm hover:shadow-xl hover:shadow-primary/10 gap-0 h-full"
    >
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-muted">
        {product.image ? (
          <ServerImage
            src={product.image}
            fill
            sizes="(max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
            No Image
          </div>
        )}
      </div>
      <h3 className=" text-foreground typo-semibold-14 mb-2 line-clamp-1">
        {product.name}
      </h3>
      <p className="typo-regular-12 text-muted-foreground mb-2 uppercase tracking-wide">
        {product.sku}
      </p>
      <div className="mt-3 flex justify-between items-center">
        <div className="text-chart-1 typo-bold-18">
          ${product.sellingPrice.toFixed(2)}
        </div>
        <div className="typo-regular-12 text-muted-foreground">
          Stock: {currentStock}
        </div>
      </div>
    </Card>
  );
}

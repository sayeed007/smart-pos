"use client";

import { Card } from "@/components/ui/card";
import { Product } from "@/types";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      onClick={() => onClick(product)}
      className="rounded-2xl p-4 border-gray-100 hover:border-[#f87171] transition-all cursor-pointer group flex flex-col shadow-sm hover:shadow-xl hover:shadow-red-50 gap-0 h-full"
    >
      <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-2 bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            fill
            sizes="(max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>
      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
        {product.name}
      </h3>
      <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">
        {product.sku}
      </p>
      <div className="mt-auto flex justify-between items-end">
        <p className="text-[#f87171] text-2xl font-black">
          ${product.sellingPrice.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 font-medium mb-1">
          Stock: {product.stockQuantity}
        </p>
      </div>
    </Card>
  );
}

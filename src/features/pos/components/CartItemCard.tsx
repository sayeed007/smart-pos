"use client";

import { CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { t } = useTranslation("pos");

  return (
    <Card className="p-3 shadow-sm border-border bg-card relative group gap-2">
      <div className="flex justify-between items-start mb-1">
        <div className="pr-6">
          <h4 className="typo-semibold-14 text-foreground line-clamp-2">
            {item.name}
          </h4>
          <p className="typo-regular-12 text-muted-foreground mt-0.5">
            ${item.sellingPrice.toFixed(2)} {t("cart.each")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-6 w-6 text-muted-foreground/40 hover:text-destructive hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(-1);
            }}
          >
            <Minus size={14} />
          </Button>
          <span className="typo-semibold-14 w-4 text-center text-foreground">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQuantity(1);
            }}
          >
            <Plus size={14} />
          </Button>
        </div>

        {/* Item Total */}
        <div className="text-right">
          <span className="typo-bold-16 text-foreground">
            ${(item.sellingPrice * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}

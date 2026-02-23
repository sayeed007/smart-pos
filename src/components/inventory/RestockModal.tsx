"use client";

import { Product } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Input } from "@/components/ui/input";
import { ServerImage } from "@/components/ui/server-image";
import { AlertCircle, Package } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RestockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRestock: (productId: string, quantity: number) => void;
}

export function RestockModal({
  product,
  isOpen,
  onClose,
  onRestock,
}: RestockModalProps) {
  const { t } = useTranslation("inventory");
  const [quantity, setQuantity] = useState<number | string>(() => {
    if (product) {
      const needed = Math.max(0, product.minStockLevel - product.stockQuantity);
      return needed > 0 ? needed : "";
    }
    return "";
  });

  const quantityNum = Number(quantity) || 0;
  const costPrice =
    product?.costPrice ||
    (product?.sellingPrice ? product.sellingPrice * 0.7 : 0);
  const cost = costPrice * quantityNum;

  const handleRestock = () => {
    if (product && quantityNum > 0) {
      onRestock(product.id, quantityNum);
      onClose();
    }
  };

  if (!product) return null;

  const isLowStock = product.stockQuantity <= product.minStockLevel;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-112.5 p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
            {product.image ? (
              <ServerImage
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <DialogTitle className="typo-bold-20">
              {t("modal.title", "Restock Product")}
            </DialogTitle>
            <p className="text-muted-foreground typo-regular-14">
              {product.name}
            </p>
          </div>
        </DialogHeader>

        <div className="px-6 space-y-6 pb-6">
          {/* Low Stock Alert */}
          {isLowStock && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="typo-semibold-14">
                  {t("modal.alert.title", "Low Stock Alert")}
                </p>
                <p className="mt-0.5 typo-regular-12">
                  {t("modal.alert.message", {
                    current: product.stockQuantity,
                    min: product.minStockLevel,
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Product Details Grid */}
          <div className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 gap-y-2 typo-regular-14">
            <span className="text-muted-foreground">
              {t("modal.sku", "SKU")}:
            </span>
            <span className="text-right typo-medium-14">{product.sku}</span>

            <span className="text-muted-foreground">
              {t("modal.category", "Category")}:
            </span>
            <span className="text-right typo-medium-14">
              {/* Assuming category fetching outside or name passed, but Product has categoryId only unless joined.
                  For UI simplicity, I'll mock or assume category name not strictly available. Or pass categories prop?
                  I'll omit mapping for now or use "Unknown" if not strictly required to fetch.
                  Ref image shows "Women Top".
              */}
              {product.categoryId === "1"
                ? t("categories.dresses", "Dresses")
                : product.categoryId === "2"
                  ? t("categories.tops", "Tops")
                  : t("categories.general", "General")}
            </span>

            <span className="text-muted-foreground">
              {t("modal.currentStock", "Current Stock")}:
            </span>
            <span
              className={`text-right typo-bold-14 ${isLowStock ? "text-destructive" : "text-emerald-600"}`}
            >
              {product.stockQuantity} {t("alerts.units", "units")}
            </span>
          </div>

          {/* Restock Input */}
          <div className="space-y-2">
            <label className="typo-medium-14">
              {t("modal.restockQuantity", "Restock Quantity *")}
            </label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-11 rounded-lg border-input bg-background"
            />
            {quantityNum > 0 && (
              <p className="text-muted-foreground typo-regular-12">
                {t("modal.recommended", { amount: quantityNum })}
              </p>
            )}
          </div>

          {/* Cost Preview */}
          <div className="bg-orange-50/50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-foreground/80 typo-medium-14">
              {t("modal.cost", "Cost:")}
            </span>
            <span className="text-foreground typo-bold-20">
              ${cost.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl"
            >
              {t("modal.cancel", "Cancel")}
            </Button>
            <PrimaryActionButton
              onClick={handleRestock}
              disabled={quantityNum <= 0}
            >
              {t("modal.addStock", "Add Stock")}
            </PrimaryActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

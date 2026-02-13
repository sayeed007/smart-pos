"use client";

import { useState } from "react";
import { useLocationStore } from "@/features/locations/store";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCreateTransfer, useShipTransfer } from "@/hooks/api/inventory";
import { useProducts } from "@/hooks/api/products";
import { useLocations } from "@/hooks/api/locations";

export function CreateTransferDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const { t } = useTranslation("inventory");
  const { currentLocation } = useLocationStore();
  const [open, setOpen] = useState(false);
  const [toLocationId, setToLocationId] = useState("");
  const [items, setItems] = useState<
    { productId: string; variantId?: string; quantity: number; name: string }[]
  >([]);

  const createTransfer = useCreateTransfer();
  const shipTransfer = useShipTransfer();
  const { data: productsData } = useProducts({ page: 1, limit: 1000 });
  const { data: locations } = useLocations();

  const products = productsData?.data || [];

  // Form state for adding item
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("none");
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const variants = selectedProduct?.variants || [];

  const addItem = () => {
    if (!selectedProduct) return;
    const itemName =
      selectedVariantId !== "none"
        ? `${selectedProduct.name} - ${variants.find((v) => v.id === selectedVariantId)?.name}`
        : selectedProduct.name;

    const item = {
      productId: selectedProduct.id,
      variantId: selectedVariantId !== "none" ? selectedVariantId : undefined,
      quantity: quantity,
      name: itemName,
    };
    setItems([...items, item]);
    setSelectedProductId("");
    setSelectedVariantId("none");
    setQuantity(1);
  };

  const handleCreate = async () => {
    if (!toLocationId || items.length === 0) return;

    try {
      // 1. Create Transfer
      const transfer = await createTransfer.mutateAsync({
        fromLocationId: currentLocation.id,
        toLocationId,
        lines: items.map(({ productId, variantId, quantity }) => ({
          productId,
          variantId,
          quantity,
        })),
      });

      // 2. Ship the transfer immediately (for MVP)
      await shipTransfer.mutateAsync(transfer.id);

      toast.success(
        t("dialogs.createTransfer.successMessage", {
          ref: transfer.id.slice(0, 8),
        }),
      );
      setOpen(false);
      setItems([]);
      setToLocationId("");
    } catch (e) {
      console.error(e);
      toast.error(t("dialogs.createTransfer.errorMessage"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <PrimaryActionButton>
            {t("dialogs.createTransfer.buttonText")}
          </PrimaryActionButton>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogs.createTransfer.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
            <div className="flex-1 font-bold text-center">
              {currentLocation.name}
            </div>
            <ArrowRight size={16} className="text-muted-foreground" />
            <div className="flex-1">
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger className="w-full h-8 bg-white border-0 shadow-sm">
                  <SelectValue
                    placeholder={t("dialogs.createTransfer.destination")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(locations || [])
                    .filter((loc) => loc.id !== currentLocation.id)
                    .map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="grid grid-cols-4 gap-2 items-end border-b pb-4">
            <div className="col-span-4">
              <label className="text-xs font-medium text-muted-foreground uppercase">
                {t("dialogs.createTransfer.product")}
              </label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("dialogs.createTransfer.selectProduct")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {variants.length > 0 && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  {t("dialogs.createTransfer.variant")}
                </label>
                <Select
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("dialogs.createTransfer.oneSize")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t("dialogs.createTransfer.noVariant")}
                    </SelectItem>
                    {variants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className={variants.length > 0 ? "col-span-1" : "col-span-2"}>
              <label className="text-xs font-medium text-muted-foreground uppercase">
                {t("dialogs.createTransfer.qty")}
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="col-span-1">
              <Button
                className="w-full"
                onClick={addItem}
                disabled={!selectedProductId}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-50 overflow-y-auto space-y-2">
            {items.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-4">
                {t("dialogs.createTransfer.noItems")}
              </div>
            )}
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-muted/20 p-2 rounded text-sm border"
              >
                <span className="font-medium truncate max-w-50">
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-xs">
                    x{item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full py-6 text-md font-bold"
            onClick={handleCreate}
            disabled={items.length === 0 || !toLocationId}
          >
            {t("dialogs.createTransfer.shipTransfer")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

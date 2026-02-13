"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from "@/features/inventory/store/inventory-store";
import { updateLocalStock } from "@/lib/db";
import { MOCK_LOCATIONS, MOCK_PRODUCTS } from "@/lib/mock-data";
import { InventoryTransaction } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useLocationStore } from "@/features/locations/store";

export function StockAdjustmentDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const { currentLocation } = useLocationStore();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("none");
  const [type, setType] = useState<InventoryTransaction["type"]>("ADJUST");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [locationId, setLocationId] = useState(currentLocation.id);

  const addTransaction = useInventoryStore((state) => state.addTransaction);

  const selectedProduct = MOCK_PRODUCTS.find((p) => p.id === productId);
  const variants = selectedProduct?.variants || [];

  const handleSubmit = () => {
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (!reason) {
      toast.error("Please provide a reason");
      return;
    }

    const transaction: InventoryTransaction = {
      id: `tx-adj-${new Date().getTime()}`,
      productId,
      variantId: variantId !== "none" ? variantId : undefined,
      type,
      quantity:
        type === "OUT" || type === "RETURN"
          ? -Math.abs(quantity)
          : Math.abs(quantity),
      reason,
      performedBy: "u1", // Default Admin
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      locationId,
    };

    addTransaction(transaction);
    updateLocalStock([transaction]);
    toast.success("Stock adjustment recorded");
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setProductId("");
    setVariantId("none");
    setType("ADJUST");
    setQuantity(1);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <PrimaryActionButton>Adjust Stock</PrimaryActionButton>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>New Stock Adjustment</DialogTitle>
          <DialogDescription>
            Manually adjust stock levels for a product. This will create an
            audit record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as InventoryTransaction["type"])}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Stock In (Purchase)</SelectItem>
                <SelectItem value="OUT">Stock Out (Damage/Loss)</SelectItem>
                <SelectItem value="ADJUST">Correction</SelectItem>
                <SelectItem value="RETURN">Customer Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Location</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Product</Label>
            <Select
              value={productId}
              onValueChange={(v) => {
                setProductId(v);
                setVariantId("none");
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PRODUCTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {variants.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Variant</Label>
              <Select value={variantId} onValueChange={setVariantId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Variant --</SelectItem>
                  {variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Quantity</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-8 text-center"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. PO #123, Damaged during shipping"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Record Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

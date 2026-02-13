"use client";

import { useState } from "react";
import { useLocationStore } from "@/features/locations/store";
import { db, updateLocalStock } from "@/lib/db";
import { StockTransfer, InventoryTransaction } from "@/types";
import { MOCK_PRODUCTS, MOCK_LOCATIONS } from "@/lib/mock-data";
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

export function CreateTransferDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const { currentLocation } = useLocationStore();
  const [open, setOpen] = useState(false);
  const [toLocationId, setToLocationId] = useState("");
  const [items, setItems] = useState<
    { productId: string; variantId?: string; quantity: number; name: string }[]
  >([]);

  // Form state for adding item
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("none");
  const [quantity, setQuantity] = useState(1);

  const availableLocations = MOCK_LOCATIONS.filter(
    (l) => l.id !== currentLocation.id,
  );
  const selectedProduct = MOCK_PRODUCTS.find((p) => p.id === selectedProductId);
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

    const transferId = crypto.randomUUID();

    const transfer: StockTransfer = {
      id: transferId,
      fromLocationId: currentLocation.id,
      toLocationId,
      items,
      status: "shipped", // Immediate ship for MVP
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shippedBy: "u1", // Default User
    };

    try {
      // 1. Save Transfer
      await db.stockTransfers.add(transfer);

      // 2. Create OUT Transactions (Deduct from Source)
      // Note: We use type 'OUT' because we are removing from HERE.
      // When Receiving, we will use type 'IN'.
      const transactions: InventoryTransaction[] = items.map((item) => ({
        id: `tx-${crypto.randomUUID()}`,
        productId: item.productId,
        variantId: item.variantId,
        type: "OUT",
        quantity: item.quantity,
        reason: `Transfer to ${toLocationId} (Ref: ${transferId.slice(0, 8)})`,
        referenceId: transferId,
        performedBy: "u1",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        locationId: currentLocation.id,
      }));

      await updateLocalStock(transactions); // Updates Source Inventory Level

      toast.success(
        `Transfer created & shipped. Ref: ${transfer.id.slice(0, 8)}`,
      );
      setOpen(false);
      setItems([]);
      setToLocationId("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create transfer.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <PrimaryActionButton>New Transfer</PrimaryActionButton>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Stock Transfer</DialogTitle>
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
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
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
                Product
              </label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
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
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">
                  Variant
                </label>
                <Select
                  value={selectedVariantId}
                  onValueChange={setSelectedVariantId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="One Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- One Size --</SelectItem>
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
                Qty
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
                No items added.
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
            Ship Transfer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

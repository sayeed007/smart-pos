"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { PriceBook, Product } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

export function PriceBookEditorDialog({
  book,
  open,
  onOpenChange,
}: {
  book: PriceBook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [overrides, setOverrides] = useState<Map<string, number>>(new Map()); // productId -> price
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open || !book) return;
    const load = async () => {
      // Only Simple Products for MVP to avoid UI complexity of variants
      const prods = await db.products.where("type").equals("simple").toArray();
      const overs = await db.priceOverrides
        .where("priceBookId")
        .equals(book.id)
        .toArray();

      const overMap = new Map();
      overs.forEach((o) => {
        if (o.productId && !o.variantId) overMap.set(o.productId, o.price);
      });

      setProducts(prods);
      setOverrides(overMap);
    };
    load();
  }, [open, book]);

  if (!book) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const handlePriceChange = async (productId: string, val: string) => {
    if (val === "") {
      await clearOverride(productId);
      return;
    }

    const price = parseFloat(val);
    if (isNaN(price)) return;

    // Optimistic Update
    setOverrides((prev) => new Map(prev).set(productId, price));
    try {
      await db.priceOverrides.put({
        id: `ov-${book.id}-${productId}`,
        priceBookId: book.id,
        productId,
        price: price, // Store as number
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      toast.error("Failed to save price");
    }
  };

  const clearOverride = async (productId: string) => {
    setOverrides((prev) => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
    await db.priceOverrides.where({ priceBookId: book.id, productId }).delete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Prices: {book.name}</DialogTitle>
          <DialogDescription>
            Set custom prices for products in this price book. (Currently
            showing Simple Products only)
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-right w-24">Base Price</th>
                <th className="p-3 text-right w-32">Override</th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const override = overrides.get(p.id);
                const hasOverride = override !== undefined;

                return (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/10"
                  >
                    <td className="p-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.sku}
                      </div>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      ${p.sellingPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-muted-foreground text-xs">
                          $
                        </span>
                        <input
                          type="number"
                          className={`w-full border rounded px-2 py-1 pl-4 text-right ${hasOverride ? "border-primary font-bold bg-primary/5" : "border-input"}`}
                          placeholder={p.sellingPrice.toFixed(2)}
                          value={hasOverride ? override : ""}
                          onChange={(e) =>
                            handlePriceChange(p.id, e.target.value)
                          }
                        />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {hasOverride && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => clearOverride(p.id)}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

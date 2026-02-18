"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useLocationStore } from "@/features/locations/store";
import { useCreateTransfer, useShipTransfer } from "@/hooks/api/inventory";
import { useLocations } from "@/hooks/api/locations";
import { useProducts } from "@/hooks/api/products";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Minus, Package, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { z } from "zod";

interface TransferItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  sku?: string;
  maxStock?: number; // Available stock at source
}

export function CreateTransferDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const { t } = useTranslation(["inventory", "common"]);
  const { currentLocation } = useLocationStore();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TransferItem[]>([]);

  // API Hooks
  const createTransfer = useCreateTransfer();
  const shipTransfer = useShipTransfer();
  const { data: productsData } = useProducts({ page: 1, limit: 1000 });
  const { data: locations } = useLocations();

  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Transfer Location State
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");

  const itemSchema = z.object({
    productId: z
      .string()
      .min(
        1,
        t("dialogs.createTransfer.errorSelectProduct") || "Select a product",
      ),
    variantId: z.string().optional(),
    quantity: z.coerce
      .number()
      .min(
        1,
        t("dialogs.createTransfer.errorMinQuantity") ||
          "Quantity must be at least 1",
      ),
  });

  type ItemFormValues = z.infer<typeof itemSchema>;

  const resolver = zodResolver(itemSchema) as Resolver<ItemFormValues>;

  const form = useForm<ItemFormValues>({
    resolver,
    defaultValues: {
      productId: "",
      variantId: "none",
      quantity: 1,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  // Watch values for logic
  const selectedProductId = watch("productId");
  const selectedVariantId = watch("variantId");

  // Selected Product Details
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId],
  );

  const variants = selectedProduct?.variants || [];

  // Initialize from location with current location
  useEffect(() => {
    if (open && currentLocation?.id) {
      setFromLocationId(currentLocation.id);
      setToLocationId("");
      setItems([]);
      reset();
    }
  }, [open, currentLocation, reset]);

  // Reset product selection when From Location changes
  useEffect(() => {
    if (fromLocationId) {
      // Could clear items or selection here if needed
    }
  }, [fromLocationId]);

  const handleAddItem = (data: ItemFormValues) => {
    if (!selectedProduct) return;
    if (!fromLocationId) {
      toast.error(t("dialogs.createTransfer.errorValidation"));
      return;
    }

    // Determine Logic Stock Limit
    const variantId = data.variantId !== "none" ? data.variantId : undefined;

    // Find stock in fromLocation
    let availableStock = 0;

    if (variantId) {
      const variant = variants.find((v) => v.id === variantId);
      availableStock =
        variant?.locationWiseStock?.find((l) => l.locationId === fromLocationId)
          ?.stock || 0;
    } else {
      availableStock =
        selectedProduct.locationWiseStock?.find(
          (l) => l.locationId === fromLocationId,
        )?.stock || 0;
    }

    if (data.quantity > availableStock) {
      toast.error(
        t("dialogs.createTransfer.errorMaxStock", { max: availableStock }),
      );
      return;
    }

    const variant = variants.find((v) => v.id === data.variantId);
    const itemName = variant
      ? `${selectedProduct.name} - ${variant.name}`
      : selectedProduct.name;

    const newItem: TransferItem = {
      productId: data.productId,
      variantId: variantId,
      quantity: data.quantity,
      name: itemName,
      sku: variant?.sku || selectedProduct.sku,
      maxStock: availableStock,
    };

    // Check if item already exists
    const existingIndex = items.findIndex(
      (i) =>
        i.productId === newItem.productId && i.variantId === newItem.variantId,
    );

    if (existingIndex >= 0) {
      // Check total quantity against stock
      if (items[existingIndex].quantity + newItem.quantity > availableStock) {
        toast.error(
          t("dialogs.createTransfer.errorMaxStock", { max: availableStock }),
        );
        return;
      }

      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += newItem.quantity;
      setItems(updatedItems);
    } else {
      setItems([...items, newItem]);
    }

    setValue("quantity", 1);
  };

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;

    // Check Max Stock
    const item = items[index];
    if (item.maxStock !== undefined && newQty > item.maxStock) {
      toast.error(
        t("dialogs.createTransfer.errorMaxStock", { max: item.maxStock }),
      );
      return;
    }

    const updatedItems = [...items];
    updatedItems[index].quantity = newQty;
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!fromLocationId || !toLocationId || items.length === 0) {
      toast.error(t("dialogs.createTransfer.errorValidation"));
      return;
    }

    if (fromLocationId === toLocationId) {
      toast.error(t("dialogs.createTransfer.errorSameLocation"));
      return;
    }

    try {
      // 1. Create Transfer
      const transfer = await createTransfer.mutateAsync({
        fromLocationId,
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
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(error, t("dialogs.createTransfer.errorMessage")),
      );
    }
  };

  // Helper to get stock display for selected product at selected Source
  const getSourceStock = () => {
    if (!selectedProduct || !fromLocationId) return 0;

    let stock = 0;
    // Check if it's a variable product (has variants)
    const hasVariants =
      selectedProduct.variants && selectedProduct.variants.length > 0;

    if (hasVariants) {
      if (!selectedVariantId || selectedVariantId === "none") {
        return 0;
      }
      const variant = selectedProduct.variants?.find(
        (v) => v.id === selectedVariantId,
      );
      stock =
        variant?.locationWiseStock?.find((l) => l.locationId === fromLocationId)
          ?.stock || 0;
    } else {
      // Simple product
      stock =
        selectedProduct.locationWiseStock?.find(
          (l) => l.locationId === fromLocationId,
        )?.stock || 0;
    }
    return stock;
  };

  // Filter products based on source location selection
  const filteredProducts = useMemo(() => {
    if (!fromLocationId) return products;
    return products.filter((p) => {
      // 1. Check Product Level Stock (for SIMPLE products)
      const hasProductStock = p.locationWiseStock?.some(
        (l) => l.locationId === fromLocationId && l.stock > 0,
      );

      // 2. Check Variant Level Stock (for VARIABLE products)
      const hasVariantStock = p.variants?.some((v) =>
        v.locationWiseStock?.some(
          (l) => l.locationId === fromLocationId && l.stock > 0,
        ),
      );

      return hasProductStock || hasVariantStock;
    });
  }, [products, fromLocationId]);

  const stock = getSourceStock();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <PrimaryActionButton>
            {t("dialogs.createTransfer.buttonText")}
          </PrimaryActionButton>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialogs.createTransfer.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-0">
          {/* Header Bar: From -> To (Compact) */}
          <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg border">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs uppercase text-muted-foreground font-bold">
                {t("dialogs.createTransfer.from")}
              </Label>
              <Select value={fromLocationId} onValueChange={setFromLocationId}>
                <SelectTrigger className="bg-background w-full">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {(locations || []).map((loc) => (
                    <SelectItem
                      key={loc.id}
                      value={loc.id}
                      disabled={loc.id === toLocationId}
                    >
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6 text-muted-foreground">
              <ArrowRight size={18} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs uppercase text-muted-foreground font-bold">
                {t("dialogs.createTransfer.to")}
              </Label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger className="bg-background w-full">
                  <SelectValue placeholder="Dest." />
                </SelectTrigger>
                <SelectContent>
                  {(locations || []).map((loc) => (
                    <SelectItem
                      key={loc.id}
                      value={loc.id}
                      disabled={loc.id === fromLocationId}
                    >
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-semibold text-sm">
              {t("dialogs.createTransfer.addItem")}
            </Label>

            <div className="flex flex-col gap-3">
              {/* Row 1: Product + Qty + Button */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Controller
                    control={control}
                    name="productId"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setValue("variantId", "none");
                        }}
                      >
                        <SelectTrigger
                          className={
                            errors.productId
                              ? "border-destructive w-full"
                              : "w-full"
                          }
                        >
                          <SelectValue
                            placeholder={t(
                              "dialogs.createTransfer.selectProduct",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredProducts.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground text-center">
                              No products with stock in source
                            </div>
                          ) : (
                            filteredProducts.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-24">
                  <Controller
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        className="text-center"
                        min={1}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    )}
                  />
                </div>

                <PrimaryActionButton
                  type="button"
                  onClick={handleSubmit(handleAddItem)}
                  disabled={!selectedProductId}
                  className="px-6"
                >
                  {t("common:add")}
                </PrimaryActionButton>
              </div>

              {/* Row 2: Variant (If applicable) */}
              {selectedProduct && variants.length > 0 ? (
                <div className="flex gap-3 items-center mt-2">
                  <div className="flex-1">
                    <Controller
                      control={control}
                      name="variantId"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={t(
                                "dialogs.createTransfer.selectVariant",
                              )}
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
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-end min-w-28 text-xs text-muted-foreground whitespace-nowrap px-1">
                    {stock !== null && (
                      <>
                        Available:{" "}
                        <span
                          className={
                            stock > 0
                              ? "font-bold text-green-600 ml-1"
                              : "font-bold text-destructive ml-1"
                          }
                        >
                          {stock}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : selectedProduct ? (
                <div className="text-xs text-right text-muted-foreground mt-1">
                  Available at Source:{" "}
                  <span
                    className={
                      stock > 0
                        ? "font-bold text-green-600"
                        : "font-bold text-destructive"
                    }
                  >
                    {stock}
                  </span>{" "}
                  units
                </div>
              ) : null}

              {/* End of Stock Message Logic */}

              {errors.productId && (
                <p className="text-xs text-destructive">
                  {errors.productId.message}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-md min-h-37.5 overflow-hidden flex flex-col">
            <div className="bg-muted/50 px-4 py-2 flex text-xs font-medium text-muted-foreground border-b uppercase">
              <div className="flex-1">
                {t("dialogs.createTransfer.product")}
              </div>
              <div className="w-32 text-center">
                {t("dialogs.createTransfer.qty")}
              </div>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-50 p-0 divide-y">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs py-8">
                  <Package size={24} className="mb-2 opacity-50" />
                  {t("dialogs.createTransfer.noItems")}
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center px-4 py-3 hover:bg-muted/5"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="font-medium text-sm whitespace-normal">
                        {item.name}
                      </div>
                      <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>{item.sku}</span>
                        {item.maxStock !== undefined && (
                          <span className="text-blue-600 bg-blue-50 px-1 rounded">
                            Max: {item.maxStock}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-32 flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleUpdateItemQuantity(idx, item.quantity - 1)
                        }
                      >
                        <Minus size={12} />
                      </Button>
                      <Input
                        type="number"
                        className="h-7 w-12 text-center text-xs p-0 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItemQuantity(
                            idx,
                            parseInt(e.target.value) || 0,
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleUpdateItemQuantity(idx, item.quantity + 1)
                        }
                      >
                        <Plus size={12} />
                      </Button>
                    </div>

                    <div className="w-10 flex justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 size={16} color="red" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common:cancel")}
          </Button>
          <PrimaryActionButton
            onClick={handleCreate}
            disabled={items.length === 0 || !toLocationId || !fromLocationId}
          >
            {t("dialogs.createTransfer.confirmTransfer")}
          </PrimaryActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Minus, Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { useTranslation } from "react-i18next";
import { useLocationStore } from "@/features/locations/store";
import { useAdjustStock } from "@/hooks/api/inventory";
import { useProducts } from "@/hooks/api/products";
import { useLocations } from "@/hooks/api/locations";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

export function StockAdjustmentDialog({
  trigger,
  defaultLocationId,
}: {
  trigger?: React.ReactNode;
  defaultLocationId?: string;
}) {
  const { t } = useTranslation("inventory");
  const { currentLocation } = useLocationStore();
  const [open, setOpen] = useState(false);

  const { stockAdjustmentSchema, StockAdjustmentFormValues } = useMemo(() => {
    const schema = z.object({
      type: z.enum(["IN", "OUT", "ADJUST", "RETURN"]),
      locationId: z.string().uuid({
        message:
          t("dialogs.stockAdjustment.errorInvalidLocation") ||
          "Invalid location ID",
      }),
      productId: z
        .string()
        .min(1, { message: t("dialogs.stockAdjustment.errorSelectProduct") }),
      variantId: z.string().optional(),
      quantity: z.coerce.number().min(1, {
        message:
          t("dialogs.stockAdjustment.errorInvalidQuantity") ||
          "Quantity must be at least 1",
      }),
      reason: z
        .string()
        .min(1, { message: t("dialogs.stockAdjustment.errorProvideReason") }),
    });
    type FormValues = z.infer<typeof schema>;
    return {
      stockAdjustmentSchema: schema,
      StockAdjustmentFormValues: {} as FormValues,
    };
  }, [t]);

  const adjustStock = useAdjustStock();
  const { data: productsData } = useProducts({ page: 1, limit: 100 });
  const { data: locations } = useLocations();

  const products = productsData?.data || [];

  const form = useForm<typeof StockAdjustmentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stockAdjustmentSchema) as any,
    defaultValues: {
      type: "ADJUST",
      locationId: defaultLocationId || currentLocation?.id || "",
      productId: "",
      variantId: "none",
      quantity: 1,
      reason: "",
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
  const productId = watch("productId");

  const selectedProduct = products.find((p) => p.id === productId);
  const variants = selectedProduct?.variants || [];

  useEffect(() => {
    if (open) {
      reset({
        type: "ADJUST",
        locationId: defaultLocationId || currentLocation?.id || "",
        productId: "",
        variantId: "none",
        quantity: 1,
        reason: "",
      });
    }
  }, [open, currentLocation, defaultLocationId, reset]);

  const onSubmit = async (data: typeof StockAdjustmentFormValues) => {
    try {
      await adjustStock.mutateAsync({
        productId: data.productId,
        variantId: data.variantId !== "none" ? data.variantId : undefined,
        locationId: data.locationId,
        quantity: data.quantity,
        reason: data.reason,
        type: data.type as "IN" | "OUT" | "ADJUST",
      });
      toast.success(t("dialogs.stockAdjustment.successMessage"));
      setOpen(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to adjust stock"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <PrimaryActionButton>
            {t("dialogs.stockAdjustment.buttonText")}
          </PrimaryActionButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("dialogs.stockAdjustment.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.stockAdjustment.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Type Field */}
          <div className="space-y-2">
            <Label className={cn(errors.type && "text-destructive")}>
              {t("dialogs.stockAdjustment.type")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.type && "border-destructive",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">
                      {t("dialogs.stockAdjustment.typeStockIn")}
                    </SelectItem>
                    <SelectItem value="OUT">
                      {t("dialogs.stockAdjustment.typeStockOut")}
                    </SelectItem>
                    <SelectItem value="ADJUST">
                      {t("dialogs.stockAdjustment.typeCorrection")}
                    </SelectItem>
                    <SelectItem value="RETURN">
                      {t("dialogs.stockAdjustment.typeReturn")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-destructive typo-regular-14">{errors.type.message}</p>
            )}
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <Label className={cn(errors.locationId && "text-destructive")}>
              {t("dialogs.stockAdjustment.location")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="locationId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.locationId && "border-destructive",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(locations || []).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.locationId && (
              <p className="text-destructive typo-regular-14">
                {errors.locationId.message}
              </p>
            )}
          </div>

          {/* Product Field */}
          <div className="space-y-2">
            <Label className={cn(errors.productId && "text-destructive")}>
              {t("dialogs.stockAdjustment.product")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="productId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("variantId", "none");
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.productId && "border-destructive",
                    )}
                  >
                    <SelectValue
                      placeholder={t("dialogs.stockAdjustment.selectProduct")}
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
              )}
            />
            {errors.productId && (
              <p className="text-destructive typo-regular-14">
                {errors.productId.message}
              </p>
            )}
          </div>

          {/* Variant Field */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <Label>{t("dialogs.stockAdjustment.variant")}</Label>
              <Controller
                control={control}
                name="variantId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("dialogs.stockAdjustment.selectVariant")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t("dialogs.stockAdjustment.noVariant")}
                      </SelectItem>
                      {variants.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} ({v.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Quantity Field */}
          <div className="space-y-2">
            <Label className={cn(errors.quantity && "text-destructive")}>
              {t("dialogs.stockAdjustment.quantity")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-10 w-10"
                    onClick={() =>
                      field.onChange(Math.max(1, Number(field.value) - 1))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    {...field}
                    type="number"
                    className={cn(
                      "h-10 text-center",
                      errors.quantity && "border-destructive",
                    )}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-10 w-10"
                    onClick={() => field.onChange(Number(field.value) + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
            {errors.quantity && (
              <p className="text-destructive typo-regular-14">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label className={cn(errors.reason && "text-destructive")}>
              {t("dialogs.stockAdjustment.reason")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("reason")}
              placeholder={t("dialogs.stockAdjustment.reasonPlaceholder")}
              className={cn("w-full", errors.reason && "border-destructive")}
            />
            {errors.reason && (
              <p className="text-destructive typo-regular-14">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <PrimaryActionButton type="submit">
              {t("dialogs.stockAdjustment.recordTransaction")}
            </PrimaryActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

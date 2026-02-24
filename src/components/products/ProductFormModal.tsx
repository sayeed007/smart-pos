"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Product, Category, Variant, UserRole } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CopyPlus, Wand2, Upload } from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { useTranslation } from "react-i18next";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { ServerImage } from "@/components/ui/server-image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useAuth } from "@/providers/auth-provider";
import { useLocationStore } from "@/features/locations/store";
import { useLocations } from "@/hooks/api/locations";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { useCreateCategory } from "@/hooks/api/categories";

export interface ProductFormData {
  id?: string;
  name: string;
  categoryId: string;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  stockQuantity: number;
  minStockLevel?: number;
  status: "active" | "inactive";
  image?: string | File;
  type: "simple" | "variable";
  variants: Variant[];
  uom: string;
  allowDecimals: boolean;
  barcodes: string; // specific for form handling (string vs array)
  locationId?: string;
}

export interface ProductSubmissionData extends Omit<
  ProductFormData,
  "barcodes"
> {
  barcodes: string[];
}

const defaultFormData: ProductFormData = {
  name: "",
  categoryId: "",
  sku: "",
  barcode: "",
  costPrice: 0,
  sellingPrice: 0,
  taxRate: 0,
  stockQuantity: 0,
  minStockLevel: 10,
  status: "active",
  type: "simple",
  variants: [],
  uom: "pcs",
  allowDecimals: false,
  barcodes: "",
  locationId: "",
};

const numberField = (label: string) =>
  z
    .number({ message: `${label} is required` })
    .refine((value) => !Number.isNaN(value), {
      message: `${label} is required`,
    })
    .min(0, { message: `${label} must be at least 0` });

const productSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    categoryId: z.string().min(1, { message: "Category is required" }),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    costPrice: numberField("Cost price"),
    sellingPrice: numberField("Selling price"),
    taxRate: z.number().optional(),
    stockQuantity: numberField("Stock quantity"),
    minStockLevel: z.number().optional(),
    status: z.enum(["active", "inactive"]),
    image: z.any().optional(),
    type: z.enum(["simple", "variable"]),
    variants: z.array(z.any()),
    uom: z.string().optional(),
    allowDecimals: z.boolean(),
    barcodes: z.string().optional(),
    locationId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "simple" && (!data.sku || data.sku.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sku"],
        message: "SKU is required",
      });
    }
    if (
      data.type === "simple" &&
      (!data.sellingPrice || data.sellingPrice <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sellingPrice"],
        message: "Selling price is required for simple products",
      });
    }
    if (
      data.type === "variable" &&
      (!data.variants || data.variants.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["variants"],
        message: "At least one variant is required for variable products",
      });
    }
    if (data.type === "variable" && Array.isArray(data.variants)) {
      const missingBarcode = data.variants.find(
        (variant: any) =>
          !variant?.barcode || variant.barcode.trim().length === 0,
      );
      if (missingBarcode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Variant barcode is required for all variants",
        });
      }
    }
  });

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit: Product | null;
  categories: Category[];
  onSave: (data: ProductSubmissionData) => Promise<void>;
}

export function ProductFormModal({
  open,
  onOpenChange,
  productToEdit,
  categories,
  onSave,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [createdCategory, setCreatedCategory] = useState<Category | null>(null);
  const { t } = useTranslation("products");
  const { user } = useAuth();
  const { currentLocation } = useLocationStore();
  const { data: locations = [] } = useLocations();
  const createCategory = useCreateCategory();
  const wasOpenRef = useRef(false);
  const lastProductIdRef = useRef<string | null>(null);

  const roleName =
    typeof user?.role === "object" ? user?.role?.name : user?.role;
  const normalizedRole = roleName?.toLowerCase();
  const canChooseLocation =
    normalizedRole === UserRole.ADMIN.toLowerCase() ||
    normalizedRole === UserRole.MANAGER.toLowerCase();

  const resolvedLocationId = useMemo(() => {
    const currentId = currentLocation?.id;
    const hasValidCurrent =
      !!currentId &&
      currentId !== "default" &&
      locations.some((loc) => loc.id === currentId);

    if (hasValidCurrent) return currentId;
    if (currentId && currentId !== "default" && locations.length === 0) {
      return currentId;
    }
    return (
      locations[0]?.id ??
      (currentId && currentId !== "default" ? currentId : "")
    );
  }, [currentLocation, locations]);

  const locationOptions = useMemo(() => {
    const list = [...locations];
    if (
      currentLocation &&
      currentLocation.id !== "default" &&
      !list.some((loc) => loc.id === currentLocation.id)
    ) {
      list.unshift(currentLocation);
    }
    return list;
  }, [locations, currentLocation]);

  const sortedCategories = useMemo(() => {
    const list = [...categories];
    if (createdCategory && !list.some((c) => c.id === createdCategory.id)) {
      list.push(createdCategory);
    }
    return list.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [categories, createdCategory]);

  const initialCategoryId = useMemo(
    () => sortedCategories[0]?.id ?? "",
    [sortedCategories],
  );

  // Variant temporary state
  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    name: "",
    sku: "",
    price: 0,
    costPrice: 0,
    barcode: "",
    stockQuantity: 0,
  });

  const generateBarcodeValue = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${timestamp}${random}`;
  };

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      lastProductIdRef.current = null;
      return;
    }
    const currentProductId = productToEdit?.id ?? null;
    const isNewOpen = !wasOpenRef.current;
    const productChanged = currentProductId !== lastProductIdRef.current;
    if (!isNewOpen && !productChanged) return;

    wasOpenRef.current = true;
    lastProductIdRef.current = currentProductId;
    setFieldErrors({});
    if (productToEdit) {
      setFormData({
        id: productToEdit.id,
        name: productToEdit.name,
        categoryId: productToEdit.categoryId,
        sku: productToEdit.sku,
        barcode: productToEdit.barcode || "",
        costPrice: productToEdit.costPrice || 0,
        sellingPrice: productToEdit.sellingPrice,
        taxRate: productToEdit.taxRate || 0,
        stockQuantity: productToEdit.stockQuantity,
        minStockLevel: productToEdit.minStockLevel ?? 10,
        status: (productToEdit.status as "active" | "inactive") || "active",
        image: productToEdit.image,
        type: productToEdit.type || "simple",
        variants: productToEdit.variants || [],
        uom: productToEdit.uom || "pcs",
        allowDecimals: productToEdit.allowDecimals || false,
        barcodes: productToEdit.barcodes?.join("\n") || "",
        locationId: "",
      });
    } else {
      setFormData({
        ...defaultFormData,
        categoryId: initialCategoryId,
        locationId: resolvedLocationId,
      });
    }
  }, [open, productToEdit, initialCategoryId, resolvedLocationId]);

  useEffect(() => {
    if (!open || productToEdit) return;
    setFormData((prev) => {
      if (prev.locationId && prev.locationId !== "default") return prev;
      const resolved = resolvedLocationId;
      if (!resolved || resolved === prev.locationId) return prev;
      return { ...prev, locationId: resolved };
    });
  }, [open, productToEdit, resolvedLocationId]);

  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      if (!categoryData.name) {
        throw new Error("Category name is required");
      }
      const created = await createCategory.mutateAsync({
        name: categoryData.name,
        icon: categoryData.icon,
      });
      setCreatedCategory(created);
      setFormData((prev) => ({ ...prev, categoryId: created.id }));
      toast.success("Category created");
    } catch (error) {
      console.error("Failed to create category", error);
      toast.error(getErrorMessage(error, "Failed to create category"));
    } finally {
      setIsCategoryModalOpen(false);
    }
  };

  const handleSave = async () => {
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setFieldErrors(errors);
      toast.error(
        validation.error.issues[0]?.message || "Please fix the errors",
      );
      return;
    }

    setFieldErrors({});

    setIsSaving(true);
    try {
      const fallbackSku =
        formData.type === "variable"
          ? formData.variants[0]?.sku?.trim() || ""
          : "";
      const normalizedVariants = formData.variants.map((variant) => ({
        ...variant,
        barcode: variant.barcode?.trim() || variant.barcodes?.[0]?.trim() || "",
      }));
      const submissionData = {
        ...formData,
        sku: formData.sku?.trim() || fallbackSku,
        variants: normalizedVariants,
        barcodes: formData.barcodes.split("\n").filter((b) => b.trim() !== ""),
      };
      await onSave(submissionData);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(getErrorMessage(error, "Failed to save product"));
    } finally {
      setIsSaving(false);
    }
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.sku || !newVariant.barcode) {
      toast.error("Variant Name, SKU and Barcode are required");
      return;
    }
    const variant: Variant = {
      id: Math.random().toString(36).substr(2, 9), // Temp ID
      productId: formData.id || "",
      name: newVariant.name,
      sku: newVariant.sku,
      price: newVariant.price || 0,
      costPrice: newVariant.costPrice || 0,
      barcode: newVariant.barcode,
      stockQuantity: newVariant.stockQuantity || 0,
      attributes: {},
    };

    setFormData({
      ...formData,
      variants: [...formData.variants, variant],
    });
    setNewVariant({
      name: "",
      sku: "",
      price: 0,
      costPrice: 0,
      barcode: "",
      stockQuantity: 0,
    });
  };

  const removeVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((v) => v.id !== id),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="typo-bold-18">
              {productToEdit ? t("title.edit") : t("title.add")}
            </DialogTitle>
            <DialogDescription className="typo-regular-14">
              {productToEdit ? t("description.edit") : t("description.add")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Main Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="typo-semibold-14">
                  {t("fields.name")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("fields.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {fieldErrors.name?.[0] && (
                  <p className="text-red-500 typo-regular-12">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="typo-semibold-14">
                  {t("fields.category")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) => {
                    if (val === "__create__") {
                      setIsCategoryModalOpen(true);
                      return;
                    }
                    setFormData({ ...formData, categoryId: val });
                  }}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue
                      placeholder={t("fields.categoryPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedCategories.length === 0 && (
                      <SelectItem value="no-categories" disabled>
                        No categories found
                      </SelectItem>
                    )}
                    {sortedCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <SelectItem value="__create__">
                      + Create new category
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.categoryId?.[0] && (
                  <p className="text-red-500 typo-regular-12">
                    {fieldErrors.categoryId[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="typo-semibold-14">Product Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(val: "simple" | "variable") =>
                  setFormData({ ...formData, type: val })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple">Simple Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="variable" id="variable" />
                  <Label htmlFor="variable">
                    Variable Product (with Variants)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Simple Product Fields */}
            {formData.type === "simple" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="typo-semibold-14">
                      {t("fields.sku")}{" "}
                      {formData.type === "simple" && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Input
                      id="sku"
                      placeholder={t("fields.skuPlaceholder")}
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                    />
                    {fieldErrors.sku?.[0] && (
                      <p className="text-red-500 typo-regular-12">
                        {fieldErrors.sku[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode" className="typo-semibold-14">
                      {t("fields.barcode")}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        placeholder={t("fields.barcodePlaceholder")}
                        value={formData.barcode}
                        onChange={(e) =>
                          setFormData({ ...formData, barcode: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="px-3"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            barcode: generateBarcodeValue(),
                          })
                        }
                        title="Generate barcode"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice" className="typo-semibold-14">
                      {t("fields.costPrice")}
                    </Label>
                    <Input
                      id="costPrice"
                      type="number"
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          costPrice: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice" className="typo-semibold-14">
                      {t("fields.sellingPrice")}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="0.00"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellingPrice: parseFloat(e.target.value),
                        })
                      }
                    />
                    {fieldErrors.sellingPrice?.[0] && (
                      <p className="text-red-500 typo-regular-12">
                        {fieldErrors.sellingPrice[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock" className="typo-semibold-14">
                      {t("fields.stockQuantity")}
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stockQuantity: parseFloat(e.target.value),
                        })
                      }
                      disabled={!!productToEdit}
                    />
                  </div>
                </div>
              </>
            )}

            {/* UOM and Barcodes (Common) */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Unit of Measure</Label>
                <Select
                  value={formData.uom}
                  onValueChange={(v) => setFormData({ ...formData, uom: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="m">Meters (m)</SelectItem>
                    <SelectItem value="l">Liters (l)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="decimals"
                    checked={formData.allowDecimals}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        allowDecimals: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="decimals">Allow Decimal Quantities</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Barcodes (One per line)</Label>
              <Textarea
                value={formData.barcodes}
                onChange={(e) =>
                  setFormData({ ...formData, barcodes: e.target.value })
                }
                placeholder="e.g. STORE-123&#10;MFR-456"
                className="typo-regular-14"
              />
            </div>

            {/* Variable Product Fields */}
            {formData.type === "variable" && (
              <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                <h3 className="typo-semibold-14">Variants</h3>

                {/* Add Variant Inline Form */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-1 space-y-1">
                    <Label className="typo-regular-12">
                      Variant (e.g. Red/L){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newVariant.name}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, name: e.target.value })
                      }
                      className="h-8 typo-regular-12"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="typo-regular-12">
                      SKU <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newVariant.sku}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, sku: e.target.value })
                      }
                      className="h-8 typo-regular-12"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="typo-regular-12">
                      Barcode <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={newVariant.barcode}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            barcode: e.target.value,
                          })
                        }
                        className="h-8 typo-regular-12"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2"
                        onClick={() =>
                          setNewVariant({
                            ...newVariant,
                            barcode: generateBarcodeValue(),
                          })
                        }
                        title="Generate barcode"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 items-end">
                  <div className="col-span-1 space-y-1">
                    <Label className="typo-regular-12">Cost</Label>
                    <Input
                      type="number"
                      value={newVariant.costPrice}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          costPrice: parseFloat(e.target.value),
                        })
                      }
                      className="h-8 typo-regular-12"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="typo-regular-12">Price</Label>
                    <Input
                      type="number"
                      value={newVariant.price}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="h-8 typo-regular-12"
                    />
                  </div>
                  <div className="col-span-1 space-y-1">
                    <Label className="typo-regular-12">Stock</Label>
                    <Input
                      type="number"
                      value={newVariant.stockQuantity}
                      onChange={(e) =>
                        setNewVariant({
                          ...newVariant,
                          stockQuantity: parseFloat(e.target.value),
                        })
                      }
                      className="h-8 typo-regular-12"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      onClick={addVariant}
                      size="sm"
                      className="w-full h-8 bg-primary"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Variants List */}
                <div className="space-y-2">
                  {formData.variants.length === 0 && (
                    <p className="text-muted-foreground italic typo-regular-12">
                      No variants added.
                    </p>
                  )}
                  {fieldErrors.variants?.[0] && (
                    <p className="text-red-500 typo-regular-12">
                      {fieldErrors.variants[0]}
                    </p>
                  )}
                  {formData.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-2 bg-card border rounded typo-regular-14"
                    >
                      <div className="grid grid-cols-6 gap-4 flex-1">
                        <span className="truncate typo-medium-14">
                          {variant.name}
                        </span>
                        <span className="text-muted-foreground truncate">
                          {variant.sku}
                        </span>
                        <span className="text-muted-foreground truncate">
                          {variant.barcode || "—"}
                        </span>
                        <span>${variant.price}</span>
                        <span className="text-muted-foreground">
                          Cost: ${variant.costPrice ?? 0}
                        </span>
                        <span>Qty: {variant.stockQuantity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() =>
                            setNewVariant({
                              name: `${variant.name} Copy`,
                              sku: "",
                              price: variant.price,
                              costPrice: variant.costPrice || 0,
                              barcode: variant.barcode || "",
                              stockQuantity: variant.stockQuantity || 0,
                            })
                          }
                        >
                          <CopyPlus className="w-3 h-3" />
                        </Button>
                        <DeleteButton
                          size="sm"
                          onClick={() => removeVariant(variant.id)}
                          label="Remove variant"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStockLevel" className="typo-semibold-14">
                  Min Stock Level
                </Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  placeholder="0"
                  value={formData.minStockLevel ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minStockLevel:
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="typo-semibold-14">
                  {t("fields.status")}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: "active" | "inactive") =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("fields.active")}</SelectItem>
                    <SelectItem value="inactive">
                      {t("fields.inactive")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location (only on create) */}
            {!productToEdit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="typo-semibold-14">Location</Label>
                  {canChooseLocation ? (
                    <Select
                      value={formData.locationId}
                      onValueChange={(val) =>
                        setFormData({ ...formData, locationId: val })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.length === 0 && (
                          <SelectItem value="no-locations" disabled>
                            No locations available
                          </SelectItem>
                        )}
                        {locationOptions.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={
                        locationOptions.find(
                          (loc) => loc.id === formData.locationId,
                        )?.name ||
                        currentLocation?.name ||
                        ""
                      }
                      disabled
                    />
                  )}
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="typo-semibold-14">Product Image</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                  formData.image
                    ? "border-chart-1 bg-chart-1/5"
                    : "border-border hover:bg-muted/30 hover:border-chart-1/50"
                }`}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setFormData({
                        ...formData,
                        image: file,
                      });
                    }
                  };
                  input.click();
                }}
              >
                {formData.image ? (
                  <div className="relative w-full">
                    <ServerImage
                      src={
                        formData.image instanceof File
                          ? URL.createObjectURL(formData.image)
                          : (formData.image as string)
                      }
                      alt="Product preview"
                      width={400}
                      height={192}
                      className="max-h-48 mx-auto rounded-lg object-cover"
                      unoptimized
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, image: undefined });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="typo-semibold-14 text-foreground">
                      {t("fields.imageDrag", "Click to upload image")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="typo-semibold-14"
            >
              {t("actions.cancel")}
            </Button>
            <PrimaryActionButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("actions.saving") : t("actions.save")}
            </PrimaryActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CategoryFormModal
        key={isCategoryModalOpen ? "new-category" : "closed"}
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        categoryToEdit={null}
        onSave={handleCreateCategory}
      />
    </>
  );
}

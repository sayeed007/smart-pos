"use client";

import { useState, useEffect } from "react";
import { Product, Category, Variant } from "@/types";
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
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ServerImage } from "@/components/ui/server-image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

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
}

export interface ProductSubmissionData extends Omit<
  ProductFormData,
  "barcodes"
> {
  barcodes: string[];
}

const defaultFormData: ProductFormData = {
  name: "Men's Premium Performance T-shirt – Offline",
  categoryId: "87465a08-7e41-43d6-b5e5-ad9a48033e6e",
  sku: "73431",
  barcode: "73431",
  costPrice: 550,
  sellingPrice: 900,
  taxRate: 0,
  stockQuantity: 20,
  minStockLevel: 10,
  status: "active",
  type: "simple",
  variants: [],
  uom: "pcs",
  allowDecimals: false,
  barcodes: "",
};

// const defaultFormData: ProductFormData = {
//   name: "",
//   categoryId: "",
//   sku: "",
//   barcode: "",
//   costPrice: 0,
//   sellingPrice: 0,
//   taxRate: 0,
//   stockQuantity: 0,
//   minStockLevel: 10,
//   status: "active",
//   type: "simple",
//   variants: [],
//   uom: "pcs",
//   allowDecimals: false,
//   barcodes: "",
// };

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
  const { t } = useTranslation("products");

  // Variant temporary state
  const [newVariant, setNewVariant] = useState<Partial<Variant>>({
    name: "",
    sku: "",
    price: 0,
    stockQuantity: 0,
  });

  useEffect(() => {
    if (open) {
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
          minStockLevel: productToEdit.minStockLevel || 10,
          status: (productToEdit.status as "active" | "inactive") || "active",
          image: productToEdit.image,
          type: productToEdit.type || "simple",
          variants: productToEdit.variants || [],
          uom: productToEdit.uom || "pcs",
          allowDecimals: productToEdit.allowDecimals || false,
          barcodes: productToEdit.barcodes?.join("\n") || "",
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, productToEdit]);

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.categoryId || !formData.sku) {
      toast.error(
        t("validation.required", "Name, Category and SKU are required"),
      );
      return;
    }

    if (formData.type === "simple" && !formData.sellingPrice) {
      toast.error(
        t(
          "validation.priceRequired",
          "Selling price is required for simple products",
        ),
      );
      return;
    }

    if (formData.type === "variable" && formData.variants.length === 0) {
      toast.error(
        t(
          "validation.variantsRequired",
          "At least one variant is required for variable products",
        ),
      );
      return;
    }

    setIsSaving(true);
    try {
      const submissionData = {
        ...formData,
        barcodes: formData.barcodes.split("\n").filter((b) => b.trim() !== ""),
      };
      await onSave(submissionData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.sku) {
      toast.error("Variant Name and SKU are required");
      return;
    }
    const variant: Variant = {
      id: Math.random().toString(36).substr(2, 9), // Temp ID
      productId: formData.id || "",
      name: newVariant.name,
      sku: newVariant.sku,
      price: newVariant.price || 0,
      stockQuantity: newVariant.stockQuantity || 0,
      attributes: {},
    };

    setFormData({
      ...formData,
      variants: [...formData.variants, variant],
    });
    setNewVariant({ name: "", sku: "", price: 0, stockQuantity: 0 });
  };

  const removeVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((v) => v.id !== id),
    });
  };

  return (
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
                {t("fields.name")} *
              </Label>
              <Input
                id="name"
                placeholder={t("fields.namePlaceholder")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="typo-semibold-14">
                {t("fields.category")} *
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) =>
                  setFormData({ ...formData, categoryId: val })
                }
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder={t("fields.categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    {t("fields.sku")} *
                  </Label>
                  <Input
                    id="sku"
                    placeholder={t("fields.skuPlaceholder")}
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="typo-semibold-14">
                    {t("fields.barcode")}
                  </Label>
                  <Input
                    id="barcode"
                    placeholder={t("fields.barcodePlaceholder")}
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                  />
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
                    {t("fields.sellingPrice")} *
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
              className="font-mono text-sm"
            />
          </div>

          {/* Variable Product Fields */}
          {formData.type === "variable" && (
            <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
              <h3 className="font-semibold text-sm">Variants</h3>

              {/* Add Variant Inline Form */}
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-1 space-y-1">
                  <Label className="text-xs">Variant Name (e.g. Red/L)</Label>
                  <Input
                    value={newVariant.name}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, name: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    value={newVariant.sku}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, sku: e.target.value })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    value={newVariant.price}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <Label className="text-xs">Stock</Label>
                  <Input
                    type="number"
                    value={newVariant.stockQuantity}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        stockQuantity: parseFloat(e.target.value),
                      })
                    }
                    className="h-8 text-xs"
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
                  <p className="text-muted-foreground text-xs italic">
                    No variants added.
                  </p>
                )}
                {formData.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-2 bg-card border rounded text-sm"
                  >
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <span className="font-medium truncate">
                        {variant.name}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {variant.sku}
                      </span>
                      <span>${variant.price}</span>
                      <span>Qty: {variant.stockQuantity}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
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
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className=" bg-chart-1 hover:bg-chart-1/90 text-primary-foreground typo-semibold-14"
          >
            {isSaving ? t("actions.saving") : t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

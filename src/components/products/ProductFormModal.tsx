"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/types";
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
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Image from "next/image";

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
  image?: string;
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
};

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit: Product | null;
  categories: Category[];
  onSave: (data: ProductFormData) => Promise<void>;
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
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, productToEdit]);

  const handleSave = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.categoryId ||
      !formData.sku ||
      !formData.sellingPrice
    ) {
      toast.error(t("validation.required"));
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      // Error handled by parent or toast here if needed
    } finally {
      setIsSaving(false);
    }
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
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("fields.categoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  {/* Custom Button for adding category */}
                  <div className="p-1 mt-1 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-primary font-medium hover:bg-primary/10 h-8"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info(t("actions.createCategoryComingSoon"));
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("fields.categoryCreate")}
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <Label htmlFor="tax" className="typo-semibold-14">
                {t("fields.tax")}
              </Label>
              <Input
                id="tax"
                type="number"
                placeholder="0"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: parseFloat(e.target.value),
                  })
                }
              />
            </div>
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lowStock" className="typo-semibold-14">
                {t("fields.lowStock")}
              </Label>
              <Input
                id="lowStock"
                type="number"
                placeholder="10"
                value={formData.minStockLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStockLevel: parseFloat(e.target.value),
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

          {/* Image Upload with Drag & Drop */}
          <div className="space-y-2">
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                formData.image
                  ? "border-chart-1 bg-chart-1/5"
                  : "border-border hover:bg-muted/30 hover:border-chart-1/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  "border-chart-1",
                  "bg-chart-1/10",
                );
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!formData.image) {
                  e.currentTarget.classList.remove(
                    "border-chart-1",
                    "bg-chart-1/10",
                  );
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-chart-1",
                  "bg-chart-1/10",
                );
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/")) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({
                      ...formData,
                      image: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                } else {
                  toast.error(
                    t(
                      "validation.invalidImageFormat",
                      "Please upload a valid image file",
                    ),
                  );
                }
              }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({
                        ...formData,
                        image: reader.result as string,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
            >
              {formData.image ? (
                <div className="relative w-full">
                  <Image
                    src={formData.image}
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
                    {t("fields.imageDrag", "Drag & drop your image here")}
                  </p>
                  <p className="typo-regular-12 text-muted-foreground mt-1">
                    {t("fields.imageClick", "or click to browse")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("fields.browse", "Browse Files")}
                  </Button>
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

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
      // Error handled by parent or toast here if needed
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {productToEdit ? t("title.edit") : t("title.add")}
          </DialogTitle>
          <DialogDescription>
            {productToEdit ? t("description.edit") : t("description.add")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.name")} *</Label>
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
              <Label htmlFor="category">{t("fields.category")} *</Label>
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
              <Label htmlFor="sku">{t("fields.sku")} *</Label>
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
              <Label htmlFor="barcode">{t("fields.barcode")}</Label>
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
              <Label htmlFor="costPrice">{t("fields.costPrice")}</Label>
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
              <Label htmlFor="sellingPrice">{t("fields.sellingPrice")} *</Label>
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
              <Label htmlFor="tax">{t("fields.tax")}</Label>
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
              <Label htmlFor="stock">{t("fields.stockQuantity")}</Label>
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
              <Label htmlFor="lowStock">{t("fields.lowStock")}</Label>
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
            <div className="space-y-2"></div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("fields.status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(val: "active" | "inactive") =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger id="status">
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

          {/* Image Upload Placeholder */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("fields.imageDrag")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("fields.imageClick")}
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              {t("fields.browse")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("actions.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-chart-1 hover:bg-chart-1/90 text-primary-foreground"
          >
            {isSaving ? t("actions.saving") : t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

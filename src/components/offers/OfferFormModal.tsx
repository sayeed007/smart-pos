"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { Category, Offer, Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface OfferFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerToEdit?: Offer | null;
  onSave: (offer: Partial<Offer>) => void;
}

export function OfferFormModal({
  open,
  onOpenChange,
  offerToEdit,
  onSave,
}: OfferFormModalProps) {
  const { t } = useTranslation(["offers", "common"]);
  const [productSearch, setProductSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState<Partial<Offer>>({
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    applicableOn: "all",
    productIds: [],
    categoryId: "",
    minPurchase: 0,
    maxDiscount: undefined,
    startDate: "",
    endDate: "",
    status: "active",
  });

  // Fetch Products & Categories
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
    enabled: open,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
    enabled: open,
  });

  // Reset form on open/edit
  useEffect(() => {
    if (open) {
      if (offerToEdit) {
        setFormData({
          ...offerToEdit,
          productIds: offerToEdit.productIds || [],
        });
      } else {
        setFormData({
          name: "",
          description: "",
          type: "percentage",
          value: 0,
          applicableOn: "all",
          productIds: [],
          categoryId: "",
          minPurchase: 0,
          maxDiscount: 0,
          startDate: "",
          endDate: "",
          status: "active",
        });
      }
      setProductSearch("");
    }
  }, [open, offerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...offerToEdit,
      ...formData,
      // Ensure specific types are respected
      value: Number(formData.value),
      minPurchase: Number(formData.minPurchase),
      maxDiscount: formData.maxDiscount
        ? Number(formData.maxDiscount)
        : undefined,
    });
    onOpenChange(false);
  };

  const toggleProduct = (productId: string) => {
    setFormData((prev) => {
      const currentIds = prev.productIds || [];
      if (currentIds.includes(productId)) {
        return {
          ...prev,
          productIds: currentIds.filter((id) => id !== productId),
        };
      } else {
        return { ...prev, productIds: [...currentIds, productId] };
      }
    });
  };

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const isLoading = productsLoading || categoriesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {offerToEdit ? t("modal.title") : t("createOffer")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Offer Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t("fields.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("placeholders.name")}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t("fields.description")} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("placeholders.description")}
                required
              />
            </div>

            {/* Type & Applicable On Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("fields.type")} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {t("types.percentage")}
                    </SelectItem>
                    <SelectItem value="fixed">{t("types.fixed")}</SelectItem>
                    <SelectItem value="buy_x_get_y">
                      {t("types.buy_x_get_y")}
                    </SelectItem>
                    <SelectItem value="bundle">{t("types.bundle")}</SelectItem>
                    <SelectItem value="category_discount">
                      {t("types.category_discount")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>{t("fields.applicableOn")} *</Label>
                <Select
                  value={formData.applicableOn}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, applicableOn: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("applicableOn.all")}</SelectItem>
                    <SelectItem value="category">
                      {t("applicableOn.category")}
                    </SelectItem>
                    <SelectItem value="product">
                      {t("applicableOn.product")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Value Fields */}
            {formData.type === "percentage" && (
              <div className="grid gap-2">
                <Label htmlFor="value">{t("fields.discountValue")} *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: Number(e.target.value) })
                  }
                  required
                />
              </div>
            )}

            {formData.type === "fixed" && (
              <div className="grid gap-2">
                <Label htmlFor="value">{t("fields.discountAmount")} *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: Number(e.target.value) })
                  }
                  required
                />
              </div>
            )}

            {/* Category Selection */}
            {formData.applicableOn === "category" && (
              <div className="grid gap-2">
                <Label>{t("fields.selectCategory")} *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, categoryId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("fields.selectCategory")} />
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
            )}

            {/* Product Selection */}
            {formData.applicableOn === "product" && (
              <div className="grid gap-2">
                <Label>{t("fields.selectProducts")} *</Label>
                <div className="border rounded-md p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("common:searchPlaceholder", "Search...")}
                      className="pl-8"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="grid gap-2 p-1">
                      {filteredProducts?.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
                        >
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={formData.productIds?.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <Label
                            htmlFor={`product-${product.id}`}
                            className="flex-1 cursor-pointer flex justify-between"
                          >
                            <span>{product.name}</span>
                            <span className="text-muted-foreground">
                              ${product.sellingPrice}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* Min Purchase & Max Discount Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minPurchase">{t("fields.minPurchase")}</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchase: Number(e.target.value),
                    })
                  }
                  placeholder={t("placeholders.minPurchase")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxDiscount">{t("fields.maxDiscount")}</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder={t("placeholders.maxDiscount")}
                />
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">{t("fields.startDate")} *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">{t("fields.endDate")} *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label>{t("fields.status")} *</Label>
              <Select
                value={formData.status}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, status: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive">
                    {t("status.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common:cancel")}
              </Button>
              <Button type="submit">{t("modal.title")}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

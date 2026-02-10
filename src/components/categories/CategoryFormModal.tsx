"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Category } from "@/types";

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSave: (category: Partial<Category>) => void;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSave,
}: CategoryFormModalProps) {
  const { t } = useTranslation(["categories", "common"]);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
  });

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name,
          icon: categoryToEdit.icon || "",
        });
      } else {
        setFormData({
          name: "",
          icon: "",
        });
      }
    }
  }, [open, categoryToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...categoryToEdit,
      name: formData.name,
      icon: formData.icon,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit
              ? t("editCategory", "Edit Category")
              : t("addCategory", "Add Category")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("fields.name", "Category Name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t("placeholders.name", "e.g. Dresses")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="icon">{t("fields.icon", "Icon")}</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder={t("placeholders.icon", "Icon Name")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common:cancel", "Cancel")}
            </Button>
            <Button type="submit">{t("common:save", "Save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

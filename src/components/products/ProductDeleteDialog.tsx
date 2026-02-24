"use client";

import { useState } from "react";
import { Product } from "@/types";
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
import { DeleteButton } from "@/components/ui/delete-button";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

interface ProductDeleteDialogProps {
  product: Product;
  onConfirm: (product: Product) => Promise<void> | void;
  trigger?: React.ReactNode;
}

export function ProductDeleteDialog({
  product,
  onConfirm,
  trigger,
}: ProductDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation("products");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(product);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error(
        getErrorMessage(
          error,
          t("toasts.deleteError", "Failed to delete product"),
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <DeleteButton onClick={() => {}} label="Delete product" />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title.delete")}</DialogTitle>
          <DialogDescription>
            <Trans
              i18nKey="description.delete"
              ns="products"
              values={{ name: product.name }}
              components={{
                1: <span className="text-foreground typo-bold-14" />,
              }}
            />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? t("actions.deleting") : t("actions.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

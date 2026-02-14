"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Offer } from "@/types";
import { OfferForm, OfferFormPayload } from "@/components/offers/OfferForm";
import { useProducts } from "@/hooks/api/products";
import { useCategories } from "@/hooks/api/categories";

interface OfferFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerToEdit?: Offer | null;
  onSave: (offer: Partial<Offer>) => Promise<void> | void;
}

export function OfferFormModal({
  open,
  onOpenChange,
  offerToEdit,
  onSave,
}: OfferFormModalProps) {
  const { t } = useTranslation(["offers", "common"]);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 1000,
  });
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const products = productsData?.data || [];
  const categories = categoriesData || [];
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
          <OfferForm
            key={offerToEdit?.id || "new"}
            initialValues={offerToEdit}
            products={products}
            categories={categories}
            onSubmit={async (values: OfferFormPayload) => {
              try {
                await onSave(values);
                onOpenChange(false);
              } catch (error) {
                console.error("Failed to save offer", error);
              }
            }}
            onCancel={() => onOpenChange(false)}
            submitLabel={offerToEdit ? t("common:save") : t("createOffer")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

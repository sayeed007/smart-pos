"use client";

import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

import { useTranslation } from "react-i18next";

interface CardDetailViewProps {
  total: number;
  onCheckout: (method: string) => void;
}

export function CardDetailView({ total, onCheckout }: CardDetailViewProps) {
  const { t } = useTranslation(["pos", "common"]);

  return (
    <div className="bg-card rounded-3xl p-6 shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-muted/30 border-b">
        <div className="flex items-center gap-2 typo-bold-18 text-foreground mb-1">
          <Receipt className="w-5 h-5 text-primary" />
          {t("checkout.payment", "Payment")}
        </div>
        <p className="typo-regular-14 text-muted-foreground">
          {t(
            "checkout.selectMethod",
            "Select a payment method to complete the sale.",
          )}
        </p>
      </div>
      {/* Total Due section - Re-adding based on original structure, as the provided snippet was incomplete for this part */}
      <div className="bg-muted p-4 rounded-xl mb-6 flex justify-between items-center">
        <span className="text-muted-foreground typo-bold-11 uppercase tracking-widest">
          {t("checkout.totalDue", "Total Due")}
        </span>
        <span className="typo-bold-18 text-foreground">
          ${total.toFixed(2)}
        </span>
      </div>
      <Button
        className="w-full py-5 rounded-xl bg-primary hover:bg-primary/90"
        onClick={() => onCheckout("Card")}
      >
        {t("checkout.processPayment", "Process Payment")}
      </Button>
    </div>
  );
}

"use client";

import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ProcessingView() {
  const { t } = useTranslation("pos");

  return (
    <div className="bg-card rounded-3xl p-8 shadow-2xl text-center">
      <div className="relative mx-auto w-20 h-20 mb-6">
        <div className="w-20 h-20 border-8 border-muted border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center text-primary">
          <CreditCard size={20} />
        </div>
      </div>
      <h2 className="text-foreground typo-regular-18 typo-bold-14">
        {t("checkout.processing", "Processing...")}
      </h2>
    </div>
  );
}

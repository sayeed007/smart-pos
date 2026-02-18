"use client";

import {
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle2,
  Receipt,
  Split,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/features/settings/store";
import { Button } from "@/components/ui/button";

export type CheckoutPaymentMethod = "card" | "cash" | "wallet" | "split";

interface CheckoutViewProps {
  totalAmount: number;
  onComplete: (method: CheckoutPaymentMethod) => void;
  onClose: () => void;
}

export function CheckoutView({
  totalAmount,
  onComplete,
  onClose,
}: CheckoutViewProps) {
  const { t } = useTranslation();
  const { currencySymbol } = useSettingsStore();

  const methods = [
    {
      id: "cash" as const,
      label: t("checkout.cash", "Cash"),
      icon: Banknote,
      description: t("checkout.payWithCash", "Pay with cash"),
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "card" as const,
      label: t("checkout.card", "Card"),
      icon: CreditCard,
      description: t("checkout.payWithCard", "Pay with card"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "wallet" as const,
      label: t("checkout.wallet", "Wallet"),
      icon: Wallet,
      description: t("checkout.payWithWallet", "Digital Wallet"),
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "split" as const,
      label: t("checkout.split", "Split Payment"),
      icon: Split,
      description: t(
        "checkout.payWithSplit",
        "Split payment across multiple methods",
      ),
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-muted/30 border-b">
        <div className="flex items-center gap-2 text-xl font-black text-gray-900 mb-1">
          <Receipt className="w-5 h-5 text-primary" />
          {t("checkout.payment", "Payment")}
        </div>
        <p className="text-sm text-muted-foreground">
          {t(
            "checkout.selectMethod",
            "Select a payment method to complete the sale.",
          )}
        </p>
        {/* Total */}
        <div className="mt-4 p-4 bg-background rounded-xl border flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            {t("checkout.totalToPay", "Total to Pay")}
          </span>
          <span className="text-3xl font-bold text-foreground mt-1">
            {currencySymbol}
            {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Method Buttons */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => onComplete(method.id)}
              className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
            >
              <div
                className={cn(
                  "p-3 rounded-lg shrink-0 transition-colors",
                  method.color,
                )}
              >
                <method.icon size={24} />
              </div>
              <div className="w-full">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {method.label}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-1 hidden sm:block">
                  {method.description}
                </p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                <CheckCircle2 size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <Button variant="outline" onClick={onClose} className="w-full">
          {t("common.cancel", "Cancel")}
        </Button>
      </div>
    </div>
  );
}

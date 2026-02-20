"use client";

import { CreditCard, Wallet, Smartphone, Split } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface PaymentMethodViewProps {
  onCheckout: (method: string) => void;
  onOpenSplit: () => void;
}

export function PaymentMethodView({
  onCheckout,
  onOpenSplit,
}: PaymentMethodViewProps) {
  const { t } = useTranslation("pos");

  const PAYMENT_METHODS = [
    { key: "Card", label: t("payment.card", "Card"), icon: CreditCard },
    { key: "Cash", label: t("payment.cash", "Cash"), icon: Wallet },
    {
      key: "Digital",
      label: t("payment.digital", "Digital"),
      icon: Smartphone,
    },
  ] as const;

  return (
    <div className="bg-card rounded-3xl p-6 shadow-2xl">
      <h3 className="text-xl font-black text-foreground tracking-tight mb-6 text-center">
        {t("payment.options", "Payment Options")}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="outline"
            onClick={() => onCheckout(key)}
            className="h-auto w-full flex flex-col items-center justify-center p-4 bg-muted/50 border border-transparent hover:border-primary hover:bg-primary/10 rounded-2xl transition-all gap-3 group"
          >
            <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary">
              <Icon size={24} />
            </div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-primary">
              {label}
            </span>
          </Button>
        ))}

        {/* Split Payment */}
        <Button
          variant="outline"
          onClick={onOpenSplit}
          className="h-auto w-full flex flex-col items-center justify-center p-4 bg-muted/50 border border-transparent hover:border-primary hover:bg-primary/10 rounded-2xl transition-all gap-3 group"
        >
          <div className="w-12 h-12 bg-card rounded-xl shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary">
            <Split size={24} />
          </div>
          <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-primary">
            {t("payment.split", "Split")}
          </span>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Sale } from "@/types";

import { MOCK_PAYMENT_STATS } from "@/lib/mock-data";

interface PaymentMethodsProps {
  sales: Sale[];
}

export function PaymentMethods({ sales }: PaymentMethodsProps) {
  const { t } = useTranslation("dashboard");

  // Aggregate actual sales or use dummy data
  const paymentStats = useMemo(() => {
    if (sales && sales.length > 5) {
      const stats = {
        Cash: 0,
        Card: 0,
        Digital: 0,
      };

      sales.forEach((sale) => {
        if (sale.paymentMethod === "Cash") stats.Cash += sale.total;
        else if (sale.paymentMethod === "Card") stats.Card += sale.total;
        else if (sale.paymentMethod === "Digital") stats.Digital += sale.total;
      });

      return [
        { name: "Cash Payments", value: stats.Cash },
        { name: "Card Payments", value: stats.Card },
        { name: "Digital Wallet", value: stats.Digital },
      ];
    }

    // Dummy data matching reference image
    return MOCK_PAYMENT_STATS;
  }, [sales]);

  return (
    <Card className="col-span-1 bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-4">
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.paymentMethods", "Payment Methods")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentStats.map((method, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <span className="typo-medium-14 text-foreground">
              {t(method.name.toLowerCase().replace(" ", "."), method.name)}
            </span>
            <span className="typo-bold-16 text-foreground">
              $
              {method.value.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

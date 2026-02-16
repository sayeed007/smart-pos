"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface PaymentMethodStats {
  method: string;
  count: number;
  total: number;
}

interface PaymentMethodsProps {
  data?: PaymentMethodStats[];
}

export function PaymentMethods({ data }: PaymentMethodsProps) {
  const { t } = useTranslation("dashboard");

  // Aggregate actual sales or use dummy data
  const paymentStats = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((method) => ({
        name: method.method, // Assuming backend returns localized or key
        value: method.total,
      }));
    }

    return [];
  }, [data]);

  return (
    <Card className="col-span-1 bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden h-full">
      <CardHeader>
        <CardTitle className="typo-bold-18 text-foreground">
          {t("charts.paymentMethods", "Payment Methods")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentStats.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={t("charts.noPaymentData", "No payment data available")}
          />
        ) : (
          paymentStats.map((method, index) => (
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
          ))
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types";
import { useMemo } from "react";

interface PaymentMethodsListProps {
  sales: Sale[] | undefined;
}

export function PaymentMethodsList({ sales }: PaymentMethodsListProps) {
  const paymentMethods = useMemo(() => {
    if (!sales) return [];

    const paymentMap = new Map<string, number>();

    sales.forEach((sale) => {
      // Payment Methods
      const method = sale.paymentMethod || "Other";
      paymentMap.set(method, (paymentMap.get(method) || 0) + sale.total);
    });

    return Array.from(paymentMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sales]);

  return (
    <Card className="border-0 shadow-sm rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Methods Breakdown</CardTitle>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
            >
              <span className="font-medium">{method.name} Payments</span>
              <span className="font-bold text-lg">
                $
                {method.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
          {paymentMethods.length === 0 && (
            <p className="text-center text-muted-foreground p-8">
              No payment data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

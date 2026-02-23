"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface PaymentMethodStat {
  method: string;
  count: number;
  total: number;
}

interface PaymentMethodsListProps {
  data?: PaymentMethodStat[];
}

export function PaymentMethodsList({ data }: PaymentMethodsListProps) {
  const paymentMethods = useMemo(() => {
    if (!data) return [];
    return data.map((method) => ({
      name: method.method,
      value: method.total,
    }));
  }, [data]);

  const formatMethod = (value: string) =>
    value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

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
              <span className="typo-medium-14">
                {formatMethod(method.name)} Payments
              </span>
              <span className="typo-bold-18">
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";

export interface SplitPaymentEntry {
  method: string;
  amount: number;
}

interface SplitPaymentViewProps {
  total: number;
  onCheckout: (method: string, payments: SplitPaymentEntry[]) => void;
  onBack: () => void;
}

const SPLIT_METHODS = ["cash", "card", "digital", "voucher"] as const;

export function SplitPaymentView({
  total,
  onCheckout,
  onBack,
}: SplitPaymentViewProps) {
  const { t } = useTranslation(["pos", "common"]);
  const [payments, setPayments] = useState<SplitPaymentEntry[]>([]);
  const [amountInput, setAmountInput] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingDue = Math.max(0, total - totalPaid);

  const handleAddPayment = () => {
    const val = parseFloat(amountInput);
    if (val > 0) {
      setPayments((prev) => [...prev, { method: selectedMethod, amount: val }]);
      setAmountInput("");
    }
  };

  const handleRemovePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card rounded-3xl p-6 shadow-2xl min-w-100">
      <h3 className="text-xl font-black text-foreground tracking-tight mb-4 text-center">
        {t("checkout.splitPayment", "Split Payment")}
      </h3>

      {/* Remaining Due */}
      <div className="bg-muted p-4 rounded-xl mb-4 flex justify-between items-center">
        <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
          {t("checkout.remainingDue", "Remaining Due")}
        </span>
        <span
          className={`text-2xl font-black ${
            remainingDue > 0 ? "text-red-500" : "text-green-500"
          }`}
        >
          ${remainingDue.toFixed(2)}
        </span>
      </div>

      {/* Add Payment Row */}
      {remainingDue > 0.01 && (
        <div className="flex gap-2 mb-4">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            {SPLIT_METHODS.map((m) => (
              <option key={m} value={m}>
                {t(`payment.${m}`, m.charAt(0).toUpperCase() + m.slice(1))}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder={t("common.amount", "Amount")}
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPayment()}
            className="flex-1"
          />
          <Button size="icon" onClick={handleAddPayment}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Payment List */}
      <div className="space-y-2 mb-6 max-h-50 overflow-y-auto">
        {payments.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs py-2">
            {t("checkout.noPaymentsAdded", "No payments added yet.")}
          </p>
        ) : (
          payments.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-2 border rounded-lg text-sm"
            >
              <div className="flex gap-2">
                <span className="font-bold">
                  {t(`payment.${p.method}`, p.method)}
                </span>
                <span>${p.amount.toFixed(2)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemovePayment(i)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          {t("common:back", "Back")}
        </Button>
        <PrimaryActionButton
          className="flex-1"
          disabled={remainingDue > 0.01}
          onClick={() => onCheckout("Split", payments)}
        >
          {t("cart.completeSale", "Complete Sale")}
        </PrimaryActionButton>
      </div>
    </div>
  );
}

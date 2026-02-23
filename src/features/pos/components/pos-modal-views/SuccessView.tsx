"use client";

import { CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptTemplate } from "@/features/pos/components/ReceiptTemplate";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Sale } from "@/types";
import { useTranslation } from "react-i18next";

interface SuccessViewProps {
  sale: Sale | null;
  onNewSale: () => void;
}

export function SuccessView({ sale, onNewSale }: SuccessViewProps) {
  const { t } = useTranslation(["pos", "common"]);

  return (
    <div className="bg-card rounded-3xl p-8 shadow-2xl text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-100 mb-6 mx-auto">
        <CheckCircle2 size={32} strokeWidth={3} />
      </div>
      <h2 className="text-foreground mb-1 typo-regular-24 typo-bold-14">
        {t("checkout.success", "Payment Successful!")}
      </h2>
      <p className="text-muted-foreground uppercase tracking-widest text-[10px] mb-2 typo-bold-14">
        {t("checkout.transactionCompleted", "Transaction completed")}
      </p>
      {sale?.invoiceNo && (
        <p className="text-primary mb-6 typo-bold-14">{sale.invoiceNo}</p>
      )}
      <div className="flex gap-2 mb-4">
        <PrimaryActionButton
          className="flex-1 py-5 rounded-xl typo-regular-14"
          onClick={onNewSale}
        >
          {t("common:newSale", "Start New Sale")}
        </PrimaryActionButton>
        <Button
          variant="outline"
          className="flex-none py-5 px-4 rounded-xl border-border bg-card typo-regular-14"
          onClick={() => window.print()}
          title={t("checkout.printReceipt", "Print Receipt")}
        >
          <Printer size={20} />
        </Button>
      </div>
      {/* Invisible Receipt Template for Print */}
      {sale && <ReceiptTemplate sale={sale} />}
    </div>
  );
}

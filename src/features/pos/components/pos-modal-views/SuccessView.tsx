"use client";

import { CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptTemplate } from "@/features/pos/components/ReceiptTemplate";
import { Sale } from "@/types";

interface SuccessViewProps {
  sale: Sale | null;
  onNewSale: () => void;
}

export function SuccessView({ sale, onNewSale }: SuccessViewProps) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-100 mb-6 mx-auto">
        <CheckCircle2 size={32} strokeWidth={3} />
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-1">
        Payment Successful!
      </h2>
      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">
        Transaction completed
      </p>
      {sale?.invoiceNo && (
        <p className="text-sm font-mono text-primary font-bold mb-6">
          {sale.invoiceNo}
        </p>
      )}

      <div className="flex gap-2 mb-4">
        <Button className="flex-1 py-5 rounded-xl text-sm" onClick={onNewSale}>
          Start New Sale
        </Button>
        <Button
          variant="outline"
          className="flex-none py-5 px-4 rounded-xl text-sm border-gray-200"
          onClick={() => window.print()}
          title="Print Receipt"
        >
          <Printer size={20} />
        </Button>
      </div>

      {/* Invisible Receipt Template for Print */}
      {sale && <ReceiptTemplate sale={sale} />}
    </div>
  );
}

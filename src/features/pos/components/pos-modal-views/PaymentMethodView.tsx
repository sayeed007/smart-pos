"use client";

import { CreditCard, Wallet, Smartphone, Split } from "lucide-react";

interface PaymentMethodViewProps {
  onCheckout: (method: string) => void;
  onOpenSplit: () => void;
}

const PAYMENT_METHODS = [
  { key: "Card", label: "Card", icon: CreditCard },
  { key: "Cash", label: "Cash", icon: Wallet },
  { key: "Digital", label: "Digital", icon: Smartphone },
] as const;

export function PaymentMethodView({
  onCheckout,
  onOpenSplit,
}: PaymentMethodViewProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 text-center">
        Payment Options
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onCheckout(key)}
            className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent hover:border-primary hover:bg-primary/10 rounded-2xl transition-all gap-3 group"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary">
              <Icon size={24} />
            </div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400 group-hover:text-primary">
              {label}
            </span>
          </button>
        ))}

        {/* Split Payment */}
        <button
          onClick={onOpenSplit}
          className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent hover:border-primary hover:bg-primary/10 rounded-2xl transition-all gap-3 group"
        >
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary">
            <Split size={24} />
          </div>
          <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400 group-hover:text-primary">
            Split
          </span>
        </button>
      </div>
    </div>
  );
}

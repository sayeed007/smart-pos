"use client";

import { Button } from "@/components/ui/button";

interface CardDetailViewProps {
  total: number;
  onCheckout: (method: string) => void;
}

export function CardDetailView({ total, onCheckout }: CardDetailViewProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 text-center">
        Card Payment
      </h3>
      <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center">
        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
          Total Due
        </span>
        <span className="text-2xl font-black text-gray-900">
          ${total.toFixed(2)}
        </span>
      </div>
      <Button
        className="w-full py-5 rounded-xl bg-primary hover:bg-primary/90"
        onClick={() => onCheckout("Card")}
      >
        Process Payment
      </Button>
    </div>
  );
}

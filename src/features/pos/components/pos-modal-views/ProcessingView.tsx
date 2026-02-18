"use client";

import { CreditCard } from "lucide-react";

export function ProcessingView() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
      <div className="relative mx-auto w-20 h-20 mb-6">
        <div className="w-20 h-20 border-8 border-gray-50 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center text-primary">
          <CreditCard size={20} />
        </div>
      </div>
      <h2 className="text-lg font-black text-gray-900">Processing...</h2>
    </div>
  );
}

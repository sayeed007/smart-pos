"use client";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { Offer } from "@/types";
import {
  ShoppingCart,
  TicketPercent,
  CreditCard,
  Banknote,
  Wallet,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CartItemCard } from "./CartItemCard";

interface CartPanelProps {
  offers: Offer[];
}

type PaymentMethod = "card" | "cash" | "wallet";

export function CartPanel({ offers }: CartPanelProps) {
  const { cart, updateQuantity, clearCart, setModal } = usePOSStore();
  const { t } = useTranslation("pos");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isOfferApplied, setIsOfferApplied] = useState(false); // Demo state

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );
  // Match reference logic (approx)
  const discount = isOfferApplied ? subtotal * 0.25 : 0;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  return (
    <div className="w-full lg:w-[320px] xl:w-96 shrink-0 bg-background flex flex-col shadow-xl border-l border-border h-screen sticky top-0 z-30">
      {/* Header Section */}
      <div className="p-4 pb-2 shrink-0 bg-background z-10">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h2 className="typo-bold-18 text-foreground">{t("cart.title")}</h2>

          {cart.length > 0 && (
            <Button
              variant="outline"
              className="h-9 typo-semibold-14! uppercase tracking-wide text-muted-foreground hover:text-destructive hover:border-destructive/30"
              onClick={clearCart}
            >
              {t("cart.clearCart")}
            </Button>
          )}
        </div>

        {/* Applied Offer Notification (Toast-like) */}
        {/* TODO: It is actually a toast - we need to use sonner toast */}
        {/* {isOfferApplied && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-3 flex items-start gap-2 animate-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-700 font-medium leading-relaxed">
              Offer &quot;25% Off All Dresses&quot; applied! Discount: $
              {discount.toFixed(2)}
            </p>
          </div>
        )} */}
      </div>

      {/* Scrollable Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-10 opacity-50">
            <ShoppingCart size={48} className="mb-4" />
            <p className="font-medium">{t("cart.empty")}</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemCard
              key={item.name}
              item={item}
              onUpdateQuantity={(delta) => updateQuantity(item.name, delta)}
              onRemove={() => updateQuantity(item.name, -item.quantity)}
            />
          ))
        )}
      </div>

      {/* Footer / Payment Section */}
      <div className="p-4 bg-background border-t border-border shrink-0 space-y-4">
        {/* Offers Section */}
        <div className="space-y-2">
          {isOfferApplied ? (
            <div className="bg-emerald-50/50 rounded-lg p-3 flex items-center justify-between border border-emerald-100">
              {/* TODO: Add offers based on selected offer */}
              {/* <div>
                <p className="text-xs font-bold text-emerald-800">
                  Applied Offers
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  25% Off All Dresses
                </p>
              </div>
              <button
                onClick={() => setIsOfferApplied(false)}
                className="text-emerald-400 hover:text-emerald-700"
              >
                <X size={14} />
              </button> */}
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full typo-semibold-14 text-[#00A63E] border-[#00A63E] hover:bg-[#00A63E] hover:text-white h-10 border-dashed"
              onClick={() => setIsOfferApplied(true)}
            >
              <TicketPercent size={16} className="mr-2" />
              {t("cart.applyOffers")} ({offers.length})
            </Button>
          )}
        </div>

        {/* Totals Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span className="typo-regular-14">{t("cart.subtotal")}</span>
            <span className="typo-semibold-14 text-foreground">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground items-center">
            <span className="typo-regular-14">{t("cart.discount")}</span>
            <span className="typo-semibold-14 text-foreground">
              {discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="typo-regular-14">{t("cart.tax")} (8%)</span>
            <span className="typo-semibold-14 text-foreground">
              ${tax.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-dashed border-border">
          <span className="typo-bold-18 text-foreground">
            {t("cart.total")}
          </span>
          <span className="typo-bold-18 text-chart-1">${total.toFixed(2)}</span>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={paymentMethod === "card" ? "default" : "outline"}
            className={cn(
              "h-10 typo-semibold-12 gap-2 border-border", // Added border-border for outline
              paymentMethod === "card"
                ? "bg-chart-1 hover:bg-chart-1/90 text-white border-transparent"
                : "text-foreground bg-transparent hover:bg-muted",
            )}
            onClick={() => setPaymentMethod("card")}
          >
            <CreditCard size={14} />
            {t("checkout.card")}
          </Button>
          <Button
            variant={paymentMethod === "cash" ? "default" : "outline"}
            className={cn(
              "h-10 typo-semibold-12 gap-2 border-border",
              paymentMethod === "cash"
                ? "bg-chart-1 hover:bg-chart-1/90 text-white border-transparent"
                : "text-foreground bg-transparent hover:bg-muted",
            )}
            onClick={() => setPaymentMethod("cash")}
          >
            <Banknote size={14} />
            {t("checkout.cash")}
          </Button>
          <Button
            variant={paymentMethod === "wallet" ? "default" : "outline"}
            className={cn(
              "h-10 typo-semibold-12 gap-2 px-1 border-border", // px-1 for tight space
              paymentMethod === "wallet"
                ? "bg-chart-1 hover:bg-chart-1/90 text-white border-transparent"
                : "text-foreground bg-transparent hover:bg-muted",
            )}
            onClick={() => setPaymentMethod("wallet")}
          >
            <Wallet size={14} />
            {t("checkout.wallet")}
          </Button>
        </div>

        {/* Complete Sale */}
        <Button
          size="lg"
          className="w-full typo-semibold-14 bg-chart-1 hover:bg-chart-1/90 text-white shadow-lg shadow-chart-1/20"
          onClick={() => setModal("processing")}
        >
          {t("cart.completeSale")}
        </Button>
      </div>
    </div>
  );
}

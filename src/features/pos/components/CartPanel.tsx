"use client";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { Offer } from "@/types";
import {
  ShoppingCart,
  TicketPercent,
  CreditCard,
  Banknote,
  Wallet,
  PauseCircle,
  ListRestart,
  User,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CartItemCard } from "./CartItemCard";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { calculateCartDiscounts } from "@/features/pos/utils/discount-engine";

interface CartPanelProps {
  offers: Offer[];
}

type PaymentMethod = "card" | "cash" | "wallet";

export function CartPanel({ offers }: CartPanelProps) {
  const {
    cart,
    updateQuantity,
    clearCart,
    setModal,
    customer,
    setCustomer,
    redeemedPoints,
    setRedeemedPoints,
  } = usePOSStore();
  const { t } = useTranslation("pos");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );

  // Calculate Auto-Discounts from Offers
  const { totalDiscount: offerDiscount, appliedOffers } = useMemo(
    () => calculateCartDiscounts(cart, offers),
    [cart, offers],
  );

  // Points Logic
  const redemptionRate = 100; // 100 pts = $1
  const pointsDiscount = redeemedPoints / redemptionRate;

  const discount = offerDiscount + pointsDiscount;

  const taxBase = Math.max(0, subtotal - discount);
  const tax = taxBase * 0.08;
  const total = taxBase + tax;

  const handleSuspend = async () => {
    if (cart.length === 0) return;
    try {
      const id = crypto.randomUUID();
      await db.suspendedSales.add({
        id,
        items: cart.map((c) => ({
          id: c.id,
          quantity: c.quantity,
          price: c.sellingPrice,
          name: c.name,
          taxRate: c.taxRate || 0,
          sku: c.sku,
        })),
        total,
        paymentMethod: "suspended",
        cashierId: "u1",
        status: "pending",
        createdAt: new Date().toISOString(),
        customerId: customer?.id,
        redeemedPoints,
      });
      clearCart();
      toast.success("Sale Suspended");
    } catch (e) {
      console.error(e);
      toast.error("Failed to suspend sale");
    }
  };

  // Helper to display tier
  const getTierDisplay = (tierId?: string) => {
    if (tierId === "tier-gold") return "Gold Member";
    if (tierId === "tier-silver") return "Silver Member";
    return "Bronze Member";
  };

  return (
    <div className="w-full lg:w-[320px] xl:w-96 shrink-0 bg-background flex flex-col shadow-xl border-l border-border h-screen sticky top-0 z-30">
      {/* Header Section */}
      <div className="p-4 pb-2 shrink-0 bg-background z-10">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
          <h2 className="typo-bold-18 text-foreground">{t("cart.title")}</h2>

          <div className="flex gap-2">
            {/* Suspended Sales List Trigger */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary"
              onClick={() => setModal("suspended-list")}
              title="View Suspended Sales"
            >
              <ListRestart size={16} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary"
              onClick={() => setModal("cash-management")}
              title="Manage Shift"
            >
              <Wallet size={16} />
            </Button>

            {cart.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200"
                  onClick={handleSuspend}
                  title="Suspend Current Sale"
                >
                  <PauseCircle size={16} />
                </Button>
                <Button
                  variant="outline"
                  className="h-9 typo-semibold-14! uppercase tracking-wide text-muted-foreground hover:text-destructive hover:border-destructive/30"
                  onClick={clearCart}
                >
                  {t("cart.clearCart")}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Customer Selection */}
        <div className="mb-4">
          {customer ? (
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20 transition-all animate-in fade-in slide-in-from-top-1">
              <div>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {customer.name}
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider font-bold">
                    {getTierDisplay(customer.tierId)}
                  </span>
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-medium text-amber-600 flex items-center gap-1">
                    <TicketPercent size={12} />
                    {customer.loyaltyPoints} pts
                  </span>
                  <span>•</span>
                  <span>{t("cart.rewardsAvailable", "Rewards Available")}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCustomer(null)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-between border-dashed hover:border-solid hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-muted-foreground"
              onClick={() => setModal("member")}
            >
              <span className="flex items-center gap-2">
                <User size={16} />
                {t("cart.selectCustomer", "Add Customer to Sale")}
              </span>
              <ChevronRight size={16} className="opacity-50" />
            </Button>
          )}
        </div>

        {/* Loyalty Redemption */}
        {customer && customer.loyaltyPoints >= 100 && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200/50 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-amber-100 rounded-md text-amber-700">
                  <TicketPercent size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">Use Points</p>
                  <p className="text-[10px] text-amber-600 font-medium">
                    Available: {customer.loyaltyPoints} pts
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-700">
                -${pointsDiscount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-700 font-medium w-8">
                0
              </span>
              <input
                type="range"
                min="0"
                max={Math.min(
                  customer.loyaltyPoints,
                  subtotal * redemptionRate,
                )} // Cap at subtotal equivalent
                step="100"
                value={redeemedPoints}
                onChange={(e) => setRedeemedPoints(Number(e.target.value))}
                className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-[10px] text-amber-700 font-medium w-8 text-right">
                {customer.loyaltyPoints}
              </span>
            </div>
          </div>
        )}
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
              key={item.id || item.name}
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
          {appliedOffers.length > 0 ? (
            <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100 space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-medium text-sm flex items-center gap-2">
                  <TicketPercent size={16} />
                  {appliedOffers.length} Offer(s) Applied
                </span>
                <span className="text-emerald-700 font-bold text-sm">
                  -${offerDiscount.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1 pl-6">
                {appliedOffers.map((offer) => (
                  <p
                    key={offer.id}
                    className="text-xs text-emerald-600 truncate"
                  >
                    • {offer.name}
                  </p>
                ))}
              </div>
            </div>
          ) : offers.length > 0 && cart.length > 0 ? (
            <div className="text-[10px] text-muted-foreground text-center py-1">
              {offers.length} offers active
            </div>
          ) : null}
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
          <div className="text-right">
            <span className="typo-bold-18 text-chart-1 block">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
        {customer && (
          <div className="flex justify-end -mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <TicketPercent size={10} />+
              {Math.floor(
                total *
                  (customer.tierId === "tier-gold"
                    ? 2
                    : customer.tierId === "tier-silver"
                      ? 1.5
                      : 1),
              )}{" "}
              pts
            </span>
          </div>
        )}

        {/* Payment Methods */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={paymentMethod === "card" ? "default" : "outline"}
            className={cn(
              "h-10 typo-semibold-12 gap-2 border-border",
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
              "h-10 typo-semibold-12 gap-2 px-1 border-border",
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

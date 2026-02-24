"use client";

import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { usePOSStore } from "@/features/pos/store/pos-store";
import { calculateCartDiscounts } from "@/features/pos/utils/discount-engine";
import { useSettingsStore } from "@/features/settings/store";
import { useAuth } from "@/providers/auth-provider";
import { Offer, Product } from "@/types";
import { db } from "@/lib/db";
import {
  ListRestart,
  PauseCircle,
  ShoppingCart,
  TicketPercent,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { generateUUID } from "@/lib/utils";
import { CartItemCard } from "./CartItemCard";

import { CustomerSearchCombobox } from "./CustomerSearchCombobox";
import { ProductSearchCombobox } from "./ProductSearchCombobox";
import { CustomerInfoPanel } from "./CustomerInfoPanel";
import { AppliedOffersSummary } from "./AppliedOffersSummary";

interface CartPanelProps {
  offers: Offer[];
}

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
    excludedOfferIds,
    toggleOffer,
    setExcludedOffers,
    addToCart,
    selectProduct,
  } = usePOSStore();
  const settings = useSettingsStore();
  const { user } = useAuth();
  const { t } = useTranslation("pos");
  const taxRate = settings.taxRate / 100; // e.g. 10 -> 0.10

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );

  const handleProductClick = (product: Product) => {
    if (product.type === "variable") {
      selectProduct(product);
      setModal("variant-selector");
    } else {
      addToCart(product);
    }
  };

  useEffect(() => {
    if (offers.length === 0) {
      if (excludedOfferIds.length) setExcludedOffers([]);
      return;
    }
    const filtered = excludedOfferIds.filter((id) =>
      offers.some((offer) => offer.id === id),
    );
    if (filtered.length !== excludedOfferIds.length) {
      setExcludedOffers(filtered);
    }
  }, [offers, excludedOfferIds, setExcludedOffers]);

  const activeOffers = useMemo(
    () => offers.filter((offer) => !excludedOfferIds.includes(offer.id)),
    [offers, excludedOfferIds],
  );

  // Calculate Auto-Discounts from Offers (Actual - taking exclusions into account)
  const {
    totalDiscount: offerDiscount,
    appliedOffers,
    lineDiscounts,
  } = useMemo(
    () => calculateCartDiscounts(cart, activeOffers),
    [cart, activeOffers],
  );

  // Calculate Potential Offers (Ignoring exclusions - to show all available options)
  const { appliedOffers: potentialOffers } = useMemo(
    () => calculateCartDiscounts(cart, offers),
    [cart, offers],
  );

  // Points Logic
  const redemptionRate = 100; // 100 pts = $1
  const pointsDiscount = redeemedPoints / redemptionRate;

  const discount = offerDiscount + pointsDiscount;

  const taxBase = Math.max(0, subtotal - discount);
  const tax = taxBase * taxRate;
  const total = taxBase + tax;

  const handleSuspend = async () => {
    if (cart.length === 0) return;
    try {
      const id = await generateUUID();
      await db.suspendedSales.add({
        id,
        items: cart.map((c) => ({
          id: c.id,
          quantity: c.quantity,
          price: c.sellingPrice,
          name: c.name,
          taxRate: c.taxRate || 0,
          sku: c.sku,
          originalProductId: c.originalProductId,
          categoryId: c.categoryId,
          image: c.image,
        })),
        total,
        paymentMethod: "suspended",
        cashierId: user?.id || "unknown",
        status: "pending",
        createdAt: new Date().toISOString(),
        customerId: customer?.id,
        redeemedPoints,
      });
      clearCart();
      toast.success("Sale Suspended");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to suspend sale"));
    }
  };

  return (
    <div className="w-full lg:w-[320px] xl:w-96 shrink-0 bg-background flex flex-col shadow-xl border-l border-border h-screen sticky top-0 z-30">
      {/* Header Section */}
      <div className="p-4 pb-2 shrink-0 bg-background z-10 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
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

        {/* Product Search - Mobile & Desktop */}
        <ProductSearchCombobox
          onSelect={handleProductClick}
          placeholder="Search products..."
          className="h-11"
        />

        {/* Customer & Loyalty */}
        <div className="mb-4">
          {customer ? (
            <CustomerInfoPanel
              customer={customer}
              onClear={() => setCustomer(null)}
              subtotal={subtotal}
              redeemedPoints={redeemedPoints}
              setRedeemedPoints={setRedeemedPoints}
              currencySymbol={settings.currencySymbol}
              redemptionRate={redemptionRate}
              className="animate-in fade-in slide-in-from-top-1"
            />
          ) : (
            <CustomerSearchCombobox
              onSelect={(c) => setCustomer(c)}
              className="h-11"
              placeholder={t(
                "cart.selectCustomer",
                "Search customers (mobile/name)...",
              )}
            />
          )}
        </div>
      </div>

      {/* Scrollable Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-10 opacity-50">
            <ShoppingCart size={48} className="mb-4" />
            <p className="typo-medium-14">{t("cart.empty")}</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={(delta) => updateQuantity(item.id, delta)}
              onRemove={() => updateQuantity(item.id, -item.quantity)}
            />
          ))
        )}
      </div>

      {/* Totals Breakdown */}
      <div className="p-4 pt-2 bg-background z-20 border-t border-border shrink-0">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-muted-foreground">
            <span className="typo-regular-14">{t("cart.subtotal")}</span>
            <span className="typo-semibold-14 text-foreground">
              {settings.currencySymbol}
              {subtotal.toFixed(2)}
            </span>
          </div>

          <AppliedOffersSummary
            appliedOffers={appliedOffers}
            potentialOffers={potentialOffers}
            excludedOfferIds={excludedOfferIds}
            onToggleOffer={toggleOffer}
            onSetExcluded={(ids) => setExcludedOffers(ids)}
            offerDiscount={offerDiscount}
            currencySymbol={settings.currencySymbol}
            className="mb-2"
          />
          <div className="flex justify-between text-muted-foreground items-center">
            <span className="typo-regular-14">{t("cart.discount")}</span>
            <span className="typo-semibold-14 text-foreground">
              {discount > 0
                ? `-${settings.currencySymbol}${discount.toFixed(2)}`
                : `${settings.currencySymbol}0.00`}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="typo-regular-14">
              {t("cart.tax")} ({settings.taxRate}%)
            </span>
            <span className="typo-semibold-14 text-foreground">
              {settings.currencySymbol}
              {tax.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-2 border-t border-dashed border-border mb-3">
          <span className="typo-bold-18 text-foreground">
            {t("cart.total")}
          </span>
          <div className="text-right">
            <span className="typo-bold-18 text-chart-1 block">
              {settings.currencySymbol}
              {total.toFixed(2)}
            </span>
          </div>
        </div>

        {customer && (
          <div className="flex justify-end -mt-2 mb-3 text-muted-foreground typo-regular-12">
            <span className="flex items-center gap-1 text-emerald-600 typo-medium-14">
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

        {/* Complete Sale Button */}
        <PrimaryActionButton
          className="w-full shadow-lg hover:shadow-xl transition-all h-12 typo-bold-16"
          disabled={cart.length === 0}
          onClick={() => setModal("checkout")}
        >
          {t("checkout.charge")} {settings.currencySymbol}
          {total.toFixed(2)}
        </PrimaryActionButton>
      </div>
    </div>
  );
}

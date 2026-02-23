"use client";

import { useState } from "react";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { useSettingsStore } from "@/features/settings/store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { processSale } from "@/features/pos/utils/sale-processor";
import { Offer, CartItem, Customer } from "@/types";
import { Sale } from "@/types";
import { useLocationStore } from "@/features/locations/store";
import { calculateCartDiscounts } from "@/features/pos/utils/discount-engine";
import { useQueryClient } from "@tanstack/react-query";
import { CashManagementModal } from "./CashManagementModal";

import {
  CheckoutView,
  CheckoutPaymentMethod,
  VariantSelectorView,
  PaymentMethodView,
  SplitPaymentView,
  SplitPaymentEntry,
  SuccessView,
  CardDetailView,
  ProcessingView,
  SuspendedSalesView,
  MemberSearchView,
} from "./pos-modal-views";

// ─── Props ────────────────────────────────────────────────────────────────────

interface POSModalsProps {
  offers?: Offer[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function POSModals({ offers = [] }: POSModalsProps) {
  const { currentLocation } = useLocationStore();
  const settings = useSettingsStore();
  const queryClient = useQueryClient();

  const {
    activeModal,
    setModal,
    selectedProduct,
    addToCart,
    cart,
    clearCart,
    setCustomer,
    customer,
    redeemedPoints,
    excludedOfferIds,
    modalData,
  } = usePOSStore();

  // ── Totals ────────────────────────────────────────────────────────────────

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );
  const activeOffers = offers.filter(
    (offer) => !excludedOfferIds.includes(offer.id),
  );
  const { totalDiscount: offerDiscount } = calculateCartDiscounts(
    cart,
    activeOffers,
  );
  const pointsDiscount = redeemedPoints / 100;
  const discount = offerDiscount + pointsDiscount;
  const taxRate = settings.taxRate / 100;
  const taxBase = Math.max(0, subtotal - discount);
  const tax = taxBase * taxRate;
  const total = taxBase + tax;

  // ── State ─────────────────────────────────────────────────────────────────

  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // ── Checkout handler ──────────────────────────────────────────────────────

  const handleCheckout = async (
    method: string,
    payments?: SplitPaymentEntry[],
  ) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!currentLocation?.id || currentLocation.id === "default") {
      toast.error("Select a location before checkout");
      return;
    }

    setModal("processing");

    try {
      const result = await processSale({
        items: cart,
        total,
        subtotal,
        discount,
        tax,
        paymentMethod: method,
        payments,
        locationId: currentLocation.id,
        customerId: customer?.id,
        loyaltyPointsRedeemed: redeemedPoints,
        loyaltyDiscount: pointsDiscount,
        offers: activeOffers,
      });

      if (!result.success) {
        throw new Error(result.error || "Sale processing failed");
      }

      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });

      const now = new Date();
      const saleData = result.saleData;

      setLastSale({
        id: result.saleId || `sale-${Date.now()}`,
        invoiceNo:
          result.invoiceNo ||
          saleData?.invoiceNo ||
          `INV-${Date.now().toString().slice(-6)}`,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0],
        completedAt: now.toISOString(),
        createdAt: now.toISOString(),
        items: [...cart],
        lines: cart.map((item, idx) => ({
          id: `line-${Date.now()}-${idx}`,
          productId: item.id,
          variantId: (item as CartItem & { variantId?: string }).variantId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.sellingPrice,
          lineTotal: item.sellingPrice * item.quantity,
        })),
        total,
        subtotal,
        tax,
        discount,
        taxTotal: tax,
        discountTotal: discount,
        paymentMethod: method as Sale["paymentMethod"],
        payments:
          payments?.map((p, i) => ({
            ...p,
            id: `pay-${Date.now()}-${i}`,
            date: new Date().toISOString(),
          })) || [],
        status: "COMPLETED",
        cashierId: saleData?.cashier?.id || "unknown",
        customerId: customer?.id,
        customerName: customer ? customer.name : "Guest",
        loyaltyPointsRedeemed: redeemedPoints,
        loyaltyPointsEarned: saleData?.loyaltyPointsEarned || 0,
      });

      setModal("success");
      clearCart();
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Sale failed to process."));
      setModal("none");
    }
  };

  // ── Render active modal view via switch ───────────────────────────────────

  const renderModalContent = () => {
    switch (activeModal) {
      case "checkout":
        return (
          <CheckoutView
            totalAmount={total}
            onComplete={(method: CheckoutPaymentMethod) => {
              if (method === "split") {
                setModal("split-payment");
              } else {
                handleCheckout(method);
              }
            }}
            onClose={() => setModal("none")}
          />
        );

      case "variant-selector":
        if (!selectedProduct) return null;
        return (
          <VariantSelectorView
            product={selectedProduct}
            onSelect={(product, variant) => {
              addToCart(product, variant);
              setModal("none");
            }}
            onClose={() => setModal("none")}
          />
        );

      case "payment-method":
        return (
          <PaymentMethodView
            onCheckout={handleCheckout}
            onOpenSplit={() => setModal("split-payment")}
          />
        );

      case "split-payment":
        return (
          <SplitPaymentView
            total={total}
            onCheckout={handleCheckout}
            onBack={() => setModal("none")}
          />
        );

      case "success":
        return (
          <SuccessView sale={lastSale} onNewSale={() => setModal("none")} />
        );

      case "card-detail":
        return <CardDetailView total={total} onCheckout={handleCheckout} />;

      case "processing":
        return <ProcessingView />;

      case "suspended-list":
        return <SuspendedSalesView onClose={() => setModal("none")} />;

      case "cash-management":
        return <CashManagementModal />;

      case "member":
        return (
          <MemberSearchView
            onClose={() => setModal("none")}
            onSelect={(c: Customer) => {
              setCustomer(c);
              setModal("none");
            }}
            initialPhone={modalData?.phone}
          />
        );

      default:
        return null;
    }
  };

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={activeModal !== "none"}
      onOpenChange={(open) => !open && setModal("none")}
    >
      <DialogContent
        aria-describedby={undefined}
        className="max-w-sm bg-transparent border-0 shadow-none p-0 overflow-hidden outline-none"
      >
        <DialogTitle className="sr-only">POS Modal</DialogTitle>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );
}

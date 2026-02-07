"use client";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { Offer } from "@/types";
import { ShoppingCart, Minus, Plus, Trash2, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface CartPanelProps {
  offers: Offer[];
}

export function CartPanel({ offers }: CartPanelProps) {
  const { cart, updateQuantity, clearCart, setModal } = usePOSStore();
  const { t } = useTranslation("pos");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const discount = 0; // TODO: Implement discount logic
  const total = subtotal + tax - discount;

  return (
    <div className="w-full lg:w-[320px] xl:w-95 shrink-0 bg-card rounded-[2rem] flex flex-col shadow-sm border border-border overflow-hidden h-100vh sticky top-0">
      {/* [calc(100vh-100px)] */}
      <div className="p-5 pb-3 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-black text-foreground">
          {t("cart.title")}
        </h2>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[10px] font-black text-muted-foreground hover:text-destructive uppercase tracking-widest bg-muted px-3 py-1.5 rounded-full"
          >
            {t("cart.clearCart")}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-3 py-2 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3 text-muted-foreground/50">
              <ShoppingCart size={24} />
            </div>
            <p className="text-muted-foreground font-bold text-sm">
              {t("cart.empty")}
            </p>
            <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-widest mt-1">
              {t("cart.addItems")}
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.name}
              className="bg-muted/50 p-3 rounded-2xl flex items-center gap-3 group hover:bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-foreground leading-tight mb-0.5 truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-muted-foreground font-bold">
                  ${item.sellingPrice}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-card px-2 py-1 rounded-xl shadow-sm border border-border">
                <button
                  onClick={() => updateQuantity(item.name, -1)}
                  className="p-0.5 hover:text-primary transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-black w-3 text-center text-foreground">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.name, 1)}
                  className="p-0.5 hover:text-primary transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="text-right min-w-12.5">
                <p className="text-xs font-black text-foreground">
                  ${(item.sellingPrice * item.quantity).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => updateQuantity(item.name, -item.quantity)}
                className="text-muted-foreground/50 hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-5 border-t border-border space-y-3 bg-muted/30 shrink-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <span>{t("cart.subtotal")}</span>
            <span className="text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <span>{t("cart.discount")}</span>
            <span className="text-primary">-${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <span>{t("cart.tax")}</span>
            <span className="text-foreground">${tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <span className="text-xl font-black text-foreground uppercase tracking-tighter">
            {t("cart.total")}
          </span>
          <span className="text-4xl font-black text-primary tracking-tighter">
            ${total.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <button
            className="w-full py-2 bg-green-50 text-green-600 rounded-2xl font-bold text-xs uppercase tracking-widest border border-green-100 hover:bg-green-100 transition-all flex items-center justify-center gap-2"
            onClick={() => setModal("offers")}
          >
            <TicketPercent size={18} /> {t("offers.viewOffers")} (
            {offers.length} available)
          </button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 py-2 h-auto text-[10px] uppercase tracking-widest rounded-2xl"
              onClick={() => setModal("member")}
            >
              + Member
            </Button>
            <Button
              className="flex-2 py-2 h-auto text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
              disabled={cart.length === 0}
              onClick={() => setModal("payment-method")}
            >
              {t("cart.checkout")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

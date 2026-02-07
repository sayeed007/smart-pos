"use client";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Wallet, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";

export function POSModals() {
  const { activeModal, setModal, selectedProduct, addToCart, cart, clearCart } =
    usePOSStore();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax; // Discount separate

  const handleCheckout = async (method: string) => {
    setModal("processing");
    try {
      // Simulate API call
      await api.post("/sales", {
        items: cart,
        total,
        paymentMethod: method,
        cashierId: "u1",
      });
      setTimeout(() => {
        setModal("success");
        clearCart();
      }, 1500);
    } catch {
      toast.error("Sale failed");
      setModal("none");
    }
  };

  return (
    <>
      <Dialog
        open={activeModal !== "none"}
        onOpenChange={(open) => !open && setModal("none")}
      >
        <DialogContent className="max-w-sm bg-transparent border-0 shadow-none p-0 overflow-hidden outline-none">
          {activeModal === "size" && selectedProduct && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1 text-center">
                Select Size
              </h3>
              <p className="text-xs text-gray-400 font-medium mb-6 text-center">
                {selectedProduct.name}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "XS", stock: 15, tag: "xs" },
                  { label: "Small", stock: 30, tag: "s" },
                  { label: "Medium", stock: 45, tag: "m" },
                  { label: "Large", stock: 25, tag: "l" },
                  { label: "XL", stock: 5, tag: "xl" },
                ].map((size) => (
                  <button
                    key={size.tag}
                    onClick={() => {
                      addToCart(selectedProduct, size.label);
                      setModal("none");
                    }}
                    className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:bg-primary/10 transition-all text-center group flex flex-col items-center justify-center min-h-[90px]"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center font-black text-[10px] ${size.stock > 0 ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"}`}
                    >
                      {size.label.charAt(0).toUpperCase()}
                      {size.label.includes("XL") ? "L" : ""}
                    </div>
                    <p className="font-bold text-xs text-gray-900 leading-tight">
                      {size.label}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase">
                      {size.stock} left
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeModal === "payment-method" && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6 text-center">
                Payment Options
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {["Card", "Cash", "Digital"].map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setModal(m === "Cash" ? "cash-detail" : "card-detail")
                    }
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-transparent hover:border-primary hover:bg-primary/10 rounded-2xl transition-all gap-3 group"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary">
                      {m === "Card" ? (
                        <CreditCard size={24} />
                      ) : m === "Cash" ? (
                        <Wallet size={24} />
                      ) : (
                        <Smartphone size={24} />
                      )}
                    </div>
                    <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400 group-hover:text-primary">
                      {m}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeModal === "success" && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-100 mb-6 mx-auto">
                <CheckCircle2 size={32} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Payment Successful!
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">
                Transaction completed
              </p>
              <Button
                className="w-full py-5 rounded-xl text-sm"
                onClick={() => setModal("none")}
              >
                Start New Sale
              </Button>
            </div>
          )}

          {activeModal === "card-detail" && (
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
                onClick={() => handleCheckout("Card")}
              >
                Process Payment
              </Button>
            </div>
          )}

          {activeModal === "processing" && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="w-20 h-20 border-8 border-gray-50 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center text-primary">
                  <CreditCard size={20} />
                </div>
              </div>
              <h2 className="text-lg font-black text-gray-900">
                Processing...
              </h2>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

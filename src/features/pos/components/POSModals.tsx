"use client";

import { useState, useEffect } from "react";

import { usePOSStore } from "@/features/pos/store/pos-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Wallet,
  CreditCard,
  Smartphone,
  Split,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { processSale } from "@/features/pos/utils/sale-processor";
import { useInventoryStore } from "@/features/inventory/store/inventory-store";
import { InventoryTransaction, Sale, Offer, Customer } from "@/types";
import { ReceiptTemplate } from "./ReceiptTemplate";
import { Printer } from "lucide-react";
import { CashManagementModal } from "./CashManagementModal";
import { useLocationStore } from "@/features/locations/store";
import { db, SaleQueueItem, updateLocalStock } from "@/lib/db";
import { UserPlus } from "lucide-react";
import { calculateCartDiscounts } from "@/features/pos/utils/discount-engine";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

export function POSModals() {
  const { currentLocation } = useLocationStore();
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
  } = usePOSStore();
  const addTransactions = useInventoryStore((state) => state.addTransactions);

  // Fetch active offers for discount calculation
  const { data: offers = [] } = useQuery<Offer[]>({
    queryKey: ["offers"],
    queryFn: async () =>
      await db.offers.where("status").equals("active").toArray(),
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );

  const { totalDiscount: offerDiscount } = calculateCartDiscounts(cart, offers);
  const pointsDiscount = redeemedPoints / 100;
  const discount = offerDiscount + pointsDiscount;

  // Consistent Tax Logic with CartPanel (Global 8% for MVP)
  const taxBase = Math.max(0, subtotal - discount);
  const tax = taxBase * 0.08;
  const total = taxBase + tax;

  const [splitPayments, setSplitPayments] = useState<
    { method: string; amount: number }[]
  >([]);
  const [splitAmountInput, setSplitAmountInput] = useState("");
  const [splitMethod, setSplitMethod] = useState("Cash");
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const totalPaid = splitPayments.reduce((sum: number, p) => sum + p.amount, 0);
  const remainingDue = Math.max(0, total - totalPaid);

  const handleCheckout = async (
    method: string,
    payments?: { method: string; amount: number }[],
  ) => {
    setModal("processing");
    try {
      // Use offline-capable processor
      const result = await processSale({
        items: cart,
        total,
        subtotal, // Added logic
        discount, // Pass discount if SalePayload supported it (it might not yet, but harmless)
        tax,
        paymentMethod: method,
        payments, // Pass split payments
        cashierId: "u1", // TODO: Session user
        customerId: customer?.id,
        redeemedPoints,
      } as any); // Cast as any to bypass SalePayload strictness if fields missing

      if (!result.success) {
        throw new Error("Sale processing failed completely.");
      }

      // Create Inventory Transactions (Optimistic UI Update)
      // Even if offline, we deduct stock locally in store
      const transactions: InventoryTransaction[] = cart.map((item) => ({
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: item.originalProductId || item.id,
        variantId:
          item.originalProductId && item.id !== item.originalProductId
            ? item.id
            : undefined,
        type: "OUT",
        quantity: item.quantity,
        reason: `Sale ${result.isOffline ? "(Offline)" : ""} #${result.localId?.substr(-6)}`,
        referenceId: result.localId || `sale-${Date.now()}`,
        performedBy: "u1", // Default user
        timestamp: new Date().toISOString(),
        locationId: currentLocation.id,
      }));

      addTransactions(transactions);
      updateLocalStock(transactions);

      setTimeout(() => {
        const now = new Date();
        const saleId = result.localId || `sale-${Date.now()}`;
        setLastSale({
          id: saleId,
          invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
          date: now.toISOString().split("T")[0],
          time: now.toTimeString().split(" ")[0],
          items: [...cart],
          total,
          subtotal,
          tax,
          discount: discount,
          paymentMethod: method as any,
          payments: payments,
          status: "Completed",
          cashierId: "u1",
          customerId: customer?.id,
          customerName: customer ? customer.name : "Guest",
          loyaltyPointsRedeemed: redeemedPoints,
          loyaltyPointsEarned: customer
            ? Math.floor(
                total *
                  (customer.tierId === "tier-gold"
                    ? 2
                    : customer.tierId === "tier-silver"
                      ? 1.5
                      : 1),
              )
            : 0,
        });
        setModal("success");
        clearCart();
      }, 1500);
    } catch (e) {
      console.error(e);
      toast.error("Sale failed to process.");
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
          {activeModal === "variant-selector" && selectedProduct && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 min-w-[320px] max-w-md">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1 text-center">
                Select Option
              </h3>
              <p className="text-sm text-gray-400 font-medium mb-6 text-center">
                {selectedProduct.name}
              </p>

              <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
                {selectedProduct.variants &&
                selectedProduct.variants.length > 0 ? (
                  selectedProduct.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        addToCart(selectedProduct, v);
                        setModal("none");
                      }}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <div className="font-bold text-base text-gray-900">
                        {v.name}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">{v.sku}</div>
                      <div className="text-primary font-bold text-lg">
                        ${v.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase mt-1 ${v.stockQuantity > 0 ? "text-green-500" : "text-red-400"}`}
                      >
                        {v.stockQuantity > 0
                          ? `${v.stockQuantity} In Stock`
                          : "Out of Stock"}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-muted-foreground py-8">
                    No variants available for this product.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-gray-900"
                  onClick={() => setModal("none")}
                >
                  Cancel
                </Button>
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

                {/* Split Payment Button */}
                <button
                  onClick={() => {
                    setSplitPayments([]);
                    setSplitAmountInput("");
                    setModal("split-payment");
                  }}
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
          )}

          {activeModal === "split-payment" && (
            <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-[400px]">
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 text-center">
                Split Payment
              </h3>

              <div className="bg-gray-50 p-4 rounded-xl mb-4 flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                  Remaining Due
                </span>
                <span
                  className={`text-2xl font-black ${remainingDue > 0 ? "text-red-500" : "text-green-500"}`}
                >
                  ${remainingDue.toFixed(2)}
                </span>
              </div>

              {/* Add Payment Form */}
              {remainingDue > 0.01 && (
                <div className="flex gap-2 mb-4">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={splitMethod}
                    onChange={(e) => setSplitMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Digital">Digital</option>
                    <option value="Voucher">Voucher</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={splitAmountInput}
                    onChange={(e) => setSplitAmountInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={() => {
                      const val = parseFloat(splitAmountInput);
                      if (val > 0) {
                        setSplitPayments([
                          ...splitPayments,
                          { method: splitMethod, amount: val },
                        ]);
                        setSplitAmountInput("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* List */}
              <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto">
                {splitPayments.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 border rounded-lg text-sm"
                  >
                    <div className="flex gap-2">
                      <span className="font-bold">{p.method}</span>
                      <span>${p.amount.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() =>
                        setSplitPayments(
                          splitPayments.filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {splitPayments.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-2">
                    No payments added yet.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModal("payment-method")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={remainingDue > 0.01}
                  onClick={() => handleCheckout("Split", splitPayments)}
                >
                  Complete Sale
                </Button>
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

              <div className="flex gap-2 mb-4">
                <Button
                  className="flex-1 py-5 rounded-xl text-sm"
                  onClick={() => setModal("none")}
                >
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
              {lastSale && <ReceiptTemplate sale={lastSale} />}
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

          {activeModal === "suspended-list" && (
            <SuspendedSalesList onClose={() => setModal("none")} />
          )}

          {activeModal === "cash-management" && <CashManagementModal />}

          {activeModal === "member" && (
            <MemberSearchModal
              onClose={() => setModal("none")}
              onSelect={(c) => {
                setCustomer(c);
                setModal("none");
                toast.success(`Customer ${c.name} selected`);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SuspendedSalesList({ onClose }: { onClose: () => void }) {
  const [sales, setSales] = useState<SaleQueueItem[]>([]);
  const { setCart, setModal, setCustomer, setRedeemedPoints } = usePOSStore();

  useEffect(() => {
    db.suspendedSales.toArray().then(setSales);
  }, []);

  const resume = async (sale: SaleQueueItem) => {
    const restoredItems = sale.items.map((item) => ({
      ...item,
      sellingPrice: item.price,
      originalProductId: item.id, // Best guess, might be variant ID
    }));
    setCart(restoredItems as any);
    if (sale.customerId) {
      const c = await db.customers.get(sale.customerId);
      setCustomer(c || null);
    } else {
      setCustomer(null);
    }
    setRedeemedPoints(sale.redeemedPoints || 0);

    await db.suspendedSales.delete(sale.id);
    setModal("none");
    toast.success("Sale Resumed");
  };

  const remove = async (id: string) => {
    await db.suspendedSales.delete(id);
    setSales(sales.filter((s) => s.id !== id));
    toast.success("Suspended sale discarded");
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-[500px] max-h-[80vh] flex flex-col">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 text-center">
        Suspended Sales
      </h3>
      <div className="flex-1 overflow-y-auto space-y-3 p-1">
        {sales.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            No suspended sales found.
          </p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="border rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-bold text-sm">
                  Sale #{sale.id.substr(0, 8)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(sale.createdAt))} ago •{" "}
                  {sale.items.length} items
                </div>
                <div className="font-mono text-emerald-600 font-bold mt-1">
                  ${sale.total.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(sale.id)}
                >
                  Discard
                </Button>
                <Button size="sm" onClick={() => resume(sale)}>
                  Resume
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button variant="ghost" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function MemberSearchModal({
  onSelect,
  onClose,
}: {
  onSelect: (c: Customer) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Search effect
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    db.customers
      .where("phone")
      .startsWith(query)
      .or("name")
      .startsWithIgnoreCase(query)
      .limit(5)
      .toArray()
      .then(setResults);
  }, [query]);

  const handleCreate = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Name and Phone required");
      return;
    }

    const id = `cust-${Date.now()}`;
    const customer: Customer = {
      id,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email || "",
      totalSpent: 0,
      loyaltyPoints: 0,
      tierId: "tier-bronze", // Default tier
      history: [],
    };

    await db.customers.add(customer);
    onSelect(customer);
    toast.success("Customer Created");
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">
          {isCreating ? "New Customer" : "Select Customer"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Trash2 className="h-4 w-4 rotate-45" />{" "}
          {/* Close icon hack or use X */}
        </Button>
      </div>

      {isCreating ? (
        <div className="space-y-4">
          <Input
            placeholder="Full Name *"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
          />
          <Input
            placeholder="Phone Number *"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />
          <Input
            placeholder="Email (Optional)"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsCreating(false)}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Create Customer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder="Search by name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="space-y-2 min-h-[200px]">
            {results.length > 0 ? (
              results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                  </div>
                  <div className="text-xs font-bold text-primary group-hover:underline">
                    Select
                  </div>
                </button>
              ))
            ) : query ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No customers found.
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Type above to search...
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setIsCreating(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>
      )}
    </div>
  );
}

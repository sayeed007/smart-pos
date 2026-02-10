"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_SALES } from "@/lib/mock-data";
import { CartItem, Return, Sale } from "@/types";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Return>) => void;
  initialData?: Return | null;
}

export function ReturnFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ReturnFormModalProps) {
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Return["status"]>("Pending");
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    if (initialData) {
      setInvoiceSearch(initialData.invoiceNo);
      // find sale again to get full items list? Or just use returned items?
      // For Edit, we might only show returned items or allow modifying?
      // For simplicity in edit: show as read-only or just status update.
      // But user said "edit return & refunds".
      // I'll assume full edit capability if needed, but usually once returned, items are fixed.
      // Let's allow simple status update for Edit.
      setStatus(initialData.status);
      setReason(initialData.reason);
      setRefundAmount(initialData.refundAmount);
      setSelectedItems(initialData.items);
    } else {
      setInvoiceSearch("");
      setSelectedSale(null);
      setSelectedItems([]);
      setReason("");
      setStatus("Pending");
      setRefundAmount(0);
    }
  }, [initialData, isOpen]);

  const handleSearchSale = () => {
    // Mock search
    const sale = MOCK_SALES.find((s) =>
      s.invoiceNo.toLowerCase().includes(invoiceSearch.toLowerCase()),
    );
    if (sale) {
      setSelectedSale(sale);
      toast.success("Sale found!");
    } else {
      setSelectedSale(null);
      toast.error("Sale not found.");
    }
  };

  const toggleItem = (item: CartItem) => {
    const exists = selectedItems.find((i) => i.id === item.id);
    let newItems: CartItem[] = [];
    if (exists) {
      newItems = selectedItems.filter((i) => i.id !== item.id);
    } else {
      // Add whole item quantity for now
      newItems = [...selectedItems, item];
    }
    setSelectedItems(newItems);
    // Recalculate refund
    const total = newItems.reduce(
      (sum, i) => sum + i.sellingPrice * i.quantity,
      0,
    );
    setRefundAmount(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale && !initialData) {
      toast.error("Please select a sale first.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select items to return.");
      return;
    }

    const data: Partial<Return> = {
      ...(initialData ? { id: initialData.id } : {}),
      invoiceNo: initialData ? initialData.invoiceNo : selectedSale?.invoiceNo,
      saleId: initialData ? initialData.saleId : selectedSale?.id,
      date: initialData ? initialData.date : new Date().toISOString(),
      items: selectedItems,
      refundAmount,
      reason,
      status,
      customerName: initialData
        ? initialData.customerName
        : selectedSale?.customerName || "Walk-in Customer",
      processedBy: "u1", // Current user mock
    };

    onSubmit(data);
  };

  // If initialData exists (Edit mode), maybe lock invoice search
  const isEdit = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Return" : "Create New Return"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update return details and status."
              : "Process a return for a completed sale."}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && (
          <div className="flex gap-2 items-end">
            <div className="grid gap-2 w-full">
              <Label htmlFor="invoice">Search Invoice</Label>
              <Input
                id="invoice"
                placeholder="Enter Invoice No (e.g. #INV-2025-0342)"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleSearchSale} size="icon" className="mb-0.5">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isEdit && (
          <div className="grid gap-2">
            <Label>Invoice No</Label>
            <div className="text-sm font-medium">{invoiceSearch}</div>
          </div>
        )}

        {(selectedSale || isEdit) && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
              <Label className="mb-2 block">Select Items to Return</Label>
              <div className="space-y-2">
                {(isEdit ? initialData.items : selectedSale?.items)?.map(
                  (item) => {
                    const isSelected = selectedItems.some(
                      (i) => i.id === item.id,
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 border-b pb-2 last:border-0"
                      >
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={isSelected || isEdit} // If edit, locked selection? OR allow checkboxes.
                          onCheckedChange={() => !isEdit && toggleItem(item)} // Lock items in edit for simplicity
                          disabled={isEdit}
                        />
                        <div className="flex-1 text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          ${(item.sellingPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Return</Label>
                <Textarea
                  id="reason"
                  placeholder="Defective, Wrong Size, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="font-semibold text-sm">Total Refund Amount</span>
              <span className="font-bold text-xl">
                ${refundAmount.toFixed(2)}
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Update Return" : "Process Return"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CartItem, Return } from "@/types";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRefundableSales } from "@/hooks/api/returns";
import { useTranslation } from "react-i18next";

interface RefundableSaleLine {
  saleLineId: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  soldQuantity: number;
  alreadyReturnedQuantity: number;
  returnableQuantity: number;
  unitPrice: number;
  lineTotal: number;
  unitRefund: number;
}

interface RefundableSale {
  id: string;
  invoiceNo: string;
  completedAt: string;
  customerId?: string;
  customerName?: string;
  total: number;
  returnableLines: RefundableSaleLine[];
}

interface ReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Return> & { restock?: boolean }) => void;
  initialData?: Return | null;
  initialInvoiceNo?: string;
}

export function ReturnFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialInvoiceNo,
}: ReturnFormModalProps) {
  const { t } = useTranslation(["returns", "common"]);
  const [saleSearch, setSaleSearch] = useState("");
  const [saleOpen, setSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<RefundableSale | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<
    Record<string, number>
  >({});
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<Return["status"]>("Pending");
  const [restock, setRestock] = useState(true);

  const { data: refundableSales, isFetching: isSearching } = useRefundableSales(
    {
      search: saleSearch || undefined,
      limit: 10,
    },
  );

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setStatus(initialData.status);
      setReason(initialData.reason);
      setRestock(true);
      setSelectedSale(null);
      setSaleSearch(initialData.invoiceNo || "");
      setReturnQuantities(
        initialData.items.reduce<Record<string, number>>((acc, item) => {
          acc[item.id] = item.quantity;
          return acc;
        }, {}),
      );
    } else {
      setSaleSearch(initialInvoiceNo || "");
      setSelectedSale(null);
      setReturnQuantities({});
      setReason("");
      setStatus("Pending");
      setRestock(true);
    }
  }, [initialData, isOpen, initialInvoiceNo]);

  useEffect(() => {
    if (
      !isEdit &&
      initialInvoiceNo &&
      !selectedSale &&
      refundableSales &&
      refundableSales.length > 0
    ) {
      const match = refundableSales.find(
        (s) => s.invoiceNo === initialInvoiceNo,
      );
      if (match) {
        setSelectedSale(match);
      }
    }
  }, [initialInvoiceNo, selectedSale, refundableSales, isEdit]);

  const returnableLines: RefundableSaleLine[] = useMemo(() => {
    if (isEdit && initialData) {
      return initialData.items.map((item) => ({
        saleLineId: item.id,
        productId: "",
        variantId: undefined,
        name: item.name,
        sku: item.sku || "",
        soldQuantity: item.quantity,
        alreadyReturnedQuantity: 0,
        returnableQuantity: item.quantity,
        unitPrice: item.sellingPrice,
        lineTotal: item.sellingPrice * item.quantity,
        unitRefund: item.sellingPrice,
      }));
    }
    return selectedSale?.returnableLines || [];
  }, [initialData, isEdit, selectedSale]);

  const refundAmount = useMemo(() => {
    if (!returnableLines.length) return 0;
    return returnableLines.reduce((sum, line) => {
      const qty = returnQuantities[line.saleLineId] || 0;
      return sum + qty * line.unitRefund;
    }, 0);
  }, [returnQuantities, returnableLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale && !initialData) {
      toast.error(t("validation.selectSale", "Please select a sale first."));
      return;
    }
    if (returnableLines.length === 0) {
      toast.error(
        t("validation.noReturnableItems", "No returnable items found."),
      );
      return;
    }
    if (!reason.trim()) {
      toast.error(
        t(
          "validation.provideReason",
          "Please provide a reason for the return.",
        ),
      );
      return;
    }

    const itemsToReturn: CartItem[] = returnableLines
      .map((line) => {
        const qty = returnQuantities[line.saleLineId] || 0;
        if (qty <= 0) return null;
        return {
          id: line.saleLineId, // saleLineId for backend
          name: line.name,
          quantity: qty,
          sellingPrice: line.unitRefund,
          sku: line.sku || "",
          barcode: "",
          categoryId: "",
          costPrice: 0,
          taxRate: 0,
          stockQuantity: 0,
          minStockLevel: 0,
          status: "active",
          type: "simple",
        };
      })
      .filter((item): item is CartItem => !!item);

    if (itemsToReturn.length === 0) {
      toast.error(
        t("validation.selectItems", "Please select items to return."),
      );
      return;
    }

    const data: Partial<Return> = {
      ...(initialData ? { id: initialData.id } : {}),
      invoiceNo: initialData ? initialData.invoiceNo : selectedSale?.invoiceNo,
      saleId: initialData ? initialData.saleId : selectedSale?.id,
      date: initialData ? initialData.date : new Date().toISOString(),
      items: itemsToReturn,
      refundAmount,
      reason,
      status,
      customerName: initialData
        ? initialData.customerName
        : selectedSale?.customerName ||
          t("form.walkInCustomer", "Walk-in Customer"),
      processedBy: "u1", // Current user mock
    };

    onSubmit({ ...data, restock });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t("form.editTitle", "Edit Return")
              : t("form.createTitle", "Create New Return")}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t("form.editDescription", "Update return details and status.")
              : t(
                  "form.createDescription",
                  "Process a return for a completed sale.",
                )}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && (
          <div className="grid gap-2">
            <Label>{t("form.refundableInvoice", "Refundable Invoice")}</Label>
            <Popover open={saleOpen} onOpenChange={setSaleOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={saleOpen}
                  className="w-full justify-between bg-card"
                >
                  {selectedSale
                    ? `${selectedSale.invoiceNo} - ${
                        selectedSale.customerName ||
                        t("form.walkInCustomer", "Walk-in Customer")
                      }`
                    : t("form.selectInvoice", "Select invoice...")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-(--radix-popover-trigger-width) p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder={t("form.searchInvoice", "Search invoice...")}
                    value={saleSearch}
                    onValueChange={setSaleSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isSearching ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("form.searching", "Searching...")}
                        </span>
                      ) : (
                        t(
                          "form.noInvoicesFound",
                          "No refundable invoices found.",
                        )
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {(refundableSales || []).map((sale) => (
                        <CommandItem
                          key={sale.id}
                          value={`${sale.invoiceNo} ${sale.customerName || ""}`}
                          onSelect={() => {
                            setSelectedSale(sale);
                            setReturnQuantities({});
                            setSaleOpen(false);
                          }}
                          className="flex items-start gap-2"
                        >
                          <div className="flex flex-col">
                            <span className="typo-medium-14">
                              {sale.invoiceNo}
                            </span>
                            <span className="text-muted-foreground typo-regular-12">
                              {sale.customerName ||
                                t(
                                  "form.walkInCustomer",
                                  "Walk-in Customer",
                                )}{" "}
                              -{" "}
                              {new Date(sale.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {selectedSale?.id === sale.id && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {isEdit && (
          <div className="grid gap-2">
            <Label>{t("table.invoiceNo", "Invoice No")}</Label>
            <div className="typo-medium-14">{saleSearch}</div>
          </div>
        )}

        {(selectedSale || isEdit) && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="border rounded-md p-3 max-h-[260px] overflow-y-auto">
              <Label className="mb-2 block">
                {t("form.selectItemsToReturn", "Select Items to Return")}
              </Label>
              <div className="space-y-3">
                {returnableLines.map((line) => {
                  const qty = returnQuantities[line.saleLineId] || 0;
                  const maxQty = line.returnableQuantity;
                  return (
                    <div
                      key={line.saleLineId}
                      className="rounded-md border p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="typo-medium-14">{line.name}</div>
                          <div className="text-muted-foreground typo-regular-12">
                            {t("form.sold", "Sold")}: {line.soldQuantity} |{" "}
                            {t("form.returned", "Returned")}:{" "}
                            {line.alreadyReturnedQuantity} |{" "}
                            {t("form.returnable", "Returnable")}:{" "}
                            {line.returnableQuantity}
                          </div>
                        </div>
                        <div className="typo-semibold-14">
                          ${(line.unitRefund * qty).toFixed(2)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`qty-${line.saleLineId}`}>
                            {t("form.returnQty", "Return Qty")}
                          </Label>
                          <Input
                            id={`qty-${line.saleLineId}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={maxQty}
                            step="0.001"
                            value={qty === 0 ? "" : qty}
                            disabled={isEdit}
                            onChange={(e) => {
                              if (isEdit) return;
                              const raw = Number(e.target.value || 0);
                              const clamped = Math.min(
                                Math.max(raw, 0),
                                maxQty,
                              );
                              setReturnQuantities((prev) => ({
                                ...prev,
                                [line.saleLineId]: clamped,
                              }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("form.unitRefund", "Unit Refund")}</Label>
                          <div className="h-10 rounded-md border bg-muted/40 px-3 flex items-center typo-regular-14">
                            ${line.unitRefund.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {returnableLines.length === 0 && (
                  <div className="text-muted-foreground typo-regular-14">
                    {t(
                      "form.noReturnableItemsForSale",
                      "No returnable items for this sale.",
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  {t("form.reasonForReturn", "Reason for Return")}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={t(
                    "form.reasonPlaceholder",
                    "Defective, Wrong Size, etc.",
                  )}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="status">{t("form.status", "Status")}</Label>
                  <Select
                    value={status}
                    onValueChange={(v: any) => setStatus(v)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("form.selectStatus", "Select Status")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">
                        {t("status.Pending", "Pending")}
                      </SelectItem>
                      <SelectItem value="Approved">
                        {t("status.Approved", "Approved")}
                      </SelectItem>
                      <SelectItem value="Rejected">
                        {t("status.Rejected", "Rejected")}
                      </SelectItem>
                      <SelectItem value="Completed">
                        {t("status.Completed", "Completed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {!isEdit && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="restock"
                  checked={restock}
                  onCheckedChange={(checked) => setRestock(!!checked)}
                />
                <Label htmlFor="restock">
                  {t("form.restockReturnedItems", "Restock returned items")}
                </Label>
              </div>
            )}

            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="typo-semibold-14">
                {t("form.totalRefundAmount", "Total Refund Amount")}
              </span>
              <span className="typo-bold-20">${refundAmount.toFixed(2)}</span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("form.cancel", "Cancel")}
              </Button>
              {!isEdit && (
                <Button type="submit">
                  {t("form.processReturn", "Process Return")}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Sale } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/features/settings/store";

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  sale,
}: InvoiceDetailsModalProps) {
  const { t } = useTranslation("sales");
  const settings = useSettingsStore();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-150 w-full flex flex-col gap-0 p-0 bg-card">
        <SheetHeader className="p-6 border-b border-border shrink-0 print:hidden text-foreground">
          <SheetTitle className="text-foreground">
            {t("invoice_modal.title")}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Invoice Content */}
        <div
          className="flex-1 overflow-y-auto bg-card"
          id="invoice-scroll-container"
        >
          <div
            id="invoice-content"
            className="p-6 md:p-8 space-y-8 bg-card print:p-0 print:m-0 print:border-none print:shadow-none print:w-full"
          >
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-border pb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t("invoice_modal.invoice")}
                </h1>
                <p className="text-sm font-medium text-muted-foreground">
                  #{sale.invoiceNo}
                </p>
              </div>
              <div className="text-right space-y-1 text-sm">
                <h2 className="font-semibold text-foreground">
                  {settings.storeName || "Aura POS Store"}
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {settings.storeAddress ||
                    "123 Fashion Street\nNew York, NY 10001"}
                </p>
                <p className="text-muted-foreground">
                  {settings.storeEmail || "support@aurapos.com"}
                </p>
                {settings.storePhone && (
                  <p className="text-muted-foreground">{settings.storePhone}</p>
                )}
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {t("invoice_modal.dateIssued")}
                  </p>
                  <p className="font-semibold text-foreground">
                    {sale.completedAt
                      ? format(new Date(sale.completedAt), "MMM dd, yyyy")
                      : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.completedAt
                      ? format(new Date(sale.completedAt), "hh:mm a")
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {t("invoice_modal.cashier")}
                  </p>
                  <p className="font-semibold text-foreground">
                    {sale.cashier?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-right md:text-left">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {t("invoice_modal.customer")}
                  </p>
                  <p className="font-semibold text-foreground">
                    {sale.customer?.name || t("invoice_modal.walkIn")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    {t("invoice_modal.paymentMethod")}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded bg-secondary font-medium text-secondary-foreground capitalize text-xs shadow-sm">
                    {sale.payments?.[0]?.method || t("invoice_modal.mixed")}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border rounded-lg overflow-hidden border-border shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-3 px-4">{t("invoice_modal.item")}</th>
                    <th className="py-3 px-4 text-right">
                      {t("invoice_modal.price")}
                    </th>
                    <th className="py-3 px-4 text-center">
                      {t("invoice_modal.qty")}
                    </th>
                    <th className="py-3 px-4 text-right">
                      {t("invoice_modal.total")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {sale.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">
                          {line.name}
                        </div>
                        {line.product?.categoryId && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {t("invoice_modal.ref")} {line.productId.slice(-6)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {settings.currencySymbol}
                        {Number(line.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {line.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        {settings.currencySymbol}
                        {(Number(line.unitPrice) * line.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("invoice_modal.subtotal")}
                  </span>
                  <span className="font-medium text-foreground">
                    {settings.currencySymbol}
                    {Number(sale.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("invoice_modal.tax")}
                  </span>
                  <span className="font-medium text-foreground">
                    {settings.currencySymbol}
                    {Number(sale.taxTotal).toFixed(2)}
                  </span>
                </div>
                {Number(sale.discountTotal) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("invoice_modal.discount")}
                    </span>
                    <span className="font-medium text-emerald-600">
                      -{settings.currencySymbol}
                      {Number(sale.discountTotal).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-foreground">
                    {t("invoice_modal.total")}
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {settings.currencySymbol}
                    {Number(sale.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center text-xs text-muted-foreground print:mt-12">
              <p>
                {settings.receiptFooter ||
                  `${t("invoice_modal.generatedBy")} ${settings.storeName || "Aura POS"}`}
              </p>
              <p className="mt-1 opacity-70">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 border-t border-border bg-muted/30 flex-row gap-3 sm:justify-end shrink-0 print:hidden">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1 sm:flex-none">
              {t("invoice_modal.close")}
            </Button>
          </SheetClose>
          <Button onClick={handlePrint} className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            {t("invoice_modal.print")}
          </Button>
        </SheetFooter>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-content,
            #invoice-content * {
              visibility: visible;
            }
            #invoice-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              margin: 0 !important;
              padding: 10mm !important;
              background: white !important;
            }
            @page {
              size: auto;
              margin: 0;
            }
            .sheet-overlay,
            .sheet-content {
              background: white !important;
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              overflow: visible !important;
              border: none !important;
              box-shadow: none !important;
              transform: none !important;
            }
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}

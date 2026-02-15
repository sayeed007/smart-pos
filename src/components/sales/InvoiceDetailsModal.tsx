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
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] w-full flex flex-col gap-0 p-0 bg-white">
        <SheetHeader className="p-6 border-b shrink-0 print:hidden">
          <SheetTitle>Invoice Details</SheetTitle>
        </SheetHeader>

        {/* Scrollable Invoice Content */}
        <div
          className="flex-1 overflow-y-auto bg-white"
          id="invoice-scroll-container"
        >
          <div
            id="invoice-content"
            className="p-6 md:p-8 space-y-8 bg-white print:p-0 print:m-0 print:border-none print:shadow-none print:w-full"
          >
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  INVOICE
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  #{sale.invoiceNo}
                </p>
              </div>
              <div className="text-right space-y-1 text-sm">
                <h2 className="font-semibold text-gray-900">Aura POS Store</h2>
                <p className="text-gray-500">123 Fashion Street</p>
                <p className="text-gray-500">New York, NY 10001</p>
                <p className="text-gray-500">support@aurapos.com</p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Date Issued
                  </p>
                  <p className="font-semibold text-gray-900">
                    {sale.completedAt
                      ? format(new Date(sale.completedAt), "MMM dd, yyyy")
                      : "-"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sale.completedAt
                      ? format(new Date(sale.completedAt), "hh:mm a")
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Cashier
                  </p>
                  <p className="font-semibold text-gray-900">
                    {sale.cashier?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-right md:text-left">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Customer
                  </p>
                  <p className="font-semibold text-gray-900">
                    {sale.customer?.name || "Walk-in Customer"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Payment Method
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 font-medium text-gray-900 capitalize text-xs">
                    {sale.payments?.[0]?.method || "Mixed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border rounded-lg overflow-hidden border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sale.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {line.name}
                        </div>
                        {line.product?.categoryId && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Ref: {line.productId.slice(-6)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        ${Number(line.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {line.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        ${(Number(line.unitPrice) * line.quantity).toFixed(2)}
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
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${Number(sale.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    ${Number(sale.taxTotal).toFixed(2)}
                  </span>
                </div>
                {Number(sale.discountTotal) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-emerald-600">
                      -${Number(sale.discountTotal).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${Number(sale.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center text-xs text-gray-400 print:mt-12">
              <p>Generated by Aura POS</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 border-t bg-gray-50 flex-row gap-3 sm:justify-end shrink-0 print:hidden">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1 sm:flex-none">
              Close
            </Button>
          </SheetClose>
          <Button onClick={handlePrint} className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
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

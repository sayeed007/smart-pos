import { useSettingsStore } from "@/features/settings/store";
import { Sale } from "@/types";
import { format } from "date-fns";

interface ReceiptTemplateProps {
  sale: Sale;
  reprint?: boolean;
}

export function ReceiptTemplate({ sale, reprint }: ReceiptTemplateProps) {
  const settings = useSettingsStore();

  // Build a proper receipt date from the sale data
  const receiptDate = (() => {
    // Try to build from sale.date + sale.time (e.g. "2026-02-15" + "14:30:00")
    if (sale.date && sale.time) {
      const parsed = new Date(`${sale.date}T${sale.time}`);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    // Fallback to current time
    return new Date();
  })();

  return (
    <div
      id="receipt-print-area"
      className="hidden print:block print:w-full print:h-auto text-black bg-white"
    >
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body * {
            visibility: hidden;
          }
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: ${settings.paperWidth === "80mm" ? "80mm" : "58mm"};
            padding: 4mm;
            font-size: 12px;
            line-height: 1.2;
          }
        }
      `}</style>

      <div className="text-center mb-4">
        <h1 className="uppercase typo-bold-18">{settings.storeName}</h1>
        <p className="typo-regular-12">{settings.storeAddress}</p>
        <p className="typo-regular-12">{settings.storePhone}</p>
        {settings.storeEmail && (
          <p className="typo-regular-12">{settings.storeEmail}</p>
        )}
      </div>

      <div className="text-center mb-2 pb-2 border-b border-black border-dashed">
        <p className="typo-bold-14">{settings.receiptHeader}</p>
        <div className="flex justify-between mt-1 typo-regular-12">
          <span>{format(receiptDate, "dd/MM/yyyy HH:mm")}</span>
          <span>#{sale.invoiceNo || sale.id.slice(-6)}</span>
        </div>
        {reprint && (
          <p className="uppercase mt-1 typo-bold-14">*** REPRINT ***</p>
        )}
      </div>

      {/* Items */}
      <div className="mb-2 pb-2 border-b border-black border-dashed">
        <div className="flex justify-between mb-1 typo-bold-12">
          <span className="w-1/2 text-left">Item</span>
          <span className="w-1/6 text-center">Qty</span>
          <span className="w-1/3 text-right">Total</span>
        </div>
        {(sale.lines || sale.items || []).map((item: any, idx) => (
          <div key={idx} className="flex justify-between mb-1 typo-regular-12">
            <span className="w-1/2 text-left truncate">{item.name}</span>
            <span className="w-1/6 text-center">{item.quantity}</span>
            <span className="w-1/3 text-right">
              {settings.currencySymbol}
              {(
                (item.unitPrice || item.sellingPrice || 0) * item.quantity
              ).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-4 pb-2 border-b border-black border-dashed space-y-1 text-right">
        <div className="flex justify-between typo-regular-12">
          <span>Subtotal:</span>
          <span>
            {settings.currencySymbol}
            {sale.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between typo-regular-12">
          <span>Tax ({settings.taxRate}%):</span>
          <span>
            {settings.currencySymbol}
            {(sale.tax || sale.taxTotal || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between typo-regular-12">
          <span>Discount:</span>
          <span>
            -{settings.currencySymbol}
            {(sale.discount || sale.discountTotal || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mt-2 typo-bold-14">
          <span>TOTAL:</span>
          <span>
            {settings.currencySymbol}
            {sale.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4 typo-regular-12">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="typo-bold-14">{sale.paymentMethod}</span>
        </div>
        {/* Split Payments Details if any */}
        {sale.payments &&
          sale.payments.map((p, i) => (
            <div key={i} className="flex justify-between text-gray-600 pl-2">
              <span>- {p.method}:</span>
              <span>
                {settings.currencySymbol}
                {p.amount.toFixed(2)}
              </span>
            </div>
          ))}
      </div>

      <div className="text-center typo-regular-12">
        <p className="whitespace-pre-wrap">{settings.receiptFooter}</p>
        <p className="mt-2 text-[10px]">Powered by Aura POS</p>
      </div>

      {/* Cut line visual (optional) */}
      <div className="mt-4 text-center text-[10px] text-gray-400">
        . . . . . . . . . . . . .
      </div>
    </div>
  );
}

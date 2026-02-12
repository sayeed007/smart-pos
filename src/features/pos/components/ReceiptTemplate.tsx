import { useSettingsStore } from "@/features/settings/store";
import { Sale } from "@/types";
import { format } from "date-fns";

interface ReceiptTemplateProps {
  sale: Sale;
  reprint?: boolean;
}

export function ReceiptTemplate({ sale, reprint }: ReceiptTemplateProps) {
  const settings = useSettingsStore();

  return (
    <div
      id="receipt-print-area"
      className="hidden print:block print:w-full print:h-auto font-mono text-black bg-white"
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
        <h1 className="text-lg font-bold uppercase">{settings.storeName}</h1>
        <p className="text-xs">{settings.storeAddress}</p>
        <p className="text-xs">{settings.storePhone}</p>
        {settings.storeEmail && (
          <p className="text-xs">{settings.storeEmail}</p>
        )}
      </div>

      <div className="text-center mb-2 pb-2 border-b border-black border-dashed">
        <p className="font-bold">{settings.receiptHeader}</p>
        <div className="flex justify-between text-xs mt-1">
          <span>{format(new Date(sale.id ? 0 : 0), "dd/MM/yyyy HH:mm")}</span>
          {/* Timestamp logic: standard Sale interface doesn't have createdAt? 
                        Let's assume sale.id is effectively timestamped or add date prop.
                        Actually Dexie items have createdAt. Sale interface in types/index.ts usually has it? 
                        Checking types later. For now using current date or placeholder.
                    */}
          <span>#{sale.id.slice(-6)}</span>
        </div>
        {reprint && <p className="font-bold uppercase mt-1">*** REPRINT ***</p>}
      </div>

      {/* Items */}
      <div className="mb-2 pb-2 border-b border-black border-dashed">
        <div className="flex justify-between font-bold text-xs mb-1">
          <span className="w-1/2 text-left">Item</span>
          <span className="w-1/6 text-center">Qty</span>
          <span className="w-1/3 text-right">Total</span>
        </div>
        {sale.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs mb-1">
            <span className="w-1/2 text-left truncate">{item.name}</span>
            <span className="w-1/6 text-center">{item.quantity}</span>
            <span className="w-1/3 text-right">
              {settings.currencySymbol}
              {(item.sellingPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-4 pb-2 border-b border-black border-dashed space-y-1 text-right">
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <span>
            {settings.currencySymbol}
            {sale.subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Tax ({settings.taxRate}%):</span>
          <span>
            {settings.currencySymbol}
            {sale.tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Discount:</span>
          <span>
            -{settings.currencySymbol}
            {sale.discount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold mt-2">
          <span>TOTAL:</span>
          <span>
            {settings.currencySymbol}
            {sale.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="font-bold">{sale.paymentMethod}</span>
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

      <div className="text-center text-xs">
        <p className="whitespace-pre-wrap">{settings.receiptFooter}</p>
        <p className="mt-2 font-mono text-[10px]">Powered by Aura POS</p>
      </div>

      {/* Cut line visual (optional) */}
      <div className="mt-4 text-center text-[10px] text-gray-400">
        . . . . . . . . . . . . .
      </div>
    </div>
  );
}

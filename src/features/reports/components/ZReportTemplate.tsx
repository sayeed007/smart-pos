import { useSettingsStore } from "@/features/settings/store";
import { format } from "date-fns";
import { CashShift } from "@/lib/db";

interface ZReportProps {
  shift: CashShift;
  salesSummary: {
    totalSales: number;
    cashSales: number;
    cardSales: number;
    refunds: number;
    tax: number;
    discount: number;
  };
  print?: boolean;
}

export function ZReportTemplate({
  shift,
  salesSummary,
  print = false,
}: ZReportProps) {
  const settings = useSettingsStore();

  return (
    <div
      id="z-report-print-area"
      className={`${print ? "hidden print:block" : ""} font-mono text-black bg-white p-4`}
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
          #z-report-print-area,
          #z-report-print-area * {
            visibility: visible;
          }
          #z-report-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 4mm;
            font-size: 12px;
            line-height: 1.2;
          }
        }
      `}</style>

      <div className="text-center mb-4 border-b border-black border-dashed pb-2">
        <h1 className="text-lg font-bold uppercase">Z-REPORT</h1>
        <h2 className="text-md font-bold">{settings.storeName}</h2>
        <p className="text-xs">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        <p className="text-xs">Shift ID: #{shift.id.slice(0, 8)}</p>
        <p className="text-xs">Cashier: {shift.cashierId}</p>
      </div>

      <div className="mb-4 text-xs space-y-1 border-b border-black border-dashed pb-2">
        <div className="flex justify-between font-bold">
          <span>Shift Start:</span>
          <span>{format(new Date(shift.startTime), "HH:mm")}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Shift End:</span>
          <span>
            {shift.endTime ? format(new Date(shift.endTime), "HH:mm") : "NOW"}
          </span>
        </div>
      </div>

      <div className="mb-4 text-xs space-y-1 border-b border-black border-dashed pb-2">
        <h3 className="font-bold underline mb-2">SALES SUMMARY</h3>
        <div className="flex justify-between">
          <span>Total Revenue:</span>
          <span>
            {settings.currencySymbol}
            {salesSummary.totalSales.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax Collected:</span>
          <span>
            {settings.currencySymbol}
            {salesSummary.tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Discounts:</span>
          <span>
            -{settings.currencySymbol}
            {salesSummary.discount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Returns/Refunds:</span>
          <span>
            -{settings.currencySymbol}
            {salesSummary.refunds.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mb-4 text-xs space-y-1 border-b border-black border-dashed pb-2">
        <h3 className="font-bold underline mb-2">PAYMENT BREAKDOWN</h3>
        <div className="flex justify-between">
          <span>Cash Sales:</span>
          <span>
            {settings.currencySymbol}
            {salesSummary.cashSales.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Card Sales:</span>
          <span>
            {settings.currencySymbol}
            {salesSummary.cardSales.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mb-4 text-xs space-y-1 border-b border-black border-dashed pb-2">
        <h3 className="font-bold underline mb-2">CASH DRAW RECONCILIATION</h3>
        <div className="flex justify-between">
          <span>Opening Float:</span>
          <span>
            {settings.currencySymbol}
            {shift.startAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>+ Cash Sales:</span>
          <span>
            {settings.currencySymbol}
            {salesSummary.cashSales.toFixed(2)}
          </span>
        </div>
        {/* <div className="flex justify-between">
                    <span>- Cash Drops:</span>
                    <span>$0.00</span>
                </div> */}
        <div className="flex justify-between font-bold mt-1 border-t border-gray-400 pt-1">
          <span>Expected Cash:</span>
          <span>
            {settings.currencySymbol}
            {(shift.startAmount + salesSummary.cashSales).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Actual Count:</span>
          <span>
            {settings.currencySymbol}
            {(shift.endAmount || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-bold mt-1">
          <span>Discrepancy:</span>
          <span
            className={
              (shift.endAmount || 0) -
                (shift.startAmount + salesSummary.cashSales) <
              0
                ? "text-red-500"
                : "text-black"
            }
          >
            {settings.currencySymbol}
            {(
              (shift.endAmount || 0) -
              (shift.startAmount + salesSummary.cashSales)
            ).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="text-center text-xs mt-4">
        <p>*** END OF SHIFT ***</p>
        <p className="mt-2 font-mono text-[10px]">Powered by Aura POS</p>
      </div>

      <div className="mt-4 text-center text-[10px] text-gray-400">
        . . . . . . . . . . . . .
      </div>
    </div>
  );
}

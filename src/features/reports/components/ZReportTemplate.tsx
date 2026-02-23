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
      className={`${print ? "hidden print:block" : ""} text-black bg-white p-4`}
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
        <h1 className="uppercase typo-bold-18">Z-REPORT</h1>
        <h2 className="text-md typo-bold-14">{settings.storeName}</h2>
        <p className="typo-regular-12">
          {format(new Date(), "dd/MM/yyyy HH:mm")}
        </p>
        <p className="typo-regular-12">Shift ID: #{shift.id.slice(0, 8)}</p>
        <p className="typo-regular-12">Cashier: {shift.cashierId}</p>
      </div>

      <div className="mb-4 space-y-1 border-b border-black border-dashed pb-2 typo-regular-12">
        <div className="flex justify-between typo-bold-14">
          <span>Shift Start:</span>
          <span>{format(new Date(shift.startTime), "HH:mm")}</span>
        </div>
        <div className="flex justify-between typo-bold-14">
          <span>Shift End:</span>
          <span>
            {shift.endTime ? format(new Date(shift.endTime), "HH:mm") : "NOW"}
          </span>
        </div>
      </div>

      <div className="mb-4 space-y-1 border-b border-black border-dashed pb-2 typo-regular-12">
        <h3 className="underline mb-2 typo-bold-14">SALES SUMMARY</h3>
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

      <div className="mb-4 space-y-1 border-b border-black border-dashed pb-2 typo-regular-12">
        <h3 className="underline mb-2 typo-bold-14">PAYMENT BREAKDOWN</h3>
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

      <div className="mb-4 space-y-1 border-b border-black border-dashed pb-2 typo-regular-12">
        <h3 className="underline mb-2 typo-bold-14">
          CASH DRAW RECONCILIATION
        </h3>
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
        <div className="flex justify-between mt-1 border-t border-gray-400 pt-1 typo-bold-14">
          <span>Expected Cash:</span>
          <span>
            {settings.currencySymbol}
            {(shift.startAmount + salesSummary.cashSales).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between typo-bold-14">
          <span>Actual Count:</span>
          <span>
            {settings.currencySymbol}
            {(shift.endAmount || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mt-1 typo-bold-14">
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

      <div className="text-center mt-4 typo-regular-12">
        <p>*** END OF SHIFT ***</p>
        <p className="mt-2 typo-regular-10">Powered by Aura POS</p>
      </div>

      <div className="mt-4 text-center text-gray-400 typo-regular-10">
        . . . . . . . . . . . . .
      </div>
    </div>
  );
}

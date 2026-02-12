"use client";
import { useState, useEffect } from "react";
import { useCashStore } from "@/features/cash/store";
import { usePOSStore } from "@/features/pos/store/pos-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { api } from "@/lib/axios";
import { ZReportTemplate } from "@/features/reports/components/ZReportTemplate";

export function CashManagementModal() {
  const { currentShift, openShift, closeShift, checkCurrentShift } =
    useCashStore();
  const { setModal } = usePOSStore();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"input" | "report">("input");
  const [salesSummary, setSalesSummary] = useState<any>(null);

  useEffect(() => {
    checkCurrentShift();
  }, []);

  const handleAction = async () => {
    if (!amount) return;
    const val = parseFloat(amount);

    if (currentShift) {
      if (step === "input") {
        setLoading(true);
        try {
          // Fetch sales for this shift
          // For P1 MVP, we fetch all sales and filter client-side.
          // In production, use start_date query param.
          const { data: sales } = await api.get("/sales");

          // Filter sales that happened after shift start
          // Note: Ensure date comparison uses consistent ISO strings or timestamps
          const shiftSales = sales.filter((s: any) => {
            const saleDate = new Date(s.createdAt || s.date); // Handle different naming conventions
            return saleDate >= new Date(currentShift.startTime);
          });

          // Calculate summary
          const summary = {
            totalSales: shiftSales.reduce(
              (acc: number, s: any) => acc + s.total,
              0,
            ),
            cashSales: shiftSales
              .filter((s: any) => s.paymentMethod === "Cash")
              .reduce((acc: number, s: any) => acc + s.total, 0),
            cardSales: shiftSales
              .filter((s: any) => s.paymentMethod === "Card")
              .reduce((acc: number, s: any) => acc + s.total, 0),
            refunds: 0, // TODO: Filter 'Returned' status if available
            tax: shiftSales.reduce((acc: number, s: any) => acc + s.tax, 0),
            discount: shiftSales.reduce(
              (acc: number, s: any) => acc + (s.discount || 0),
              0,
            ),
          };
          setSalesSummary(summary);
          setStep("report");
        } catch (e) {
          console.error("Failed to generate Z-Report", e);
          // Fallback: Proceed to close without report if API fails
          await closeShift(val);
          setModal("none");
        }
        setLoading(false);
        return;
      }

      // Step = Report, final confirm
      setLoading(true);
      await closeShift(val);

      // Trigger print for the report
      window.print();

      setLoading(false);
      setModal("none");
    } else {
      setLoading(true);
      await openShift(val, "u1");
      setLoading(false);
      setModal("none");
    }
  };

  if (step === "report" && currentShift && salesSummary) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-[400px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 text-center">
          Shift Report Preview
        </h3>

        {/* Preview Area */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4 font-mono text-sm max-h-[50vh] overflow-y-auto">
          <ZReportTemplate
            shift={{ ...currentShift, endAmount: parseFloat(amount) }}
            salesSummary={salesSummary}
          />
        </div>

        <div className="space-y-4">
          <Button
            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 text-white"
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? "Closing..." : "Confirm Close & Print"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep("input")}
          >
            Back
          </Button>
        </div>

        {/* Hidden Print Area */}
        <div className="hidden print:block">
          <ZReportTemplate
            shift={{
              ...currentShift,
              endAmount: parseFloat(amount),
              endTime: new Date().toISOString(),
            }}
            salesSummary={salesSummary}
            print={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-[400px]">
      <h3 className="text-xl font-black text-gray-900 tracking-tight mb-4 text-center">
        {currentShift ? "Close Shift" : "Open Shift"}
      </h3>

      {currentShift && (
        <div className="mb-4 text-sm text-center bg-gray-50 p-3 rounded-lg">
          <p>
            Shift started: {format(new Date(currentShift.startTime), "PP p")}
          </p>
          <p>Opening Balance: ${currentShift.startAmount.toFixed(2)}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">
            {currentShift ? "Closing Cash Count" : "Opening Float Amount"}
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-lg font-bold"
            autoFocus
          />
        </div>

        <Button
          className="w-full h-12 text-lg"
          onClick={handleAction}
          disabled={loading || !amount}
        >
          {loading
            ? "Processing..."
            : currentShift
              ? "Generate Z-Report"
              : "Start Shift"}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setModal("none")}
        >
          Cancel
        </Button>
      </div>

      {/* Hidden Print Area that only shows when printing */}
      {step === "report" && salesSummary && currentShift && (
        <div className="hidden print:block">
          <ZReportTemplate
            shift={{
              ...currentShift,
              endAmount: parseFloat(amount),
              endTime: new Date().toISOString(),
            }}
            salesSummary={salesSummary}
            print={true}
          />
        </div>
      )}
    </div>
  );
}

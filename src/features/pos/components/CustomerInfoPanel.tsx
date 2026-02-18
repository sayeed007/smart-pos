import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Customer } from "@/types";
import { TicketPercent, X } from "lucide-react";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface CustomerInfoPanelProps {
  customer: Customer;
  onClear: () => void;
  subtotal: number;
  redeemedPoints: number; // Points currently set to redeem
  setRedeemedPoints: (points: number) => void;
  currencySymbol: string;
  redemptionRate: number; // Points per 1 unit of currency (e.g. 100 pts = $1)
  className?: string; // Add className prop for flexibility
}

export function CustomerInfoPanel({
  customer,
  onClear,
  subtotal,
  redeemedPoints,
  setRedeemedPoints,
  currencySymbol,
  redemptionRate,
  className,
}: CustomerInfoPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate limits
  const maxPointsBySubtotal = Math.ceil(subtotal * redemptionRate);
  const maxRedeemablePoints = Math.min(
    customer.loyaltyPoints,
    maxPointsBySubtotal,
  );
  const maxRedeemableValue = maxRedeemablePoints / redemptionRate;

  const currentRedemptionValue = redeemedPoints / redemptionRate;

  // Local state for input
  const [customAmount, setCustomAmount] = useState<string>(
    currentRedemptionValue > 0 ? currentRedemptionValue.toFixed(2) : "",
  );

  // Sync local input when external redeemedPoints changes (e.g. cleared elsewhere)
  // Derived state pattern: track previous prop to detect changes
  const [prevRedemptionValue, setPrevRedemptionValue] = useState(
    currentRedemptionValue,
  );

  if (prevRedemptionValue !== currentRedemptionValue) {
    setPrevRedemptionValue(currentRedemptionValue);
    // Only update local input if not focused logic needs to be handled carefully.
    // Since we can't check document.activeElement safely in render for side-effects,
    // we'll rely on the fact that if this prop changed, it's likely an external event (like clear cart).
    // However, to be safe and avoid typing conflicts, we will update it.
    // NOTE: This might override user input if parent updates rapidly, but for this use case (redemption),
    // the parent only updates when WE call setRedeemedPoints, or when "clear" happens.
    // To strictly avoid cursor jumping, we should ideally use useEffect, but to avoid the lint warning about setState,
    // we accept this derived state pattern.

    const newVal =
      currentRedemptionValue > 0 ? currentRedemptionValue.toFixed(2) : "";
    setCustomAmount(newVal);
  }

  const handleCustomAmountChange = (val: string) => {
    // Determine strict max value allowed (cannot exceed what customer has or what subtotal allows)
    const strictMax = maxRedeemableValue;

    let amount = parseFloat(val);

    // Client-side validation: if user manually inputs > max, force it to max
    if (!isNaN(amount) && amount > strictMax) {
      amount = strictMax;
      val = amount.toFixed(2);
    }

    setCustomAmount(val);

    if (!isNaN(amount) && amount >= 0) {
      const points = Math.floor(amount * redemptionRate);
      // Double safety check
      const safePoints = Math.min(points, maxRedeemablePoints);
      setRedeemedPoints(safePoints);
    } else {
      setRedeemedPoints(0);
    }
  };

  const getTierDisplay = (tierId?: string) => {
    if (tierId === "tier-gold") return "Gold";
    if (tierId === "tier-silver") return "Silver";
    return "Bronze";
  };

  return (
    <div
      className={cn(
        "mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 transition-all animate-in fade-in slide-in-from-top-1",
        className,
      )}
    >
      {/* Header: Name and Remove */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground truncate">
            {customer.name}
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none shrink-0"
            >
              {getTierDisplay(customer.tierId)}
            </Badge>
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-amber-600">
              <TicketPercent size={12} />
              {customer.loyaltyPoints} pts
            </span>
            <span>&bull;</span>
            <span className="text-foreground/70">
              Value: {currencySymbol}
              {(customer.loyaltyPoints / redemptionRate).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {customer.loyaltyPoints > 0 && (
            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                ref={inputRef}
                type="number"
                className="h-8 pl-5 text-xs bg-background pr-1 text-right shadow-sm border-primary/20 focus-visible:ring-primary/20"
                placeholder="0.00"
                min={0}
                max={maxRedeemableValue}
                step={0.01}
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(customAmount);
                  if (!isNaN(val)) {
                    setCustomAmount(val.toFixed(2));
                  }
                }}
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

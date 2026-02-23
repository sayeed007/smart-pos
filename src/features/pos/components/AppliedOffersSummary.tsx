import { Offer } from "@/types";
import { TicketPercent, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface AppliedOffersSummaryProps {
  appliedOffers: Offer[];
  potentialOffers: Offer[];
  offerDiscount: number;
  currencySymbol: string;
  className?: string;
  excludedOfferIds: string[];
  onToggleOffer: (offerId: string) => void;
  onSetExcluded: (ids: string[]) => void;
}

export function AppliedOffersSummary({
  appliedOffers,
  potentialOffers,
  offerDiscount,
  currencySymbol,
  className,
  excludedOfferIds,
  onToggleOffer,
  onSetExcluded,
}: AppliedOffersSummaryProps) {
  // If no offers are available at all, hide component
  if (potentialOffers.length === 0) return null;

  // Construct summary text for APPLIED offers only
  let summaryText = "";
  if (appliedOffers.length === 0) {
    summaryText = "No offers applied";
  } else if (appliedOffers.length <= 2) {
    summaryText = appliedOffers.map((o) => o.name).join(", ");
  } else {
    const firstTwo = appliedOffers
      .slice(0, 2)
      .map((o) => o.name)
      .join(", ");
    summaryText = `${firstTwo} and ${appliedOffers.length - 2} others`;
  }

  const allSelected = excludedOfferIds.length === 0;

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all: Exclude all potential offers
      onSetExcluded(potentialOffers.map((o) => o.id));
    } else {
      // Select all: Clear exclusions
      onSetExcluded([]);
    }
  };

  return (
    <div
      className={cn(
        "bg-emerald-50/50 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-bottom-2",
        className,
      )}
    >
      <Popover>
        <PopoverTrigger asChild className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-2 hover:bg-emerald-100/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
              <div className="bg-emerald-100 text-emerald-600 p-1 rounded-md shrink-0">
                <TicketPercent size={14} />
              </div>
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span
                  className={cn(
                    "truncate typo-medium-12",
                    appliedOffers.length === 0
                      ? "text-muted-foreground"
                      : "text-emerald-900",
                  )}
                >
                  {summaryText}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-emerald-700 typo-bold-12">
                -{currencySymbol}
                {offerDiscount.toFixed(2)}
              </span>
              <ChevronRight
                size={14}
                className="text-emerald-400 group-hover:text-emerald-600 transition-colors"
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
          side="bottom"
        >
          <div className="p-3 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="flex items-center gap-2 typo-medium-14">
                <TicketPercent size={14} className="text-emerald-600" />
                Available Offers
              </h4>
              <span className="text-emerald-700 typo-bold-14">
                -{currencySymbol}
                {offerDiscount.toFixed(2)}
              </span>
            </div>

            <Button
              variant="ghost"
              onClick={handleToggleAll}
              className="h-auto p-0 hover:bg-transparent text-[10px] text-primary/80 hover:text-primary hover:underline transition-colors uppercase tracking-wider flex items-center gap-1 typo-semibold-14"
            >
              {allSelected ? (
                <>
                  <span>Unselect All</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 border border-current rounded flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-current rounded-[1px]" />
                  </div>
                  <span>Select All</span>
                </>
              )}
            </Button>
          </div>
          <div className="max-h-75 overflow-y-auto p-1.5 space-y-1">
            {potentialOffers.map((offer) => {
              const isApplied = !excludedOfferIds.includes(offer.id);
              return (
                <div
                  key={offer.id}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-md transition-colors cursor-pointer hover:bg-muted/50 typo-regular-14",
                    !isApplied && "opacity-75",
                  )}
                  onClick={() => onToggleOffer(offer.id)}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex items-center justify-center w-4 h-4 rounded border",
                      isApplied
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-muted-foreground bg-transparent",
                    )}
                  >
                    {isApplied && <Check size={10} />}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "typo-medium-12",
                        isApplied ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {offer.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                      {offer.description || "Discount available"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

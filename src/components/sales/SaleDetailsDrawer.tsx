import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerImage } from "@/components/ui/server-image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sale } from "@/types";
import { format } from "date-fns";
import { ArrowRightLeft, Clock, FileText, Package, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SaleDetailsDrawerProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onReturn: (saleId: string) => void;
  onViewInvoice: (saleId: string) => void;
}

export function SaleDetailsDrawer({
  sale,
  isOpen,
  onClose,
  onReturn,
  onViewInvoice,
}: SaleDetailsDrawerProps) {
  const { t } = useTranslation(["sales", "common"]);

  if (!sale) return null;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-500 border-emerald-200";
      case "RETURNED":
        return "bg-red-50 text-red-500 border-red-200";
      case "VOIDED":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold tracking-tight">
              {sale.invoiceNo}
            </SheetTitle>
            <Badge
              variant="outline"
              className={getStatusColor(sale.status || "COMPLETED")}
            >
              {t(`status.${(sale.status || "completed").toLowerCase()}`)}
            </Badge>
          </div>
          <SheetDescription className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground typo-regular-14">
              {sale.completedAt
                ? format(new Date(sale.completedAt), "MMM dd, yyyy - hh:mm a")
                : t("common:unknown_date", "Unknown Date")}
            </span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="bg-muted/30 rounded-lg p-4 border flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                  {t("drawer.customer", "Customer")}
                </span>
                <span className="font-medium text-foreground">
                  {sale.customer?.name ||
                    t("table.walkInCustomer", "Walk-in Customer")}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                {t("drawer.items", "Order Items")}
              </h3>
              <div className="space-y-4">
                {sale.lines?.map((line) => (
                  <div key={line.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-md border flex items-center justify-center bg-muted shrink-0 overflow-hidden">
                      {line.product?.imageUrl ? (
                        <ServerImage
                          src={line.product.imageUrl}
                          alt={line.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5 flex flex-col justify-start">
                      <span className="font-medium text-sm leading-tight text-foreground line-clamp-2">
                        {line.name}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        ${Number(line.unitPrice).toFixed(2)} x {line.quantity}
                      </span>
                    </div>
                    <div className="pt-0.5 font-semibold text-sm">
                      ${(Number(line.unitPrice) * line.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-4 space-y-2 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("drawer.subtotal", "Subtotal")}
                  </span>
                  <span className="font-medium">
                    ${Number(sale.subtotal).toFixed(2)}
                  </span>
                </div>
                {Number(sale.discountTotal) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("drawer.discount", "Discount")}
                    </span>
                    <span className="font-medium text-orange-500">
                      -${Number(sale.discountTotal).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(sale.taxTotal) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("drawer.tax", "Tax")}
                    </span>
                    <span className="font-medium">
                      ${Number(sale.taxTotal).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 bg-muted/20 flex justify-between items-center">
                <span className="font-semibold text-foreground">
                  {t("drawer.total", "Total Paid")}
                </span>
                <span className="text-xl font-bold text-foreground">
                  ${Number(sale.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            {sale.payments && sale.payments.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <span className="font-medium">
                  {t("drawer.paymentMethod", "Payment:")}
                </span>
                <span>{sale.payments[0].method}</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-background flex sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onClose();
              onViewInvoice(sale.id);
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t("drawer.viewInvoice", "Invoice")}
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              onClose();
              onReturn(sale.id);
            }}
            disabled={sale.status?.toUpperCase() === "RETURNED"}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {t("drawer.processReturn", "Return")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


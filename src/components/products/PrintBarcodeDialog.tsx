import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ServerImage } from "@/components/ui/server-image";
import { Product } from "@/types";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";

interface PrintBarcodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  variantSelections: Record<
    string,
    { checked: boolean; qty: number; disabled: boolean }
  >;
  setVariantSelections: React.Dispatch<
    React.SetStateAction<
      Record<string, { checked: boolean; qty: number; disabled: boolean }>
    >
  >;
  simpleQty: number;
  setSimpleQty: (qty: number) => void;
  selectAllState: boolean | "indeterminate";
  variantSelectionStats: { selectableCount: number; selectedCount: number };
  handleSelectAllVariants: (checked: boolean) => void;
  canPrint: boolean;
  handlePrint: () => void;
  resolveBarcode: (barcode?: string, barcodes?: string[]) => string;
}

export function PrintBarcodeDialog({
  open,
  onOpenChange,
  product,
  variantSelections,
  setVariantSelections,
  simpleQty,
  setSimpleQty,
  selectAllState,
  variantSelectionStats,
  handleSelectAllVariants,
  canPrint,
  handlePrint,
  resolveBarcode,
}: PrintBarcodeDialogProps) {
  const { t } = useTranslation("products");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("printBarcode.title", "Print Barcodes")}</DialogTitle>
        </DialogHeader>

        {product ? (
          product.type === "variable" ? (
            <div className="space-y-3">
              {(product.variants || []).length === 0 && (
                <p className="text-muted-foreground typo-regular-14">
                  {t("printBarcode.noVariants", "No variants available.")}
                </p>
              )}
              {(product.variants || []).length > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectAllState}
                      disabled={variantSelectionStats.selectableCount === 0}
                      onCheckedChange={(checked) =>
                        handleSelectAllVariants(checked === true)
                      }
                    />
                    <span className="text-muted-foreground typo-regular-14">
                      {t("printBarcode.selectAll", "Select all")}
                    </span>
                  </div>
                  <span className="text-muted-foreground typo-regular-12">
                    {t("printBarcode.selected", {
                      count: variantSelectionStats.selectedCount,
                      total: variantSelectionStats.selectableCount,
                      defaultValue: `${variantSelectionStats.selectedCount}/${variantSelectionStats.selectableCount} selected`,
                    })}
                  </span>
                </div>
              )}
              {(product.variants || []).map((variant) => {
                const selection = variantSelections[variant.id];
                const barcode = resolveBarcode(
                  variant.barcode,
                  variant.barcodes,
                );
                return (
                  <div
                    key={variant.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <Checkbox
                      checked={selection?.checked || false}
                      disabled={selection?.disabled}
                      onCheckedChange={(checked) =>
                        setVariantSelections((prev) => ({
                          ...prev,
                          [variant.id]: {
                            checked: checked === true,
                            qty: prev[variant.id]?.qty || 1,
                            disabled: prev[variant.id]?.disabled || false,
                          },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <p className="typo-semibold-14">{variant.name}</p>
                      <p className="text-muted-foreground typo-regular-12">
                        {variant.sku || "-"} -{" "}
                        {barcode || t("printBarcode.noBarcode", "No barcode")}
                      </p>
                    </div>
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={selection?.qty || 1}
                      disabled={selection?.disabled || false}
                      onChange={(e) =>
                        setVariantSelections((prev) => ({
                          ...prev,
                          [variant.id]: {
                            checked: prev[variant.id]?.checked ?? true,
                            qty: Math.max(
                              1,
                              Math.floor(Number(e.target.value) || 1),
                            ),
                            disabled: prev[variant.id]?.disabled || false,
                          },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                  {product.image ? (
                    <ServerImage
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="typo-semibold-14">{product.name}</p>
                  <p className="text-muted-foreground typo-regular-12">
                    {product.sku || "-"} -{" "}
                    {resolveBarcode(product.barcode, product.barcodes) ||
                      t("printBarcode.noBarcode", "No barcode")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground typo-regular-14">
                  {t("printBarcode.copies", "Copies")}
                </span>
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  value={simpleQty}
                  onChange={(e) =>
                    setSimpleQty(
                      Math.max(1, Math.floor(Number(e.target.value) || 1)),
                    )
                  }
                />
              </div>
              {!resolveBarcode(product.barcode, product.barcodes) && (
                <p className="text-destructive typo-regular-12">
                  {t(
                    "printBarcode.missingBarcode",
                    "No barcode available for this product.",
                  )}
                </p>
              )}
            </div>
          )
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("printBarcode.cancel", "Cancel")}
          </Button>
          <PrimaryActionButton onClick={handlePrint} disabled={!canPrint}>
            {t("printBarcode.print", "Print")}
          </PrimaryActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

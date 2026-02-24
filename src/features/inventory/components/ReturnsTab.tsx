"use client";

import { ReturnFormModal } from "@/components/returns/ReturnFormModal";
import { ReturnListTable } from "@/components/returns/ReturnListTable";
import { InvoiceDetailsModal } from "@/components/sales/InvoiceDetailsModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { useCreateReturn, useReturns } from "@/hooks/api/returns";
import { useSale } from "@/hooks/api/sales";
import { Return } from "@/types";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function ReturnsTab({ locationId }: { locationId: string }) {
  const { t } = useTranslation(["returns", "common"]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");

  const queryParams = {
    page,
    limit: pageSize,
    search: search || undefined,
    locationId,
  };
  const { data: returnsData, isLoading } = useReturns(queryParams);

  const createReturnMutation = useCreateReturn();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [returnToDelete, setReturnToDelete] = useState<Return | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data: saleDetails } = useSale(selectedSaleId || "");

  // Raw backend shapes
  type RawReturnLine = {
    saleLineId: string;
    quantity: number | string;
    refundAmount: number | string;
    product?: { name?: string; sku?: string };
  };

  type RawReturn = {
    id: string;
    saleId: string;
    invoiceNo?: string;
    createdAt: string;
    refundTotal: number | string;
    reason: string;
    status: string;
    processedBy: string;
    sale?: { invoiceNo?: string };
    customer?: { name?: string };
    lines?: RawReturnLine[];
  };

  // Map API response to UI model
  const returns: Return[] = (returnsData?.data || []).map(
    (ret: RawReturn): Return => ({
      id: ret.id,
      saleId: ret.saleId,
      invoiceNo: ret.invoiceNo || ret.sale?.invoiceNo || "N/A",
      date: ret.createdAt,
      // Map items from return lines
      items: (ret.lines || []).map((line: RawReturnLine) => ({
        id: line.saleLineId,
        name: line.product?.name || t("form.unknownProduct", "Unknown Product"),
        quantity: Number(line.quantity),
        sellingPrice: Number(line.refundAmount) / Number(line.quantity), // Approximate unit price from total
        sku: line.product?.sku || "",
        barcode: "",
        categoryId: "",
        costPrice: 0,
        taxRate: 0,
        stockQuantity: 0,
        minStockLevel: 0,
        status: "active",
        type: "simple",
      })),
      refundAmount: Number(ret.refundTotal),
      reason: ret.reason,
      // Backend returns "PENDING", frontend expects "Pending" (Case mapping)
      status: (ret.status.charAt(0).toUpperCase() +
        ret.status.slice(1).toLowerCase()) as Return["status"],
      processedBy: ret.processedBy,
      customerName:
        ret.customer?.name || t("form.walkInCustomer", "Walk-in Customer"),
    }),
  );

  const handleCreateReturn = (
    data: Partial<Return> & { restock?: boolean },
  ) => {
    if (!data.saleId || !data.items) {
      toast.error(t("validation.invalidData", "Invalid return data"));
      return;
    }

    createReturnMutation.mutate(
      {
        saleId: data.saleId,
        reason: data.reason || "",
        restock: data.restock,
        lines: data.items.map((item) => ({
          saleLineId: item.id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          toast.success(
            t("validation.success", "Return processed successfully"),
          );
          setIsModalOpen(false);
        },
        onError: (err) => {
          toast.error(
            t(
              "validation.failure",
              "Failed to process return. Ensure sale exists.",
            ),
          );
          console.error(err);
        },
      },
    );
  };

  const handleUpdateReturn = (data: Partial<Return>) => {
    // Update not implemented in backend yet (only Create).
    console.info(data);
    toast.info(
      t("validation.updateComingSoon", "Update return feature coming soon"),
    );
    setIsModalOpen(false);
  };

  const handleDeleteReturn = (ret: Return) => {
    setReturnToDelete(ret);
  };

  const handleInvoiceOpen = (ret: Return) => {
    if (!ret.saleId) {
      toast.error(t("validation.noSale", "Sale not found for this return"));
      return;
    }
    setSelectedSaleId(ret.saleId);
    setInvoiceOpen(true);
  };

  const confirmDeleteReturn = () => {
    // Delete not implemented in backend yet.
    toast.info(
      t("validation.deleteComingSoon", "Delete return feature coming soon"),
    );
    setReturnToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.returns", "Returns")}</CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchPlaceholder", "Search returns...")}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PrimaryActionButton
            onClick={() => {
              setSelectedReturn(null);
              setIsModalOpen(true);
            }}
            icon={Plus}
          >
            {t("addReturn", "Create Return")}
          </PrimaryActionButton>
        </div>
      </CardHeader>

      <CardContent>
        <ReturnListTable
          returns={returns}
          isLoading={isLoading}
          onDelete={handleDeleteReturn}
          onInvoiceClick={handleInvoiceOpen}
        />

        <div className="flex items-center justify-end space-x-2 py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <span className="text-muted-foreground px-4 typo-medium-14">
                  {t("page", {
                    current: returnsData?.meta?.page || 1,
                    total: returnsData?.meta?.totalPages || 1,
                  })}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const totalPages = Math.ceil(
                      (returnsData?.meta.total || 0) / pageSize,
                    );
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={
                    page >= Math.ceil((returnsData?.meta.total || 0) / pageSize)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>

      {isModalOpen && (
        <ReturnFormModal
          isOpen={isModalOpen}
          initialData={selectedReturn}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReturn(null);
          }}
          onSubmit={selectedReturn ? handleUpdateReturn : handleCreateReturn}
        />
      )}

      <ConfirmationDialog
        open={!!returnToDelete}
        onOpenChange={(open) => !open && setReturnToDelete(null)}
        title={t("deleteTitle", "Delete Return?")}
        description={t("deleteDescription", {
          invoiceNo: returnToDelete?.invoiceNo || "",
        })}
        onConfirm={confirmDeleteReturn}
        confirmLabel={t("deleteButton", "Delete")}
        variant="destructive"
      />

      <InvoiceDetailsModal
        isOpen={invoiceOpen}
        onClose={() => {
          setInvoiceOpen(false);
          setSelectedSaleId(null);
        }}
        sale={saleDetails || null}
      />
    </Card>
  );
}

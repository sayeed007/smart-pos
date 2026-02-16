"use client";

import { ReturnFormModal } from "@/components/returns/ReturnFormModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ReturnListTable } from "@/components/returns/ReturnListTable";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { InvoiceDetailsModal } from "@/components/sales/InvoiceDetailsModal";
import { Return } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useReturns, useCreateReturn } from "@/hooks/api/returns";
import { useSale } from "@/hooks/api/sales";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/page-header";

export default function ReturnsPage() {
  const { t } = useTranslation(["returns", "common"]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");

  // Fetch returns from API
  const { data: returnsData, isLoading } = useReturns({
    page,
    limit: pageSize,
    search: search || undefined,
  });

  const createReturnMutation = useCreateReturn();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [returnToDelete, setReturnToDelete] = useState<Return | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data: saleDetails } = useSale(selectedSaleId || "");

  // Map API response to UI model
  const returns: Return[] = (returnsData?.data || []).map(
    (ret: any): Return => ({
      id: ret.id,
      saleId: ret.saleId,
      invoiceNo: ret.invoiceNo || ret.sale?.invoiceNo || "N/A",
      date: ret.createdAt,
      // Map items from return lines
      items: (ret.lines || []).map((line: any) => ({
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
        ret.status.slice(1).toLowerCase()) as any,
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
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("title", "Returns & Refunds")}
        description={t("subtitle", "Process returns and refunds")}
      >
        <div className="flex gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchPlaceholder", "Search returns...")}
              className="pl-8 w-[250px]"
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
      </PageHeader>

      <ReturnListTable
        returns={returns}
        isLoading={isLoading}
        onDelete={handleDeleteReturn}
        onInvoiceClick={handleInvoiceOpen}
      />

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
                page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
              }
            />
          </PaginationItem>

          <PaginationItem>
            <span className="text-sm font-medium text-muted-foreground px-4">
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
    </div>
  );
}

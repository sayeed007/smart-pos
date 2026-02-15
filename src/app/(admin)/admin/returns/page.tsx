"use client";

import { ReturnFormModal } from "@/components/returns/ReturnFormModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ReturnListTable } from "@/components/returns/ReturnListTable";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Return } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useReturns, useCreateReturn } from "@/hooks/api/returns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ReturnsPage() {
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
        name: line.product?.name || "Unknown Product",
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
      customerName: ret.customer?.name || "Walk-in Customer",
    }),
  );

  const handleCreateReturn = (data: Partial<Return> & { restock?: boolean }) => {
    if (!data.saleId || !data.items) {
      toast.error("Invalid return data");
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
          toast.success("Return processed successfully");
          setIsModalOpen(false);
        },
        onError: (err) => {
          toast.error("Failed to process return. Ensure sale exists.");
          console.error(err);
        },
      },
    );
  };

  const handleUpdateReturn = (data: Partial<Return>) => {
    // Update not implemented in backend yet (only Create).
    toast.info("Update return feature coming soon");
    setIsModalOpen(false);
  };

  const handleDeleteReturn = (ret: Return) => {
    setReturnToDelete(ret);
  };

  const confirmDeleteReturn = () => {
    // Delete not implemented in backend yet.
    toast.info("Delete return feature coming soon");
    setReturnToDelete(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Returns & Refunds
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            Process returns and refunds
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search returns..."
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
            Create Return
          </PrimaryActionButton>
        </div>
      </div>

      <ReturnListTable
        returns={returns}
        isLoading={isLoading}
        onEdit={(ret) => {
          setSelectedReturn(ret);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteReturn}
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
              Page {returnsData?.meta?.page || 1} of{" "}
              {returnsData?.meta?.totalPages || 1}
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
        title="Delete Return?"
        description={`Are you sure you want to delete return #${returnToDelete?.invoiceNo}?`}
        onConfirm={confirmDeleteReturn}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}

"use client";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CustomerListTable } from "@/components/customers/CustomerListTable";
import { CustomerSearchBar } from "@/components/customers/CustomerSearchBar";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/hooks/api/customers";
import { Customer } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { CustomerFormValues } from "@/lib/validations/customer";
import { useDebounce } from "use-debounce";
import { PageHeader } from "@/components/ui/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const { t } = useTranslation("customers");

  // Use real API hooks
  const { data: customersData, isLoading } = useCustomers({
    search: debouncedSearch,
    page,
    limit: 10,
  });
  const customers = customersData?.data || [];
  const meta = customersData?.meta;

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const handleSubmit = async (values: CustomerFormValues) => {
    if (selectedCustomer) {
      updateMutation.mutate(
        { id: selectedCustomer.id, data: values },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedCustomer(null);
            toast.success(t("toasts.customerUpdated"));
          },
          onError: (error: unknown) =>
            toast.error(getErrorMessage(error, t("toasts.customerError"))),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedCustomer(null);
          toast.success(t("toasts.customerCreated"));
        },
        onError: (error: unknown) =>
          toast.error(getErrorMessage(error, t("toasts.customerError"))),
      });
    }
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await deleteMutation.mutateAsync(customerToDelete.id);
      setCustomerToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <PageHeader title={t("page.title")} description={t("page.subtitle")}>
        <PrimaryActionButton onClick={handleAddClick} icon={Plus}>
          {t("addCustomer")}
        </PrimaryActionButton>
      </PageHeader>

      <CustomerSearchBar value={search} onChange={setSearch} />

      <CustomerListTable
        customers={customers}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Pagination Controls */}
      {meta && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    if (meta.hasPreviousPage) {
                      setPage((p) => Math.max(1, p - 1));
                    }
                  }}
                  className={
                    !meta.hasPreviousPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-sm font-medium text-muted-foreground px-4">
                  Page {meta.page} of {meta.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    if (meta.hasNextPage) {
                      setPage((p) => p + 1);
                    }
                  }}
                  className={
                    !meta.hasNextPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add/Edit Customer Dialog */}
      <CustomerFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        title={t("confirmDeleteTitle", "Delete Customer?")}
        description={t("confirmDelete", { name: customerToDelete?.name })}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}

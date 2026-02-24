"use client";

import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { CustomerListTable } from "@/components/customers/CustomerListTable";
import { CustomerSearchBar } from "@/components/customers/CustomerSearchBar";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { DataPagination } from "@/components/ui/pagination";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
} from "@/hooks/api/customers";
import { getErrorMessage } from "@/lib/errors";
import { CustomerFormValues } from "@/lib/validations/customer";
import { Customer } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

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
  const [pageSize, setPageSize] = useState(10);
  const { t } = useTranslation("customers");

  // Use real API hooks
  const { data: customersData, isLoading } = useCustomers({
    search: debouncedSearch,
    page,
    limit: pageSize,
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
        <DataPagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          hasPreviousPage={meta.hasPreviousPage}
          hasNextPage={meta.hasNextPage}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
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

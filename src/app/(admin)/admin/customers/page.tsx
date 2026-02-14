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
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { CustomerFormValues } from "@/lib/validations/customer";

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const { t } = useTranslation("customers");

  // Use real API hooks
  const { data: customers, isLoading } = useCustomers({ search });
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
          onError: () => toast.error(t("toasts.customerError")),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedCustomer(null);
          toast.success(t("toasts.customerCreated"));
        },
        onError: () => toast.error(t("toasts.customerError")),
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

  const filteredCustomers = customers?.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="typo-bold-18 text-foreground tracking-tight">
            {t("page.title")}
          </h1>
          <p className="typo-regular-14 text-muted-foreground mt-1">
            {t("page.subtitle")}
          </p>
        </div>
        <PrimaryActionButton onClick={handleAddClick} icon={Plus}>
          {t("addCustomer")}
        </PrimaryActionButton>
      </div>

      <CustomerSearchBar value={search} onChange={setSearch} />

      <CustomerListTable
        customers={filteredCustomers}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

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

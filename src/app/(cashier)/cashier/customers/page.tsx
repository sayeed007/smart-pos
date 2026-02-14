"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { CustomerSearchBar } from "@/components/customers/CustomerSearchBar";
import { CustomerListTable } from "@/components/customers/CustomerListTable";
import { useTranslation } from "react-i18next";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const queryClient = useQueryClient();
  const { t } = useTranslation("customers");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", search],
    queryFn: async () => (await api.get(`/customers?search=${search}`)).data,
  });

  const createMutation = useMutation({
    mutationFn: async (newCustomer: Partial<Customer>) => {
      return api.post("/customers", newCustomer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsDialogOpen(false);
      setSelectedCustomer(null);
      toast.success(t("toasts.customerCreated"));
    },
    onError: () => toast.error(t("toasts.customerError")),
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedCustomer: Partial<Customer>) => {
      return api.put(`/customers/${updatedCustomer.id}`, updatedCustomer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsDialogOpen(false);
      setSelectedCustomer(null);
      toast.success(t("toasts.customerUpdated"));
    },
    onError: () => toast.error(t("toasts.customerError")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return api.delete(`/customers/${customerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(t("toasts.customerDeleted"));
    },
    onError: () => toast.error(t("toasts.deleteError")),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      id: selectedCustomer?.id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };

    if (selectedCustomer) {
      updateMutation.mutate(customerData);
    } else {
      createMutation.mutate(customerData);
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
        <Button
          onClick={handleAddClick}
          className="bg-chart-1 hover:bg-chart-1/90 typo-semibold-14 text-card shadow-lg shadow-chart-1/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("addCustomer")}
        </Button>
      </div>

      {/* Search Bar */}
      <CustomerSearchBar value={search} onChange={setSearch} />

      {/* Customers Table */}
      <CustomerListTable
        customers={filteredCustomers}
        isLoading={isLoading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="typo-bold-18">
              {selectedCustomer ? t("dialog.editTitle") : t("dialog.addTitle")}
            </DialogTitle>
            <DialogDescription className="typo-regular-14">
              {selectedCustomer
                ? t("dialog.editDescription")
                : t("dialog.addDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="typo-semibold-14">
                {t("fields.fullName")}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedCustomer?.name}
                required
                className="h-10"
                placeholder={t("fields.enterName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="typo-semibold-14">
                {t("fields.phoneNumber")}
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={selectedCustomer?.phone}
                required
                className="h-10"
                placeholder={t("fields.enterPhone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="typo-semibold-14">
                {t("fields.emailAddress")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={selectedCustomer?.email}
                required
                className="h-10"
                placeholder={t("fields.enterEmail")}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="typo-semibold-14"
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-chart-1 hover:bg-chart-1/90 text-primary-foreground typo-semibold-14"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? t("actions.saving")
                  : selectedCustomer
                    ? t("actions.update")
                    : t("actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

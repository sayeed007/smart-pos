"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Loader2, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
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
    if (confirm(t("confirmDelete", { name: customer.name }))) {
      deleteMutation.mutate(customer.id);
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
      <div className="flex items-center gap-4 bg-card p-1 rounded-xl shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0 h-9"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted border-0">
              <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
                <TableHead className="w-75">{t("headers.name")}</TableHead>
                <TableHead>{t("headers.phone")}</TableHead>
                <TableHead>{t("headers.email")}</TableHead>
                <TableHead className="text-right">
                  {t("headers.totalSpent")}
                </TableHead>
                <TableHead className="text-right">
                  {t("headers.loyaltyPoints")}
                </TableHead>
                <TableHead className="text-right">
                  {t("headers.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users
                        size={48}
                        className="mb-4 text-muted-foreground/30"
                      />
                      <p className="typo-semibold-14">{t("empty.title")}</p>
                      <p className="typo-regular-12 mt-1">
                        {t("empty.description")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers?.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-sidebar-border p-2 odd:bg-card even:bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center text-chart-1 typo-semibold-14 border border-chart-1/20">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="typo-semibold-14 text-foreground">
                            {customer.name}
                          </p>
                          <p className="typo-regular-12 mt-1 text-muted-foreground">
                            ID: {customer.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground typo-regular-14">
                      {customer.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground typo-regular-14">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="typo-bold-14 text-foreground">
                        ${customer.totalSpent.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-chart-2/10 text-chart-2 typo-semibold-12 border border-chart-2/20">
                        {customer.loyaltyPoints} PTS
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(customer)}
                          className="h-8 w-8 text-muted-foreground hover:text-chart-1 hover:bg-chart-1/10 cursor-pointer transition-colors"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(customer)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                        >
                          <Trash2 size={16} color="red" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

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
    </div>
  );
}

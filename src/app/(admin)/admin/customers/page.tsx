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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Use the search query param on the API to be efficient if needed,
  // but for mock we can just filter client side or use the API search
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
      toast.success("Customer added successfully");
    },
    onError: () => toast.error("Failed to add customer"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };
    createMutation.mutate(customerData);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Customers
          </h1>
          <p className="text-gray-400 font-medium">Manage loyalty members</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-2xl bg-[#f87171] hover:bg-[#ef4444] shadow-lg shadow-red-100"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white border-gray-100"
          />
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 pl-8 font-black uppercase text-xs tracking-widest text-gray-400">
                Name
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Contact
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400 text-right">
                Total Spent
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400 text-right">
                Points
              </TableHead>
              <TableHead className="pr-8 text-right font-black uppercase text-xs tracking-widest text-gray-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-gray-300" />
                  </div>
                </TableCell>
              </TableRow>
            ) : customers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Users size={48} className="mb-4 text-gray-200" />
                    <p className="font-bold">No customers found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers?.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="py-5 pl-8 font-bold text-gray-900">
                    {customer.name}
                    <div className="text-xs text-gray-400 font-normal mt-0.5">
                      ID: {customer.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {customer.phone}
                    </div>
                    <div className="text-xs text-gray-400">
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    ${customer.totalSpent.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {customer.loyaltyPoints} PTS
                    </span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#f87171]"
                    >
                      <Edit size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-[#f87171] hover:bg-[#ef4444] mt-4"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Save Customer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

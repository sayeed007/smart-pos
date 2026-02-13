import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CustomersService,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "@/lib/services/backend/customers.service";
import { ListQueryParams } from "@/types/backend";

export function useCustomers(params?: ListQueryParams) {
  return useQuery({
    queryKey: ["customers", "list", params],
    queryFn: () => CustomersService.list(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: () => CustomersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => CustomersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      CustomersService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["customers", "detail", data.id],
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CustomersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", "list"] });
    },
  });
}

export function useCustomerLoyaltyHistory(
  id: string,
  params?: ListQueryParams,
) {
  return useQuery({
    queryKey: ["customers", "loyalty", id, params],
    queryFn: () => CustomersService.getLoyaltyHistory(id, params),
    enabled: !!id,
  });
}

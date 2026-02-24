import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SalesService,
  CreateSaleDto,
} from "@/lib/services/backend/sales.service";
import { ListQueryParams } from "@/types/backend";

export function useSales(
  params?: ListQueryParams & {
    startDate?: string;
    endDate?: string;
    locationId?: string;
  },
) {
  return useQuery({
    queryKey: ["sales", "list", params],
    queryFn: () => SalesService.list(params),
  });
}

export function useSalesSummary(params?: {
  startDate?: string;
  endDate?: string;
  locationId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["sales", "summary", params],
    queryFn: () => SalesService.getSummary(params || {}),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sales", "detail", id],
    queryFn: () => SalesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaleDto) => SalesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "list"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useVoidSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      SalesService.voidSale(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sales", "list"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["sales", "detail", data.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ReturnsService,
  CreateReturnDto,
} from "@/lib/services/backend/returns.service";
import { ListQueryParams } from "@/types/backend";

export function useReturns(
  params?: ListQueryParams & {
    saleId?: string;
    customerId?: string;
    status?: string;
  },
) {
  return useQuery({
    queryKey: ["returns", params],
    queryFn: () => ReturnsService.list(params),
  });
}

export function useReturn(id: string) {
  return useQuery({
    queryKey: ["returns", id],
    queryFn: () => ReturnsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReturnDto) => ReturnsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      // Also might need to invalidate sales or inventory if needed
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

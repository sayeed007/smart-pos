import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryService } from "@/lib/services/backend/inventory.service";

export function useStockLevels(locationId: string) {
  return useQuery({
    queryKey: ["inventory", "stock", locationId],
    queryFn: () => InventoryService.getStockLevels(locationId),
    enabled: !!locationId,
  });
}

export function useInventoryTransactions(productId: string) {
  return useQuery({
    queryKey: ["inventory", "transactions", productId],
    queryFn: () => InventoryService.getTransactions(productId),
    enabled: !!productId,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: InventoryService.adjustStock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", "stock", variables.locationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "transactions", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: InventoryService.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "stock"] });
    },
  });
}

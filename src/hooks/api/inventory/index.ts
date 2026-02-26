import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryService } from "@/lib/services/backend/inventory.service";

export function useStockLevels(locationId: string) {
  return useQuery({
    queryKey: ["inventory", "stock", locationId],
    queryFn: () => InventoryService.getStockLevels(locationId),
    enabled: !!locationId,
  });
}

export function useAllInventoryTransactions(
  locationId: string,
  page: number = 1,
  limit: number = 100,
  startDate?: string,
  endDate?: string,
  search?: string,
  type?: string,
) {
  return useQuery({
    queryKey: [
      "inventory",
      "transactions",
      "all",
      locationId,
      page,
      limit,
      startDate,
      endDate,
      search,
      type,
    ],
    queryFn: () =>
      InventoryService.getAllTransactions(
        locationId,
        page,
        limit,
        startDate,
        endDate,
        search,
        type,
      ),
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
      queryClient.invalidateQueries({
        queryKey: ["inventory", "transactions", "all"],
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
      queryClient.invalidateQueries({ queryKey: ["inventory", "transfers"] });
    },
  });
}

export function useTransfers(
  locationId?: string,
  page: number = 1,
  limit: number = 100,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: [
      "inventory",
      "transfers",
      locationId,
      page,
      limit,
      startDate,
      endDate,
    ],
    queryFn: () =>
      InventoryService.getTransfers(
        locationId,
        page,
        limit,
        startDate,
        endDate,
      ),
    // enabled: true, // Always enabled
  });
}

export function useShipTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: InventoryService.shipTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "transfers"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "transactions"],
      });
    },
  });
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: InventoryService.receiveTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "transfers"] });
      queryClient.invalidateQueries({
        queryKey: ["inventory", "transactions"],
      });
    },
  });
}

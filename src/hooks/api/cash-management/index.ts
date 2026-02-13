import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CashManagementService } from "@/lib/services/backend/cash-management.service";

export function useCurrentShift() {
  return useQuery({
    queryKey: ["cash", "shift", "current"],
    queryFn: () => CashManagementService.getCurrentShift(),
    retry: false, // Don't retry if 404 (no shift)
  });
}

export function useTaskShifts() {
  return useQuery({
    queryKey: ["cash", "shifts"],
    queryFn: () => CashManagementService.getShifts(),
  });
}

export function useOpenShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => CashManagementService.openShift(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash", "shift", "current"] });
    },
  });
}

export function useCloseShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      CashManagementService.closeShift(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash", "shift", "current"] });
      queryClient.invalidateQueries({ queryKey: ["cash", "shifts"] });
    },
  });
}

export function useAddCashTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      type,
      amount,
      reason,
    }: {
      id: string;
      type: "IN" | "OUT";
      amount: number;
      reason: string;
    }) => CashManagementService.addTransaction(id, type, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash", "shift", "current"] });
    },
  });
}

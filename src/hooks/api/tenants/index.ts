import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TenantsService,
  UpdateTenantProfilePayload,
} from "@/lib/services/backend/tenants.service";

export function useTenantProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: ["tenant", "profile"],
    queryFn: () => TenantsService.getMe(),
    enabled,
  });
}

export function useUpdateTenantProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTenantProfilePayload) =>
      TenantsService.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["instance-config"] });
    },
  });
}

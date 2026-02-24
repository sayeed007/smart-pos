import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SettingsService,
  SettingsMap,
  UpdateSettingsPayload,
} from "@/lib/services/backend/settings.service";

export function useRemoteSettings(locationId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["settings", "remote", locationId || "tenant"],
    queryFn: () => SettingsService.getAll(locationId),
    enabled,
  });
}

export function useUpdateRemoteSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => SettingsService.update(payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "remote", variables.locationId || "tenant"],
      });
    },
  });
}

export type { SettingsMap };

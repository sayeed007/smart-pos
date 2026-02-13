import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LocationsService,
  CreateLocationDto,
  UpdateLocationDto,
} from "@/lib/services/backend/locations.service";

export function useLocations() {
  return useQuery({
    queryKey: ["locations", "list"],
    queryFn: () => LocationsService.list(),
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ["locations", "detail", id],
    queryFn: () => LocationsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocationDto) => LocationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "list"] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationDto }) =>
      LocationsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["locations", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["locations", "detail", data.id],
      });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => LocationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations", "list"] });
    },
  });
}

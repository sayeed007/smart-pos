import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CategoriesService,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/lib/services/backend/categories.service";

export function useCategories() {
  return useQuery({
    queryKey: ["categories", "list"],
    queryFn: () => CategoriesService.list(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", "detail", id],
    queryFn: () => CategoriesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => CategoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      CategoriesService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["categories", "detail", data.id],
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CategoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
    },
  });
}

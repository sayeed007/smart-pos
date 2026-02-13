import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UsersService,
  CreateUserDto,
  UpdateUserDto,
} from "@/lib/services/backend/users.service";

export function useUsers() {
  return useQuery({
    queryKey: ["users", "list"],
    queryFn: () => UsersService.list(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => UsersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => UsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      UsersService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      queryClient.invalidateQueries({ queryKey: ["users", "detail", data.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UsersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

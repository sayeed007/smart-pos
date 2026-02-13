import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ProductsService,
  CreateProductDto,
  UpdateProductDto,
} from "@/lib/services/backend/products.service";
import { ListQueryParams } from "@/types/backend";

export function useProducts(params?: ListQueryParams) {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: () => ProductsService.list(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: () => ProductsService.getById(id),
    enabled: !!id,
  });
}

export function useProductByBarcode(barcode: string) {
  return useQuery({
    queryKey: ["products", "barcode", barcode],
    queryFn: () => ProductsService.getByBarcode(barcode),
    enabled: !!barcode,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductDto) => ProductsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      ProductsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["products", "detail", data.id],
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ProductsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

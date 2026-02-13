import { useQuery } from '@tanstack/react-query';
import type { ListQueryParams } from '@/types/backend';
import {
  listCategories,
  listCustomers,
  listLocations,
  listProducts,
  listSales,
  listUsers,
} from '@/lib/services/backend/entities.service';

export const backendQueryKeys = {
  users: (params?: ListQueryParams) => ['backend', 'users', params] as const,
  products: (params?: ListQueryParams) => ['backend', 'products', params] as const,
  categories: (params?: ListQueryParams) => ['backend', 'categories', params] as const,
  customers: (params?: ListQueryParams) => ['backend', 'customers', params] as const,
  sales: (params?: ListQueryParams) => ['backend', 'sales', params] as const,
  locations: (params?: ListQueryParams) => ['backend', 'locations', params] as const,
};

export function useBackendUsersQuery(params?: ListQueryParams) {
  return useQuery({
    queryKey: backendQueryKeys.users(params),
    queryFn: () => listUsers(params),
  });
}

export function useBackendProductsQuery(params?: ListQueryParams) {
  return useQuery({
    queryKey: backendQueryKeys.products(params),
    queryFn: () => listProducts(params),
  });
}

export function useBackendCategoriesQuery(params?: ListQueryParams) {
  return useQuery({
    queryKey: backendQueryKeys.categories(params),
    queryFn: () => listCategories(params),
  });
}

export function useBackendCustomersQuery(params?: ListQueryParams) {
  return useQuery({
    queryKey: backendQueryKeys.customers(params),
    queryFn: () => listCustomers(params),
  });
}

export function useBackendSalesQuery(params?: ListQueryParams) {
  return useQuery({
    queryKey: backendQueryKeys.sales(params),
    queryFn: () => listSales(params),
  });
}

export function useBackendLocationsQuery(params?: ListQueryParams) {
  return useQuery({
    queryKey: backendQueryKeys.locations(params),
    queryFn: () => listLocations(params),
  });
}


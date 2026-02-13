import { backendApi } from '@/lib/axios';
import type { ApiEnvelope, ListQueryParams } from '@/types/backend';
import { unwrapEnvelope } from './utils';

type UnknownRecord = Record<string, unknown>;

async function listEndpoint(
  path: string,
  params?: ListQueryParams
): Promise<UnknownRecord | UnknownRecord[]> {
  const response = await backendApi.get<ApiEnvelope<UnknownRecord | UnknownRecord[]>>(path, {
    params,
  });
  return unwrapEnvelope(response.data);
}

export function listUsers(params?: ListQueryParams) {
  return listEndpoint('/users', params);
}

export function listProducts(params?: ListQueryParams) {
  return listEndpoint('/products', params);
}

export function listCategories(params?: ListQueryParams) {
  return listEndpoint('/categories', params);
}

export function listCustomers(params?: ListQueryParams) {
  return listEndpoint('/customers', params);
}

export function listSales(params?: ListQueryParams) {
  return listEndpoint('/sales', params);
}

export function listLocations(params?: ListQueryParams) {
  return listEndpoint('/locations', params);
}


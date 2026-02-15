import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Customer, LoyaltyLog } from "@/types";
import { ApiEnvelope, ListQueryParams, PaginatedResult } from "@/types/backend";

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export class CustomersService {
  static async list(params?: ListQueryParams) {
    const response = await backendApi.get<
      ApiEnvelope<PaginatedResult<Customer>>
    >("/customers", { params });
    const result = unwrapEnvelope(response.data);
    return result;
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Customer>>(
      `/customers/${id}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateCustomerDto) {
    const response = await backendApi.post<ApiEnvelope<Customer>>(
      "/customers",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateCustomerDto) {
    const response = await backendApi.patch<ApiEnvelope<Customer>>(
      `/customers/${id}`,
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/customers/${id}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async getLoyaltyHistory(id: string, params?: ListQueryParams) {
    const response = await backendApi.get<ApiEnvelope<LoyaltyLog[]>>(
      `/customers/${id}/loyalty-history`,
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async adjustPoints(id: string, points: number, reason: string) {
    const response = await backendApi.post<ApiEnvelope<void>>(
      `/customers/${id}/points/adjust`,
      { points, reason },
    );
    return unwrapEnvelope(response.data);
  }
}

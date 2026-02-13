import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Sale, CartItem } from "@/types";
import { ApiEnvelope, ListQueryParams } from "@/types/backend";

export interface CreateSaleDto {
  items: CartItem[];
  paymentMethod: "Cash" | "Card" | "Digital" | "Split";
  payments?: { method: string; amount: number }[];
  customerId?: string;
}

export class SalesService {
  static async list(params?: ListQueryParams) {
    const response = await backendApi.get<ApiEnvelope<Sale[]>>("/sales", {
      params,
    });
    return unwrapEnvelope(response.data);
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Sale>>(`/sales/${id}`);
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateSaleDto) {
    const response = await backendApi.post<ApiEnvelope<Sale>>("/sales", data);
    return unwrapEnvelope(response.data);
  }

  static async voidSale(id: string, reason: string) {
    const response = await backendApi.patch<ApiEnvelope<Sale>>(
      `/sales/${id}/void`,
      { reason },
    );
    return unwrapEnvelope(response.data);
  }
}

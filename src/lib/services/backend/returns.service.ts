import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Return } from "@/types"; // Use global type, but we might need to cast/map
import { ApiEnvelope, ListQueryParams, PaginatedResult } from "@/types/backend";

// Create Return DTO
export interface CreateReturnDto {
  saleId: string;
  locationId?: string;
  lines: {
    saleLineId: string;
    quantity: number;
    reason?: string;
  }[];
  reason: string;
  restock?: boolean;
}

export class ReturnsService {
  static async list(
    params?: ListQueryParams & {
      saleId?: string;
      customerId?: string;
      status?: string;
    },
  ) {
    const response = await backendApi.get<ApiEnvelope<PaginatedResult<any>>>(
      "/returns", // Endpoint
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<any>>(`/returns/${id}`);
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateReturnDto) {
    const response = await backendApi.post<ApiEnvelope<any>>("/returns", data);
    return unwrapEnvelope(response.data);
  }
}

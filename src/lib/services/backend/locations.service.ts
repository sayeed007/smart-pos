import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Location } from "@/types";
import { ApiEnvelope } from "@/types/backend";

export interface CreateLocationDto {
  name: string;
  address?: string | null;
  type: "STORE" | "WAREHOUSE";
  priceBookId?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

export class LocationsService {
  static async list() {
    const response = await backendApi.get<
      ApiEnvelope<{
        data: Location[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }>
    >("/locations");
    const unwrapped = unwrapEnvelope(response.data);
    return unwrapped.data; // Return just the array of locations
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Location>>(
      `/locations/${id}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateLocationDto) {
    const response = await backendApi.post<ApiEnvelope<Location>>(
      "/locations",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateLocationDto) {
    const response = await backendApi.patch<ApiEnvelope<Location>>(
      `/locations/${id}`,
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/locations/${id}`,
    );
    return unwrapEnvelope(response.data);
  }
}

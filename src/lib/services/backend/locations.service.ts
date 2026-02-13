import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Location } from "@/types";
import { ApiEnvelope } from "@/types/backend";

export interface CreateLocationDto {
  name: string;
  address: string;
  type: "store" | "warehouse";
  priceBookId?: string;
  status: "active" | "inactive";
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

export class LocationsService {
  static async list() {
    const response =
      await backendApi.get<ApiEnvelope<Location[]>>("/locations");
    return unwrapEnvelope(response.data);
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

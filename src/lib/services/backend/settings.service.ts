import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { ApiEnvelope } from "@/types/backend";

export interface SettingsMap {
  [key: string]: unknown;
}

export interface UpdateSettingsPayload {
  settings: SettingsMap;
  locationId?: string;
}

export class SettingsService {
  static async getAll(locationId?: string) {
    const response = await backendApi.get<ApiEnvelope<SettingsMap>>(
      "/settings",
      {
        params: locationId ? { locationId } : undefined,
      },
    );
    return unwrapEnvelope(response.data);
  }

  static async update(payload: UpdateSettingsPayload) {
    const response = await backendApi.patch<
      ApiEnvelope<{ message: string; count: number }>
    >("/settings", payload);
    return unwrapEnvelope(response.data);
  }
}

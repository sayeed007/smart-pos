import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { ApiEnvelope } from "@/types/backend";

export interface TenantProfile {
  id: string;
  name: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  tagline?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  currency?: string | null;
  timezone?: string | null;
}

export interface UpdateTenantProfilePayload {
  name?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  currency?: string;
  timezone?: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoFile?: File;
}

export class TenantsService {
  static async getMe() {
    const response = await backendApi.get<ApiEnvelope<TenantProfile>>(
      "/tenants/me",
    );
    return unwrapEnvelope(response.data);
  }

  static async updateMe(payload: UpdateTenantProfilePayload) {
    const formData = new FormData();

    const appendString = (
      key: keyof Omit<UpdateTenantProfilePayload, "logoFile">,
      value?: string,
    ) => {
      if (value === undefined) return;
      formData.append(key, value);
    };

    appendString("name", payload.name);
    appendString("tagline", payload.tagline);
    appendString("contactEmail", payload.contactEmail);
    appendString("contactPhone", payload.contactPhone);
    appendString("address", payload.address);
    appendString("currency", payload.currency);
    appendString("timezone", payload.timezone);
    appendString("logoUrl", payload.logoUrl);
    appendString("faviconUrl", payload.faviconUrl);

    if (payload.logoFile) {
      formData.append("logo", payload.logoFile);
    }

    const response = await backendApi.patch<ApiEnvelope<TenantProfile>>(
      "/tenants/me",
      formData,
      {
        headers: { "Content-Type": undefined },
      },
    );
    return unwrapEnvelope(response.data);
  }
}

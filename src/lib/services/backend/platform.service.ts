import axios from "axios";
import { BACKEND_API_URL } from "@/config/backend-api";
import type { ApiEnvelope, PaginatedResult } from "@/types/backend";
import { unwrapEnvelope } from "./utils";

const platformApi = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface PlatformLoginRequestDto {
  email: string;
  password: string;
}

export interface PlatformLoginResponseDto {
  accessToken: string;
  expiresIn: string;
  accessTokenExpiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN";
  };
}

export interface PlatformTenantListItem {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  contactEmail: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    locations: number;
    sales: number;
  };
}

export type PlatformTenantListResponse = PaginatedResult<PlatformTenantListItem>;

export interface PlatformCreateTenantRequestDto {
  businessName: string;
  slug?: string;
  currency?: string;
  timezone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone?: string;
  locationName?: string;
  locationAddress?: string;
  locationPhone?: string;
}

export interface PlatformCreateTenantResponseDto {
  tenant: {
    id: string;
    name: string;
    slug: string;
    contactEmail: string | null;
    currency: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
  location: {
    id: string;
    name: string;
    type: "STORE" | "WAREHOUSE";
    address: string | null;
    phone: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updatedAt: string;
  };
}

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export async function platformLoginApi(
  payload: PlatformLoginRequestDto,
): Promise<PlatformLoginResponseDto> {
  const response = await platformApi.post<ApiEnvelope<PlatformLoginResponseDto>>(
    "/platform/auth/login",
    payload,
  );
  return unwrapEnvelope(response.data);
}

export async function listPlatformTenantsApi(
  token: string,
): Promise<PlatformTenantListResponse> {
  const response = await platformApi.get<ApiEnvelope<PlatformTenantListResponse>>(
    "/platform/tenants",
    {
      headers: authHeader(token),
    },
  );
  return unwrapEnvelope(response.data);
}

export async function createPlatformTenantApi(
  token: string,
  payload: PlatformCreateTenantRequestDto,
): Promise<PlatformCreateTenantResponseDto> {
  const response = await platformApi.post<
    ApiEnvelope<PlatformCreateTenantResponseDto>
  >("/platform/tenants", payload, {
    headers: authHeader(token),
  });
  return unwrapEnvelope(response.data);
}

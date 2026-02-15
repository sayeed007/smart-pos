export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    correlationId: string;
    duration?: number;
  };
}

export interface BackendAuthUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: { id: string; name: string }[];
  role?: string; // Keep for backward compatibility if needed, or remove if unused
  status: "active" | "inactive";
}

export interface LoginRequestDto {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: BackendAuthUser;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

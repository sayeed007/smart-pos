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
  roles: string[];
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
  sortOrder?: 'asc' | 'desc';
}


import { useQuery } from "@tanstack/react-query";
import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "@/lib/services/backend/utils";
import type { PaginatedResult } from "@/types/backend";

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  userId?: string;
  entityType?: string;
}

export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const response = await backendApi.get("/audit-logs", { params });
      return unwrapEnvelope<PaginatedResult<AuditLogEntry>>(response.data);
    },
    staleTime: 30_000,
  });
}

import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { ApiEnvelope, ListQueryParams, PaginatedResult } from "@/types/backend";
import { Sale } from "@/types";

export interface ReportsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  profitEstimated?: boolean;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface TopCategoryPoint {
  name: string;
  value: number;
}

export interface PaymentMethodStat {
  method: string;
  count: number;
  total: number;
}

export interface ReportsProduct {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stockQuantity: number;
  categoryId?: string | null;
  categoryName?: string | null;
}

export interface ExportPayload {
  filename: string;
  mimeType: string;
  content: string;
}

export interface ReportsQueryParams extends ListQueryParams {
  startDate?: string;
  endDate?: string;
  locationId?: string;
}

export class ReportsService {
  static async getSummary(params: ReportsQueryParams) {
    const response = await backendApi.get<ApiEnvelope<ReportsSummary>>(
      "/reports/summary",
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async getRevenueTrend(params: ReportsQueryParams) {
    const response = await backendApi.get<ApiEnvelope<RevenueTrendPoint[]>>(
      "/reports/revenue-trend",
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async getTopCategories(params: ReportsQueryParams & { limit?: number }) {
    const response = await backendApi.get<ApiEnvelope<TopCategoryPoint[]>>(
      "/reports/top-categories",
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async getPaymentMethods(params: ReportsQueryParams) {
    const response = await backendApi.get<ApiEnvelope<PaymentMethodStat[]>>(
      "/reports/payment-methods",
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async getSales(params: ReportsQueryParams) {
    const response = await backendApi.get<ApiEnvelope<PaginatedResult<Sale>>>(
      "/reports/sales",
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async getProducts(params: ReportsQueryParams) {
    const response = await backendApi.get<
      ApiEnvelope<PaginatedResult<ReportsProduct>>
    >("/reports/products", { params });
    return unwrapEnvelope(response.data);
  }

  static async exportSales(params: ReportsQueryParams) {
    const response = await backendApi.get<ApiEnvelope<ExportPayload>>(
      "/reports/sales/export",
      { params },
    );
    return unwrapEnvelope(response.data);
  }

  static async exportProducts(params: ReportsQueryParams) {
    const response = await backendApi.get<ApiEnvelope<ExportPayload>>(
      "/reports/products/export",
      { params },
    );
    return unwrapEnvelope(response.data);
  }
}

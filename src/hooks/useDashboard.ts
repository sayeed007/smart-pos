import { backendApi } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types";
import { unwrapEnvelope } from "@/lib/services/backend/utils";
import { ApiEnvelope } from "@/types/backend";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
}

interface RevenueChartData {
  date: string;
  revenue: number;
}

interface TopCategoryData {
  name: string;
  value: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  total: number;
}

export const useDashboardStats = (
  startDate?: string,
  endDate?: string,
  locationId?: string,
) => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats", startDate, endDate, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (locationId) params.append("locationId", locationId);
      const response = await backendApi.get<ApiEnvelope<DashboardStats>>(
        `/dashboard/stats?${params.toString()}`,
      );
      return unwrapEnvelope(response.data);
    },
  });
};

export const useRevenueChart = (
  startDate?: string,
  endDate?: string,
  locationId?: string,
) => {
  return useQuery<RevenueChartData[]>({
    queryKey: ["dashboard", "revenue-chart", startDate, endDate, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (locationId) params.append("locationId", locationId);
      const response = await backendApi.get<ApiEnvelope<RevenueChartData[]>>(
        `/dashboard/charts/revenue?${params.toString()}`,
      );
      return unwrapEnvelope(response.data);
    },
  });
};

export const useTopCategories = (
  limit: number = 5,
  startDate?: string,
  endDate?: string,
  locationId?: string,
) => {
  return useQuery<TopCategoryData[]>({
    queryKey: [
      "dashboard",
      "top-categories",
      limit,
      startDate,
      endDate,
      locationId,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (locationId) params.append("locationId", locationId);
      const response = await backendApi.get<ApiEnvelope<TopCategoryData[]>>(
        `/dashboard/charts/top-categories?${params.toString()}`,
      );
      return unwrapEnvelope(response.data);
    },
  });
};

export const usePaymentMethodStats = (
  startDate?: string,
  endDate?: string,
  locationId?: string,
) => {
  return useQuery<PaymentMethodStats[]>({
    queryKey: ["dashboard", "payment-methods", startDate, endDate, locationId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (locationId) params.append("locationId", locationId);
      const response = await backendApi.get<ApiEnvelope<PaymentMethodStats[]>>(
        `/dashboard/charts/payment-methods?${params.toString()}`,
      );
      return unwrapEnvelope(response.data);
    },
  });
};

export const useLowStockProducts = (limit: number = 5) => {
  return useQuery<Product[]>({
    queryKey: ["dashboard", "low-stock", limit],
    queryFn: async () => {
      const response = await backendApi.get<ApiEnvelope<Product[]>>(
        `/dashboard/low-stock?limit=${limit}`,
      );
      const data = unwrapEnvelope(response.data);
      return data.map((item: Product & { imageUrl?: string }) => ({
        ...item,
        image: item.image ?? item.imageUrl,
      }));
    },
  });
};

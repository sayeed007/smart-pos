import { useQuery } from "@tanstack/react-query";
import {
  ReportsService,
  ReportsQueryParams,
} from "@/lib/services/backend/reports.service";

export function useReportsSummary(params: ReportsQueryParams) {
  return useQuery({
    queryKey: ["reports", "summary", params],
    queryFn: () => ReportsService.getSummary(params),
  });
}

export function useReportsRevenueTrend(params: ReportsQueryParams) {
  return useQuery({
    queryKey: ["reports", "revenue-trend", params],
    queryFn: () => ReportsService.getRevenueTrend(params),
  });
}

export function useReportsTopCategories(params: ReportsQueryParams & { limit?: number }) {
  return useQuery({
    queryKey: ["reports", "top-categories", params],
    queryFn: () => ReportsService.getTopCategories(params),
  });
}

export function useReportsPaymentMethods(params: ReportsQueryParams) {
  return useQuery({
    queryKey: ["reports", "payment-methods", params],
    queryFn: () => ReportsService.getPaymentMethods(params),
  });
}

export function useReportsSales(params: ReportsQueryParams) {
  return useQuery({
    queryKey: ["reports", "sales", params],
    queryFn: () => ReportsService.getSales(params),
  });
}

export function useReportsProducts(params: ReportsQueryParams) {
  return useQuery({
    queryKey: ["reports", "products", params],
    queryFn: () => ReportsService.getProducts(params),
  });
}

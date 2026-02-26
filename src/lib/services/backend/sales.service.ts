import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Sale } from "@/types";
import { ApiEnvelope, ListQueryParams, PaginatedResult } from "@/types/backend";

// ── Sale Line matching backend SaleLineInput ──
export interface SaleLineDto {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  offerId?: string;
}

// ── Payment matching backend PaymentInput ──
export interface SalePaymentDto {
  method:
    | "CASH"
    | "CARD"
    | "DIGITAL_WALLET"
    | "GIFT_CARD"
    | "LOYALTY"
    | "OTHER";
  amount: number;
  reference?: string;
}

// ── CreateSaleDto matching backend exactly ──
export interface CreateSaleDto {
  locationId: string;
  registerId?: string;
  customerId?: string;
  shiftId?: string;
  notes?: string;
  isOffline?: boolean;
  offlineId?: string;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  globalTaxRate?: number;
  lines: SaleLineDto[];
  payments: SalePaymentDto[];
}

export class SalesService {
  static async list(params?: ListQueryParams) {
    const response = await backendApi.get<ApiEnvelope<PaginatedResult<Sale>>>(
      "/sales",
      {
        params,
      },
    );
    return unwrapEnvelope(response.data);
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Sale>>(`/sales/${id}`);
    return unwrapEnvelope(response.data);
  }

  static async getSummary(params: {
    startDate?: string;
    endDate?: string;
    locationId?: string;
  }) {
    const response = await backendApi.get<
      ApiEnvelope<{
        totalSales: number;
        totalOrders: number;
        averageOrderValue: number;
        totalDiscount: number;
        totalTax: number;
      }>
    >("/sales/summary", { params });
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateSaleDto) {
    const response = await backendApi.post<ApiEnvelope<Sale>>("/sales", data);
    return unwrapEnvelope(response.data);
  }

  static async voidSale(id: string, reason: string) {
    const response = await backendApi.patch<ApiEnvelope<Sale>>(
      `/sales/${id}/void`,
      { reason },
    );
    return unwrapEnvelope(response.data);
  }
}

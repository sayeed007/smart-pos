import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { InventoryTransaction, StockTransfer } from "@/types";
import { ApiEnvelope } from "@/types/backend";

export interface StockLevel {
  productId: string;
  variantId?: string;
  locationId: string;
  quantity: number;
}

export class InventoryService {
  static async getStockLevels(locationId: string) {
    const response = await backendApi.get<ApiEnvelope<StockLevel[]>>(
      `/inventory/stock/${locationId}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async getTransactions(productId: string) {
    const response = await backendApi.get<ApiEnvelope<InventoryTransaction[]>>(
      `/inventory/transactions/${productId}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async adjustStock(data: {
    productId: string;
    variantId?: string;
    locationId: string;
    quantity: number;
    reason: string;
    type: "IN" | "OUT" | "ADJUST";
  }) {
    const response = await backendApi.post<ApiEnvelope<void>>(
      "/inventory/adjust",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async createTransfer(data: {
    fromLocationId: string;
    toLocationId: string;
    items: { productId: string; variantId?: string; quantity: number }[];
  }) {
    const response = await backendApi.post<ApiEnvelope<StockTransfer>>(
      "/inventory/transfers",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async shipTransfer(id: string) {
    const response = await backendApi.patch<ApiEnvelope<StockTransfer>>(
      `/inventory/transfers/${id}/ship`,
    );
    return unwrapEnvelope(response.data);
  }

  static async receiveTransfer(id: string) {
    const response = await backendApi.patch<ApiEnvelope<StockTransfer>>(
      `/inventory/transfers/${id}/receive`,
    );
    return unwrapEnvelope(response.data);
  }
}

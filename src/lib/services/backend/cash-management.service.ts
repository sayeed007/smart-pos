import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { ApiEnvelope } from "@/types/backend";

export interface CashShift {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  startAmount: number;
  endAmount?: number;
  cashSales: number;
  status: "open" | "closed";
}

export class CashManagementService {
  static async getCurrentShift() {
    const response = await backendApi.get<ApiEnvelope<CashShift>>(
      "/cash/shift/current",
    );
    return unwrapEnvelope(response.data);
  }

  static async getShifts() {
    const response =
      await backendApi.get<ApiEnvelope<CashShift[]>>("/cash/shifts");
    return unwrapEnvelope(response.data);
  }

  static async openShift(amount: number) {
    const response = await backendApi.post<ApiEnvelope<CashShift>>(
      "/cash/shift/open",
      { amount },
    );
    return unwrapEnvelope(response.data);
  }

  static async closeShift(id: string, endAmount: number) {
    const response = await backendApi.patch<ApiEnvelope<void>>(
      `/cash/shift/${id}/close`,
      { endAmount },
    );
    return unwrapEnvelope(response.data);
  }

  static async addTransaction(
    id: string,
    type: "IN" | "OUT",
    amount: number,
    reason: string,
  ) {
    const response = await backendApi.post<ApiEnvelope<void>>(
      `/cash/shift/${id}/transaction`,
      { type, amount, reason },
    );
    return unwrapEnvelope(response.data);
  }
}

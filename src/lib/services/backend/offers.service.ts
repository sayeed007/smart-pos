import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Offer } from "@/types";
import { ApiEnvelope } from "@/types/backend";

export type CreateOfferDto = Omit<Offer, "id" | "status"> & {
  status?: "active" | "inactive";
};
export type UpdateOfferDto = Partial<CreateOfferDto>;

export class OffersService {
  static async list() {
    const response = await backendApi.get<ApiEnvelope<Offer[]>>("/offers");
    return unwrapEnvelope(response.data);
  }

  static async listActive() {
    const response =
      await backendApi.get<ApiEnvelope<Offer[]>>("/offers/active");
    return unwrapEnvelope(response.data);
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Offer>>(`/offers/${id}`);
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateOfferDto) {
    const response = await backendApi.post<ApiEnvelope<Offer>>("/offers", data);
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateOfferDto) {
    const response = await backendApi.patch<ApiEnvelope<Offer>>(
      `/offers/${id}`,
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/offers/${id}`,
    );
    return unwrapEnvelope(response.data);
  }
}

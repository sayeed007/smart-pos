import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Offer } from "@/types";
import { ApiEnvelope, PaginatedResult } from "@/types/backend";

export type CreateOfferDto = Omit<Offer, "id" | "status"> & {
  status?: Offer["status"];
};
export type UpdateOfferDto = Partial<CreateOfferDto>;

export class OffersService {
  private static normalizeTypeToBackend(value?: string) {
    if (!value) return value;
    const normalized = value.toLowerCase();
    switch (normalized) {
      case "percentage":
        return "PERCENTAGE";
      case "fixed":
        return "FIXED";
      case "buy_x_get_y":
        return "BUY_X_GET_Y";
      case "bundle":
        return "BUNDLE";
      case "category_discount":
        return "CATEGORY_DISCOUNT";
      default:
        return value.toUpperCase();
    }
  }

  private static normalizeTypeFromBackend(value?: string) {
    if (!value) return "percentage";
    const normalized = value.toLowerCase();
    if (normalized === "buy_x_get_y") return "buy_x_get_y";
    if (normalized === "category_discount") return "category_discount";
    if (normalized === "bundle") return "bundle";
    if (normalized === "fixed") return "fixed";
    return "percentage";
  }

  private static normalizeStatusToBackend(value?: string) {
    if (!value) return value;
    const normalized = value.toLowerCase();
    if (normalized === "inactive") return "INACTIVE";
    if (normalized === "scheduled") return "SCHEDULED";
    return "ACTIVE";
  }

  private static normalizeStatusFromBackend(value?: string) {
    if (!value) return "active";
    const normalized = value.toLowerCase();
    if (normalized === "inactive") return "inactive";
    if (normalized === "scheduled") return "scheduled";
    return "active";
  }

  private static normalizeApplicableOnToBackend(value?: string) {
    if (!value) return value;
    const normalized = value.toLowerCase();
    if (normalized === "category") return "CATEGORY";
    if (normalized === "product") return "PRODUCT";
    return "ALL";
  }

  private static normalizeApplicableOnFromBackend(value?: string) {
    if (!value) return "all";
    const normalized = value.toLowerCase();
    if (normalized === "category") return "category";
    if (normalized === "product") return "product";
    return "all";
  }

  private static mapOfferFromBackend(offer: Offer) {
    const rawRule = (offer as any).rule;
    let rule: Offer["rule"] | undefined;
    if (rawRule && typeof rawRule === "object") {
      if ((rawRule as any).buyXGetY) {
        const buyXGetY = (rawRule as any).buyXGetY;
        rule = {
          buyXGetY: {
            buyProductIds: Array.isArray(buyXGetY.buyProductIds)
              ? buyXGetY.buyProductIds
              : [],
            getProductIds: Array.isArray(buyXGetY.getProductIds)
              ? buyXGetY.getProductIds
              : [],
            buyQty: Number(buyXGetY.buyQty ?? 1),
            getQty: Number(buyXGetY.getQty ?? 1),
            sameProduct: Boolean(buyXGetY.sameProduct ?? true),
            discountType:
              buyXGetY.discountType === "percent" ||
              buyXGetY.discountType === "fixed" ||
              buyXGetY.discountType === "free"
                ? buyXGetY.discountType
                : "free",
            discountValue:
              buyXGetY.discountValue !== null &&
              buyXGetY.discountValue !== undefined
                ? Number(buyXGetY.discountValue)
                : undefined,
          },
        };
      } else if ((rawRule as any).bundle) {
        const bundle = (rawRule as any).bundle;
        rule = {
          bundle: {
            productIds: Array.isArray(bundle.productIds)
              ? bundle.productIds
              : [],
            pricingType:
              bundle.pricingType === "fixed_price" ||
              bundle.pricingType === "percent"
                ? bundle.pricingType
                : "fixed_price",
            price:
              bundle.price !== null && bundle.price !== undefined
                ? Number(bundle.price)
                : undefined,
            percent:
              bundle.percent !== null && bundle.percent !== undefined
                ? Number(bundle.percent)
                : undefined,
          },
        };
      }
    }

    return {
      ...offer,
      type: this.normalizeTypeFromBackend((offer as any).type),
      status: this.normalizeStatusFromBackend((offer as any).status),
      applicableOn: this.normalizeApplicableOnFromBackend(
        (offer as any).applicableOn,
      ),
      value: Number((offer as any).value ?? 0),
      minPurchase:
        (offer as any).minPurchase !== null &&
        (offer as any).minPurchase !== undefined
          ? Number((offer as any).minPurchase)
          : undefined,
      maxDiscount:
        (offer as any).maxDiscount !== null &&
        (offer as any).maxDiscount !== undefined
          ? Number((offer as any).maxDiscount)
          : undefined,
      productIds: Array.isArray((offer as any).productIds)
        ? (offer as any).productIds
        : [],
      rule,
    } as Offer;
  }

  static async list(page: number = 1, limit: number = 20) {
    const response = await backendApi.get<ApiEnvelope<PaginatedResult<Offer>>>(
      `/offers?page=${page}&limit=${limit}`,
    );
    const result = unwrapEnvelope(response.data);
    result.data = result.data.map((offer) => this.mapOfferFromBackend(offer));
    return result;
  }

  static async listActive() {
    const response =
      await backendApi.get<ApiEnvelope<PaginatedResult<Offer>>>(
        "/offers/active",
      );
    const result = unwrapEnvelope(response.data) as any;
    const offers = Array.isArray(result) ? result : result.data;
    return offers.map((offer: Offer) => this.mapOfferFromBackend(offer));
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Offer>>(`/offers/${id}`);
    const offer = unwrapEnvelope(response.data);
    return this.mapOfferFromBackend(offer);
  }

  static async create(data: CreateOfferDto) {
    const payload = {
      ...data,
      type: this.normalizeTypeToBackend((data as any).type),
      status: this.normalizeStatusToBackend((data as any).status),
      applicableOn: this.normalizeApplicableOnToBackend(
        (data as any).applicableOn,
      ),
    };
    const response = await backendApi.post<ApiEnvelope<Offer>>(
      "/offers",
      payload,
    );
    return this.mapOfferFromBackend(unwrapEnvelope(response.data));
  }

  static async update(id: string, data: UpdateOfferDto) {
    const payload = {
      ...data,
      ...(data.type ? { type: this.normalizeTypeToBackend(data.type) } : {}),
      ...(data.status
        ? { status: this.normalizeStatusToBackend(data.status) }
        : {}),
      ...(data.applicableOn
        ? {
            applicableOn: this.normalizeApplicableOnToBackend(
              data.applicableOn,
            ),
          }
        : {}),
    };
    const response = await backendApi.patch<ApiEnvelope<Offer>>(
      `/offers/${id}`,
      payload,
    );
    return this.mapOfferFromBackend(unwrapEnvelope(response.data));
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/offers/${id}`,
    );
    return unwrapEnvelope(response.data);
  }
}

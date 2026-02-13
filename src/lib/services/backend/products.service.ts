import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Product } from "@/types";
import { ApiEnvelope, ListQueryParams } from "@/types/backend";

export interface CreateProductDto {
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  status: "active" | "inactive";
  image?: string;
  type: "simple" | "variable";
  // ... other fields
}

export type UpdateProductDto = Partial<CreateProductDto>;

export class ProductsService {
  static async list(params?: ListQueryParams) {
    const response = await backendApi.get<ApiEnvelope<Product[]>>("/products", {
      params,
    });
    return unwrapEnvelope(response.data);
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Product>>(
      `/products/${id}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async getByBarcode(barcode: string) {
    const response = await backendApi.get<ApiEnvelope<Product>>(
      `/products/barcode/${barcode}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateProductDto) {
    const response = await backendApi.post<ApiEnvelope<Product>>(
      "/products",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateProductDto) {
    const response = await backendApi.patch<ApiEnvelope<Product>>(
      `/products/${id}`,
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/products/${id}`,
    );
    return unwrapEnvelope(response.data);
  }
}

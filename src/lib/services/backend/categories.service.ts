import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Category } from "@/types";
import { ApiEnvelope } from "@/types/backend";

export interface CreateCategoryDto {
  name: string;
  image?: string;
  parentId?: string;
  icon?: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export class CategoriesService {
  static async list() {
    const response =
      await backendApi.get<ApiEnvelope<Category[]>>("/categories");
    return unwrapEnvelope(response.data);
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Category>>(
      `/categories/${id}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateCategoryDto) {
    const response = await backendApi.post<ApiEnvelope<Category>>(
      "/categories",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateCategoryDto) {
    const response = await backendApi.patch<ApiEnvelope<Category>>(
      `/categories/${id}`,
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/categories/${id}`,
    );
    return unwrapEnvelope(response.data);
  }
}

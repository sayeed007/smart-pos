import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { UserRole } from "@/types";
import {
  ApiEnvelope,
  BackendAuthUser,
  ListQueryParams,
  PaginatedResult,
} from "@/types/backend";

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  roleIds: string[];
  // status: "active" | "inactive"; // Backend handles status, defaults to active
}

export type UpdateUserDto = Partial<CreateUserDto>;

export class UsersService {
  static async list(params?: ListQueryParams) {
    const response = await backendApi.get<
      ApiEnvelope<PaginatedResult<BackendAuthUser>>
    >("/users", { params });
    const result = unwrapEnvelope(response.data);
    return result.data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.roles?.[0]
        ? { id: u.roles[0].id, name: u.roles[0].name }
        : UserRole.CASHIER,
      status: u.status,
    }));
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<BackendAuthUser>>(
      `/users/${id}`,
    );
    return unwrapEnvelope(response.data);
  }

  static async create(data: CreateUserDto) {
    const response = await backendApi.post<ApiEnvelope<BackendAuthUser>>(
      "/users",
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateUserDto) {
    const response = await backendApi.patch<ApiEnvelope<BackendAuthUser>>(
      `/users/${id}`,
      data,
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(`/users/${id}`);
    return unwrapEnvelope(response.data);
  }

  static async getRoles() {
    const response =
      await backendApi.get<ApiEnvelope<{ id: string; name: string }[]>>(
        "/users/roles",
      );
    return unwrapEnvelope(response.data);
  }
}

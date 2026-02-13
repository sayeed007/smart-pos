import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { UserRole } from "@/types";
import { ApiEnvelope, BackendAuthUser } from "@/types/backend";

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string; // Optional if invite flow
  role: UserRole;
  status: "active" | "inactive";
}

export type UpdateUserDto = Partial<CreateUserDto>;

export class UsersService {
  static async list() {
    const response =
      await backendApi.get<ApiEnvelope<BackendAuthUser[]>>("/users");
    return unwrapEnvelope(response.data);
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
}

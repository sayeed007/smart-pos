import { backendApi } from "@/lib/axios";
import type {
  ApiEnvelope,
  LoginRequestDto,
  LoginResponseDto,
} from "@/types/backend";
import { unwrapEnvelope } from "./utils";

export interface RegisterRequestDto {
  businessName: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  currency: string;
  timezone: string;
}

export async function loginApi(
  payload: LoginRequestDto,
): Promise<LoginResponseDto> {
  const response = await backendApi.post<ApiEnvelope<LoginResponseDto>>(
    "/auth/login",
    payload,
  );
  return unwrapEnvelope<LoginResponseDto>(response.data);
}

export async function refreshTokenApi(
  refreshToken: string,
): Promise<Omit<LoginResponseDto, "user">> {
  const response = await backendApi.post<
    ApiEnvelope<Omit<LoginResponseDto, "user">>
  >("/auth/refresh", {
    refreshToken,
    deviceInfo: "tafuri-web",
  });
  return unwrapEnvelope(response.data);
}

export async function logoutApi() {
  await backendApi.post("/auth/logout");
}

export async function registerApi(payload: RegisterRequestDto) {
  const response = await backendApi.post<ApiEnvelope<void>>(
    "/auth/register",
    payload,
  );
  return unwrapEnvelope(response.data);
}

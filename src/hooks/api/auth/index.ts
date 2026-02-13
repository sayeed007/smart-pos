import { useMutation } from "@tanstack/react-query";
import type { LoginRequestDto } from "@/types/backend";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerApi,
  RegisterRequestDto,
} from "@/lib/services/backend/auth.service";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => loginApi(payload),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (refreshToken: string) => refreshTokenApi(refreshToken),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => logoutApi(),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => registerApi(payload),
  });
}

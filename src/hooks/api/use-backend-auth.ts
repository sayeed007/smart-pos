import { useMutation } from '@tanstack/react-query';
import type { LoginRequestDto } from '@/types/backend';
import { loginApi, logoutApi, refreshTokenApi } from '@/lib/services/backend/auth.service';

export function useBackendLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginRequestDto) => loginApi(payload),
  });
}

export function useBackendRefreshTokenMutation() {
  return useMutation({
    mutationFn: (refreshToken: string) => refreshTokenApi(refreshToken),
  });
}

export function useBackendLogoutMutation() {
  return useMutation({
    mutationFn: () => logoutApi(),
  });
}


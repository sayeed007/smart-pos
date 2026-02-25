const PLATFORM_ACCESS_TOKEN_KEY = "tafuri_platform_access_token";
const PLATFORM_ACCESS_TOKEN_EXP_KEY = "tafuri_platform_access_token_exp";

export interface StoredPlatformAuth {
  accessToken: string;
  accessTokenExpiresAt: string;
}

export function getStoredPlatformAuth(): StoredPlatformAuth | null {
  if (typeof window === "undefined") return null;

  const accessToken = localStorage.getItem(PLATFORM_ACCESS_TOKEN_KEY);
  const accessTokenExpiresAt = localStorage.getItem(PLATFORM_ACCESS_TOKEN_EXP_KEY);

  if (!accessToken || !accessTokenExpiresAt) {
    return null;
  }

  const expiry = Date.parse(accessTokenExpiresAt);
  if (Number.isNaN(expiry) || expiry <= Date.now()) {
    clearStoredPlatformAuth();
    return null;
  }

  return {
    accessToken,
    accessTokenExpiresAt,
  };
}

export function setStoredPlatformAuth(auth: StoredPlatformAuth) {
  if (typeof window === "undefined") return;

  localStorage.setItem(PLATFORM_ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(PLATFORM_ACCESS_TOKEN_EXP_KEY, auth.accessTokenExpiresAt);
}

export function clearStoredPlatformAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PLATFORM_ACCESS_TOKEN_KEY);
  localStorage.removeItem(PLATFORM_ACCESS_TOKEN_EXP_KEY);
}

const ACCESS_TOKEN_KEY = "tafuri_access_token";
const REFRESH_TOKEN_KEY = "tafuri_refresh_token";
const TENANT_ID_KEY = "tafuri_tenant_id";

export interface StoredAuth {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
}

export function getStoredAuth(): StoredAuth {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, tenantId: null };
  }

  return {
    accessToken: null, // Tokens are now in HttpOnly cookies
    refreshToken: null,
    tenantId: localStorage.getItem(TENANT_ID_KEY),
  };
}

export function setStoredAuth(auth: {
  accessToken?: string;
  refreshToken?: string;
  tenantId?: string;
}) {
  if (typeof window === "undefined") return;

  // Tokens are handled by HttpOnly cookies, so we don't store them here anymore
  if (auth.tenantId) localStorage.setItem(TENANT_ID_KEY, auth.tenantId);
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TENANT_ID_KEY);
}

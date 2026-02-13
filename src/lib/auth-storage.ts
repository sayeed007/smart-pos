const ACCESS_TOKEN_KEY = 'aura_access_token';
const REFRESH_TOKEN_KEY = 'aura_refresh_token';
const TENANT_ID_KEY = 'aura_tenant_id';

export interface StoredAuth {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
}

export function getStoredAuth(): StoredAuth {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null, tenantId: null };
  }

  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    tenantId: localStorage.getItem(TENANT_ID_KEY),
  };
}

export function setStoredAuth(auth: {
  accessToken: string;
  refreshToken?: string;
  tenantId?: string;
}) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  if (auth.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  if (auth.tenantId) localStorage.setItem(TENANT_ID_KEY, auth.tenantId);
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TENANT_ID_KEY);
}


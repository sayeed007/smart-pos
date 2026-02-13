import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth-storage";
import { BACKEND_API_URL } from "@/config/backend-api";

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

// Legacy/mock API client used by existing Next.js route handlers.
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Backend API client (NestJS server).
export const backendApi = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor for legacy/mock client.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("aura_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer mock-token-${user.id}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

backendApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = getStoredAuth();
    // Tokens are in cookies now
    if (auth.tenantId) {
      config.headers = config.headers ?? {};
      config.headers["X-Tenant-ID"] = auth.tenantId;
    }
    const csrfToken = getCookieValue("csrfToken");
    if (csrfToken) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Global error handling with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Track if we're currently refreshing to avoid multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

backendApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If error is not 401 or request already retried, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Retry without adding header
          return backendApi(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Attempt to refresh the token via cookie
      console.log("[Auth] Attempting token refresh...");
      const csrfToken = getCookieValue("csrfToken");
      await axios.post(
        `${BACKEND_API_URL}/auth/refresh`,
        { deviceInfo: "aura-web" },
        {
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
          },
          withCredentials: true,
        },
      );

      console.log("[Auth] Token refresh successful via cookies");

      // Process queued requests
      processQueue(null, null); // passing null as token since we use cookies
      isRefreshing = false;

      // Retry the original request
      return backendApi(originalRequest);
    } catch (refreshError) {
      // Refresh failed, logout
      console.error("[Auth] Token refresh failed:", refreshError);
      processQueue(refreshError, null);
      isRefreshing = false;
      clearStoredAuth();
      localStorage.removeItem("aura_user");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  },
);

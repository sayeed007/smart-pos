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

// Backend API client (NestJS server).
export const backendApi = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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
      config.headers["x-csrf-token"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
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
      if (process.env.NODE_ENV !== "production") {
        console.log("[Auth] Attempting token refresh...");
      }
      const csrfToken = getCookieValue("csrfToken");
      await axios.post(
        `${BACKEND_API_URL}/auth/refresh`,
        { deviceInfo: "aura-web" },
        {
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
          },
          withCredentials: true,
        },
      );

      if (process.env.NODE_ENV !== "production") {
        console.log("[Auth] Token refresh successful via cookies");
      }

      // Process queued requests
      processQueue(null, null); // passing null as token since we use cookies
      isRefreshing = false;

      // Retry the original request
      return backendApi(originalRequest);
    } catch (refreshError) {
      // Refresh failed, logout
      if (process.env.NODE_ENV !== "production") {
        console.error("[Auth] Token refresh failed:", refreshError);
      }
      processQueue(refreshError, null);
      isRefreshing = false;
      clearStoredAuth();
      localStorage.removeItem("aura_user");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  },
);

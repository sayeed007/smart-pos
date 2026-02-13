import axios from "axios";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "@/lib/auth-storage";
import { BACKEND_API_URL } from "@/config/backend-api";

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
});

// Request interceptor for legacy/mock client.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("aura_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
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
  (config) => {
    const auth = getStoredAuth();
    if (auth.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    if (auth.tenantId) {
      config.headers["X-Tenant-ID"] = auth.tenantId;
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

backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return backendApi(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const auth = getStoredAuth();

    if (!auth.refreshToken) {
      // No refresh token available, logout
      isRefreshing = false;
      clearStoredAuth();
      localStorage.removeItem("aura_user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh the token
      console.log("[Auth] Attempting token refresh...");
      const response = await axios.post(
        `${BACKEND_API_URL}/auth/refresh`,
        { refreshToken: auth.refreshToken, deviceInfo: "aura-web" },
        { headers: { "Content-Type": "application/json" } },
      );

      // Backend wraps response in { success, data, meta } via ResponseInterceptor
      const responseData = response.data?.data ?? response.data;
      const newAccessToken = responseData.accessToken;
      const newRefreshToken = responseData.refreshToken;

      console.log("[Auth] Token refresh successful, new tokens received:", {
        hasAccessToken: !!newAccessToken,
        hasRefreshToken: !!newRefreshToken,
      });

      if (!newAccessToken) {
        throw new Error("No access token in refresh response");
      }

      // Update stored auth using setStoredAuth for consistency
      setStoredAuth({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      // Update the failed request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests
      processQueue(null, newAccessToken);
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

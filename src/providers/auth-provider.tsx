"use client";

import { clearStoredAuth, setStoredAuth } from "@/lib/auth-storage";
import { User, UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/features/settings/store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, tenantId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

type BackendRole = string | { name?: string | null } | null | undefined;
type BackendRoleInput = BackendRole[] | BackendRole;

const normalizeBackendRoles = (
  backendRoles: BackendRoleInput | undefined,
): string[] => {
  const roleList = Array.isArray(backendRoles)
    ? backendRoles
    : backendRoles
      ? [backendRoles]
      : [];

  return roleList
    .map((role) => {
      if (typeof role === "string") return role;
      if (role && typeof role === "object" && typeof role.name === "string") {
        return role.name;
      }
      return "";
    })
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean);
};

export const mapBackendRoleToUiRole = (
  backendRoles: BackendRoleInput | undefined,
  fallback?: UserRole,
): UserRole => {
  const normalized = normalizeBackendRoles(backendRoles);

  if (normalized.some((role) => role.includes("admin"))) return UserRole.ADMIN;
  if (normalized.some((role) => role.includes("manager"))) {
    return UserRole.MANAGER;
  }
  if (normalized.some((role) => role.includes("cashier"))) {
    return UserRole.CASHIER;
  }

  return fallback ?? UserRole.CASHIER;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem("tafuri_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from storage", e);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, tenantId: string) => {
    setStoredAuth({ tenantId });
    setUser(userData);
    localStorage.setItem("tafuri_user", JSON.stringify(userData));

    if (
      userData.role === UserRole.ADMIN ||
      userData.role === UserRole.MANAGER
    ) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/cashier/pos");
    }
  };

  const logout = () => {
    setUser(null);
    clearStoredAuth();
    localStorage.removeItem("aura_user");
    useSettingsStore.getState().resetSettings();
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

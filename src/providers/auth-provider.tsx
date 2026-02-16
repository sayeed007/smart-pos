"use client";

import { clearStoredAuth, setStoredAuth } from "@/lib/auth-storage";
import { User, UserRole } from "@/types";
import { useRouter } from "next/navigation";
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

export const mapBackendRoleToUiRole = (
  backendRoles: BackendRole[] | undefined,
  fallback?: UserRole,
): UserRole => {
  const normalized = (backendRoles ?? [])
    .map((role) => {
      if (typeof role === "string") return role;
      if (role && typeof role === "object" && typeof role.name === "string") {
        return role.name;
      }
      return "";
    })
    .filter(Boolean)
    .map((role) => role.toLowerCase());

  if (normalized.includes("admin")) return UserRole.ADMIN;
  if (normalized.includes("manager")) return UserRole.MANAGER;
  if (normalized.includes("cashier")) return UserRole.CASHIER;

  return fallback ?? UserRole.CASHIER;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem("aura_user");
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
    localStorage.setItem("aura_user", JSON.stringify(userData));

    if (
      userData.role === UserRole.ADMIN ||
      userData.role === UserRole.MANAGER
    ) {
      router.push("/admin/dashboard");
    } else {
      router.push("/cashier/pos");
    }
  };

  const logout = () => {
    setUser(null);
    clearStoredAuth();
    localStorage.removeItem("aura_user");
    router.push("/login");
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

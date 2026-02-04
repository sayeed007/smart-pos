"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage or session
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

  const login = async (email: string, role: UserRole) => {
    // Mock login -> In real app, call API
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser: User = {
      id: "u1",
      name: email.split("@")[0] || "User",
      email: email,
      role: role,
      status: "active",
    };

    setUser(mockUser);
    localStorage.setItem("aura_user", JSON.stringify(mockUser));
    setIsLoading(false);

    // Redirect based on role
    if (role === UserRole.ADMIN) {
      router.push("/admin/dashboard");
    } else if (role === UserRole.CASHIER) {
      router.push("/cashier/pos");
    }
  };

  const logout = () => {
    setUser(null);
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

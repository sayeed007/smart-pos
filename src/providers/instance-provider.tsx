"use client";

/**
 * Instance Provider
 * Manages instance-specific configuration from the server
 */

import React, { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  InstanceConfig,
  defaultInstanceConfig,
} from "@/config/instance.config";

interface InstanceContextType {
  instance: InstanceConfig;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const InstanceContext = createContext<InstanceContextType | undefined>(
  undefined,
);

export function InstanceProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, refetch } = useQuery<InstanceConfig>({
    queryKey: ["instance-config"],
    queryFn: async () => {
      try {
        const response = await api.get("/instance/config");
        return response.data;
      } catch (error) {
        console.warn("Failed to load instance config, using defaults:", error);
        return defaultInstanceConfig;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour - instance config rarely changes
    retry: 2,
  });

  const instance = React.useMemo(() => data || defaultInstanceConfig, [data]);

  useEffect(() => {
    if (instance && instance !== defaultInstanceConfig) {
      // Update document title
      document.title = `${instance.companyName} - POS System`;

      // Update favicon if provided
      if (instance.faviconUrl) {
        const link = document.querySelector(
          "link[rel~='icon']",
        ) as HTMLLinkElement;
        if (link) {
          link.href = instance.faviconUrl;
        }
      }
    }
  }, [instance]);

  return (
    <InstanceContext.Provider
      value={{
        instance,
        isLoading,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </InstanceContext.Provider>
  );
}

/**
 * Hook to use instance configuration
 */
export function useInstance() {
  const context = useContext(InstanceContext);
  if (context === undefined) {
    throw new Error("useInstance must be used within InstanceProvider");
  }
  return context;
}

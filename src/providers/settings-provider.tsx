"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTenantProfile } from "@/hooks/api/tenants";
import { useRemoteSettings } from "@/hooks/api/settings";
import { useSettingsStore } from "@/features/settings/store";
import { mapRemoteToLocalSettings } from "@/features/settings/mappers";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data: tenant } = useTenantProfile(isAuthenticated);
  const { data: remoteSettings } = useRemoteSettings(undefined, isAuthenticated);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const lastApiHashRef = useRef<string>("");

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!tenant && !remoteSettings) return;

    const apiHash = JSON.stringify({ tenant, remoteSettings });
    if (apiHash === lastApiHashRef.current) return;
    lastApiHashRef.current = apiHash;

    const currentStore = useSettingsStore.getState();
    const mapped = mapRemoteToLocalSettings(currentStore, tenant, remoteSettings);
    updateSettings(mapped);
  }, [isAuthenticated, remoteSettings, tenant, updateSettings]);

  return <>{children}</>;
}

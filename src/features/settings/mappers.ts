import { SettingsState } from "./store";
import { TenantProfile } from "@/lib/services/backend/tenants.service";
import { SettingsMap } from "@/lib/services/backend/settings.service";

const asString = (value: unknown, fallback: string): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
};

const asNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asPaperWidth = (value: unknown, fallback: "58mm" | "80mm") =>
  value === "58mm" || value === "80mm" ? value : fallback;

export function mapRemoteToLocalSettings(
  base: SettingsState,
  tenant?: TenantProfile,
  remoteSettings?: SettingsMap,
): Partial<SettingsState> {
  const payload: Partial<SettingsState> = {
    storeName: tenant?.name ?? base.storeName,
    storeAddress: tenant?.address ?? base.storeAddress,
    storePhone: tenant?.contactPhone ?? base.storePhone,
    storeEmail: tenant?.contactEmail ?? base.storeEmail,
    storeTagline: tenant?.tagline ?? base.storeTagline,
    storeLogoUrl: tenant?.logoUrl ?? base.storeLogoUrl,
    currency: tenant?.currency ?? base.currency,
    taxRate: asNumber(remoteSettings?.taxRate, base.taxRate),
    currencySymbol: asString(
      remoteSettings?.currencySymbol,
      base.currencySymbol,
    ),
    receiptHeader: asString(remoteSettings?.receiptHeader, base.receiptHeader),
    receiptFooter: asString(remoteSettings?.receiptFooter, base.receiptFooter),
    paperWidth: asPaperWidth(remoteSettings?.paperWidth, base.paperWidth),
  };

  return payload;
}

export function buildSettingsPayload(
  state: Pick<
    SettingsState,
    "taxRate" | "currencySymbol" | "receiptHeader" | "receiptFooter" | "paperWidth"
  >,
): SettingsMap {
  return {
    taxRate: state.taxRate,
    currencySymbol: state.currencySymbol,
    receiptHeader: state.receiptHeader,
    receiptFooter: state.receiptFooter,
    paperWidth: state.paperWidth,
  };
}

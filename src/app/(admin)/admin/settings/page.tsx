"use client";

import { LocationsTab } from "@/components/location/LocationsTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { ServerImage } from "@/components/ui/server-image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AuditLogsTab } from "@/features/settings/components/AuditLogsTab";
import { PriceBookManager } from "@/features/settings/components/PriceBookManager";
import {
  buildSettingsPayload,
  mapRemoteToLocalSettings,
} from "@/features/settings/mappers";
import type { SettingsState } from "@/features/settings/store";
import { useSettingsStore } from "@/features/settings/store";
import {
  useRemoteSettings,
  useUpdateRemoteSettings,
} from "@/hooks/api/settings";
import { useTenantProfile, useUpdateTenantProfile } from "@/hooks/api/tenants";
import {
  DollarSign,
  FileText,
  Loader2,
  Printer,
  Save,
  Store,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type SettingsFormState = Pick<
  SettingsState,
  | "storeName"
  | "storeAddress"
  | "storePhone"
  | "storeEmail"
  | "storeTagline"
  | "storeLogoUrl"
  | "currency"
  | "taxRate"
  | "currencySymbol"
  | "receiptHeader"
  | "receiptFooter"
  | "paperWidth"
>;

export default function SettingsPage() {
  const { t } = useTranslation(["settings", "common"]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const storeSettings = useSettingsStore();
  const updateSettingsStore = useSettingsStore((s) => s.updateSettings);

  const {
    data: tenantProfile,
    isLoading: isTenantLoading,
    isFetching: isTenantFetching,
  } = useTenantProfile();
  const {
    data: remoteSettings,
    isLoading: isRemoteSettingsLoading,
    isFetching: isRemoteSettingsFetching,
  } = useRemoteSettings();
  const updateTenantMutation = useUpdateTenantProfile();
  const updateRemoteSettingsMutation = useUpdateRemoteSettings();

  const [localSettings, setLocalSettings] = useState<SettingsFormState>({
    storeName: storeSettings.storeName,
    storeAddress: storeSettings.storeAddress,
    storePhone: storeSettings.storePhone,
    storeEmail: storeSettings.storeEmail,
    storeTagline: storeSettings.storeTagline,
    storeLogoUrl: storeSettings.storeLogoUrl,
    currency: storeSettings.currency,
    taxRate: storeSettings.taxRate,
    currencySymbol: storeSettings.currencySymbol,
    receiptHeader: storeSettings.receiptHeader,
    receiptFooter: storeSettings.receiptFooter,
    paperWidth: storeSettings.paperWidth,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("");
  const logoObjectUrlRef = useRef<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  const isSaving =
    updateTenantMutation.isPending || updateRemoteSettingsMutation.isPending;
  const isLoading = !isHydrated && (isTenantLoading || isRemoteSettingsLoading);

  useEffect(() => {
    if (isHydrated) return;
    if (!tenantProfile && !remoteSettings) return;

    const merged = mapRemoteToLocalSettings(
      storeSettings,
      tenantProfile,
      remoteSettings,
    );
    const timer = setTimeout(() => {
      setLocalSettings((prev) => ({ ...prev, ...merged }));
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [isHydrated, remoteSettings, storeSettings, tenantProfile]);

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current);
        logoObjectUrlRef.current = "";
      }
    };
  }, []);

  const revokeLogoPreview = () => {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = "";
    }
  };

  const handleChange = <K extends keyof SettingsFormState>(
    key: K,
    value: SettingsFormState[K],
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const previewLogo = useMemo(() => {
    if (logoPreviewUrl) return logoPreviewUrl;
    return localSettings.storeLogoUrl;
  }, [localSettings.storeLogoUrl, logoPreviewUrl]);

  const normalizeEmail = (value: string) => value.trim();
  const normalizeText = (value: string) => value.trim();

  const validate = () => {
    const currency = localSettings.currency.trim().toUpperCase();
    if (currency.length !== 3) {
      toast.error(
        t("validation.currencyCode", "Currency code must be 3 letters."),
      );
      return false;
    }
    if (Number.isNaN(localSettings.taxRate) || localSettings.taxRate < 0) {
      toast.error(
        t(
          "validation.taxRate",
          "Tax rate must be a valid non-negative number.",
        ),
      );
      return false;
    }
    return true;
  };

  const handleLogoPick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error(
        t(
          "validation.logoFormat",
          "Only PNG, JPEG, and WebP logo files are allowed.",
        ),
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("validation.logoSize", "Logo file must be under 5MB."));
      return;
    }
    revokeLogoPreview();
    const objectUrl = URL.createObjectURL(file);
    logoObjectUrlRef.current = objectUrl;
    setLogoPreviewUrl(objectUrl);
    setLogoFile(file);
  };

  const handleLogoRemove = () => {
    revokeLogoPreview();
    setLogoFile(null);
    setLogoPreviewUrl("");
    handleChange("storeLogoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const normalizedCurrency = localSettings.currency.trim().toUpperCase();
      const updatedTenant = await updateTenantMutation.mutateAsync({
        name: normalizeText(localSettings.storeName),
        address: normalizeText(localSettings.storeAddress),
        contactPhone: normalizeText(localSettings.storePhone),
        contactEmail: normalizeEmail(localSettings.storeEmail),
        tagline: normalizeText(localSettings.storeTagline),
        currency: normalizedCurrency,
        logoUrl: logoFile ? undefined : localSettings.storeLogoUrl,
        logoFile: logoFile || undefined,
      });

      await updateRemoteSettingsMutation.mutateAsync({
        settings: buildSettingsPayload({
          taxRate: localSettings.taxRate,
          currencySymbol: localSettings.currencySymbol,
          receiptHeader: localSettings.receiptHeader,
          receiptFooter: localSettings.receiptFooter,
          paperWidth: localSettings.paperWidth,
        }),
      });

      const finalSettings: Partial<SettingsState> = {
        storeName: updatedTenant.name || localSettings.storeName,
        storeAddress: updatedTenant.address || localSettings.storeAddress,
        storePhone: updatedTenant.contactPhone || localSettings.storePhone,
        storeEmail: updatedTenant.contactEmail || localSettings.storeEmail,
        storeTagline: updatedTenant.tagline || localSettings.storeTagline,
        storeLogoUrl: updatedTenant.logoUrl || localSettings.storeLogoUrl,
        currency: updatedTenant.currency || normalizedCurrency,
        taxRate: localSettings.taxRate,
        currencySymbol: localSettings.currencySymbol,
        receiptHeader: localSettings.receiptHeader,
        receiptFooter: localSettings.receiptFooter,
        paperWidth: localSettings.paperWidth,
      };

      updateSettingsStore(finalSettings);
      setLocalSettings((prev) => ({ ...prev, ...finalSettings }));
      setLogoFile(null);
      toast.success(t("toasts.success", "Settings saved successfully"));
    } catch (error) {
      console.error(error);
      toast.error(
        t("toasts.failure", "Failed to save settings. Please try again."),
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("title", "Settings")}
        description={t(
          "subtitle",
          "Configure branding, system settings, and print preferences.",
        )}
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            {t("tabs.general", "General")}
          </TabsTrigger>
          <TabsTrigger value="locations">
            {t("tabs.locations", "Locations")}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            {t("tabs.pricing", "Pricing Strategy")}
          </TabsTrigger>
          <TabsTrigger value="audit-logs">
            {t("tabs.auditLogs", "Audit Logs")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center rounded-xl border border-sidebar-border bg-card">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <Card className="rounded-xl border border-sidebar-border shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Store className="h-5 w-5" />
                    <CardTitle className="typo-bold-18">
                      {t("sections.branding.title", "Branding")}
                    </CardTitle>
                    {(isTenantFetching || isRemoteSettingsFetching) && (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        {t("sections.branding.logo", "Company Logo")}
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
                          {previewLogo ? (
                            <ServerImage
                              src={previewLogo}
                              alt="Store logo"
                              width={96}
                              height={96}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-center typo-regular-12 text-muted-foreground">
                              {t(
                                "sections.branding.logoPlaceholder",
                                "No logo",
                              )}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleLogoFileChange}
                          />
                          <PrimaryActionButton
                            type="button"
                            onClick={handleLogoPick}
                            className="h-9"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {t("sections.branding.uploadLogo", "Upload Logo")}
                          </PrimaryActionButton>
                          {previewLogo && (
                            <button
                              type="button"
                              onClick={handleLogoRemove}
                              className="inline-flex items-center typo-medium-12 text-muted-foreground hover:text-destructive"
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              {t("sections.branding.removeLogo", "Remove Logo")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tagline">
                        {t("sections.branding.tagline", "Tagline")}
                      </Label>
                      <Input
                        id="tagline"
                        value={localSettings.storeTagline}
                        onChange={(e) =>
                          handleChange("storeTagline", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Store className="h-5 w-5" />
                    <CardTitle className="typo-bold-18">
                      {t("sections.store.title", "Store Settings")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">
                        {t("sections.store.name", "Store Name")}
                      </Label>
                      <Input
                        id="storeName"
                        value={localSettings.storeName}
                        onChange={(e) =>
                          handleChange("storeName", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        {t("sections.store.address", "Address")}
                      </Label>
                      <Input
                        id="address"
                        value={localSettings.storeAddress}
                        onChange={(e) =>
                          handleChange("storeAddress", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {t("sections.store.phone", "Phone")}
                      </Label>
                      <Input
                        id="phone"
                        value={localSettings.storePhone}
                        onChange={(e) =>
                          handleChange("storePhone", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t("sections.store.email", "Email")}
                      </Label>
                      <Input
                        id="email"
                        value={localSettings.storeEmail}
                        onChange={(e) =>
                          handleChange("storeEmail", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <FileText className="h-5 w-5" />
                    <CardTitle className="typo-bold-18">
                      {t("sections.receipt.title", "Receipt Content")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="header">
                        {t(
                          "sections.receipt.header",
                          "Receipt Header (Top Message)",
                        )}
                      </Label>
                      <Input
                        id="header"
                        value={localSettings.receiptHeader}
                        onChange={(e) =>
                          handleChange("receiptHeader", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer">
                        {t(
                          "sections.receipt.footer",
                          "Receipt Footer (Bottom Message)",
                        )}
                      </Label>
                      <Textarea
                        id="footer"
                        value={localSettings.receiptFooter}
                        onChange={(e) =>
                          handleChange("receiptFooter", e.target.value)
                        }
                        className="min-h-20 resize-none bg-muted/30"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-xl border border-sidebar-border shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <DollarSign className="h-5 w-5" />
                    <CardTitle className="typo-bold-18">
                      {t("sections.currencyTax.title", "Currency & Tax")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">
                        {t(
                          "sections.currencyTax.currencyCode",
                          "Currency Code",
                        )}
                      </Label>
                      <Input
                        id="currency"
                        value={localSettings.currency}
                        onChange={(e) =>
                          handleChange("currency", e.target.value.toUpperCase())
                        }
                        className="bg-muted/30"
                        maxLength={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="symbol">
                        {t(
                          "sections.currencyTax.currencySymbol",
                          "Currency Symbol",
                        )}
                      </Label>
                      <Input
                        id="symbol"
                        value={localSettings.currencySymbol}
                        onChange={(e) =>
                          handleChange("currencySymbol", e.target.value)
                        }
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax">
                        {t(
                          "sections.currencyTax.defaultTaxRate",
                          "Default Tax Rate (%)",
                        )}
                      </Label>
                      <Input
                        type="number"
                        id="tax"
                        value={localSettings.taxRate}
                        onChange={(e) =>
                          handleChange("taxRate", Number(e.target.value))
                        }
                        className="bg-muted/30"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-sidebar-border shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <Printer className="h-5 w-5" />
                    <CardTitle className="typo-bold-18">
                      {t("sections.hardware.title", "Hardware Configuration")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paperWidth">
                        {t(
                          "sections.hardware.paperWidth",
                          "Printer Paper Width",
                        )}
                      </Label>
                      <select
                        id="paperWidth"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 typo-medium-14"
                        value={localSettings.paperWidth}
                        onChange={(e) => {
                          const width =
                            e.target.value === "58mm" ? "58mm" : "80mm";
                          handleChange("paperWidth", width);
                        }}
                      >
                        <option value="80mm">
                          {t(
                            "sections.hardware.80mm",
                            "80mm (Standard Thermal)",
                          )}
                        </option>
                        <option value="58mm">
                          {t("sections.hardware.58mm", "58mm (Small Thermal)")}
                        </option>
                      </select>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 typo-regular-14 text-yellow-800">
                      <strong>{t("sections.hardware.note", "Note")}:</strong>{" "}
                      {t(
                        "sections.hardware.noteMessage",
                        "Printer uses browser print dialog. Set your default printer correctly.",
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <PrimaryActionButton
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary px-8 text-primary-foreground shadow-lg hover:bg-primary/90"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t("actions.save", "Save Settings")}
            </PrimaryActionButton>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <PriceBookManager />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsTab />
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-6">
          <AuditLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, FileText, Printer, Save, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/features/settings/store";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceBookManager } from "@/features/settings/components/PriceBookManager";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/ui/page-header";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation(["settings", "common"]);
  const settings = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync store changes to local state on mount/change
  useEffect(() => {
    setLocalSettings(settings);
  }, [
    settings.storeName,
    settings.storeAddress,
    settings.storePhone,
    settings.storeEmail,
    settings.currency,
    settings.taxRate,
    settings.currencySymbol,
    settings.receiptHeader,
    settings.receiptFooter,
    settings.paperWidth,
  ]);

  const handleChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    settings.updateSettings(localSettings);
    toast.success(t("toasts.success", "Settings saved successfully"));
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={t("title", "Settings")}
        description={t("subtitle", "Configure system settings & Receipts")}
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            {t("tabs.general", "General")}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            {t("tabs.pricing", "Pricing Strategy")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Store Settings */}
              <Card className="rounded-xl border border-sidebar-border shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Store className="w-5 h-5" />
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

              {/* Receipt Content Settings */}
              <Card className="rounded-xl border border-sidebar-border shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <FileText className="w-5 h-5" />
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
                      placeholder={t(
                        "sections.receipt.placeholders.header",
                        "Welcome to our store!",
                      )}
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
                      className="bg-muted/30 resize-none min-h-20"
                      placeholder={t(
                        "sections.receipt.placeholders.footer",
                        "Thank you for visiting!",
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Currency & Tax */}
              <Card className="rounded-xl border border-sidebar-border shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <DollarSign className="w-5 h-5" />
                  <CardTitle className="typo-bold-18">
                    {t("sections.currencyTax.title", "Currency & Tax")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      {t("sections.currencyTax.currencyCode", "Currency Code")}
                    </Label>
                    <Input
                      id="currency"
                      value={localSettings.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="bg-muted/30"
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

              {/* Hardware Configuration */}
              <Card className="rounded-xl border border-sidebar-border shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Printer className="w-5 h-5" />
                  <CardTitle className="typo-bold-18">
                    {t("sections.hardware.title", "Hardware Configuration")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperWidth">
                      {t("sections.hardware.paperWidth", "Printer Paper Width")}
                    </Label>
                    <select
                      id="paperWidth"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file: file: placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 typo-medium-14"
                      value={localSettings.paperWidth}
                      onChange={(e) =>
                        handleChange("paperWidth", e.target.value)
                      }
                    >
                      <option value="80mm">
                        {t("sections.hardware.80mm", "80mm (Standard Thermal)")}
                      </option>
                      <option value="58mm">
                        {t("sections.hardware.58mm", "58mm (Small Thermal)")}
                      </option>
                    </select>
                  </div>

                  <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 typo-regular-14">
                    <strong>{t("sections.hardware.note", "Note")}:</strong>{" "}
                    {t(
                      "sections.hardware.noteMessage",
                      "Currently relying on Browser Print Dialog. Please ensure your system default printer is set correctly.",
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <PrimaryActionButton
              onClick={handleSave}
              className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              {t("actions.save", "Save Settings")}
            </PrimaryActionButton>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <PriceBookManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
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
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Settings"
        description="Configure system settings & Receipts"
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Store Settings */}
              <Card className="rounded-xl border border-sidebar-border shadow-sm">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Store className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold">
                    Store Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
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
                    <Label htmlFor="address">Address</Label>
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
                    <Label htmlFor="phone">Phone</Label>
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
                    <Label htmlFor="email">Email</Label>
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
                  <CardTitle className="text-lg font-bold">
                    Receipt Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="header">Receipt Header (Top Message)</Label>
                    <Input
                      id="header"
                      value={localSettings.receiptHeader}
                      onChange={(e) =>
                        handleChange("receiptHeader", e.target.value)
                      }
                      className="bg-muted/30"
                      placeholder="Welcome to our store!"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer">
                      Receipt Footer (Bottom Message)
                    </Label>
                    <Textarea
                      id="footer"
                      value={localSettings.receiptFooter}
                      onChange={(e) =>
                        handleChange("receiptFooter", e.target.value)
                      }
                      className="bg-muted/30 resize-none min-h-[80px]"
                      placeholder="Thank you for visiting!"
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
                  <CardTitle className="text-lg font-bold">
                    Currency & Tax
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency Code</Label>
                    <Input
                      id="currency"
                      value={localSettings.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Currency Symbol</Label>
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
                    <Label htmlFor="tax">Default Tax Rate (%)</Label>
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
                  <CardTitle className="text-lg font-bold">
                    Hardware Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperWidth">Printer Paper Width</Label>
                    <select
                      id="paperWidth"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={localSettings.paperWidth}
                      onChange={(e) =>
                        handleChange("paperWidth", e.target.value)
                      }
                    >
                      <option value="80mm">80mm (Standard Thermal)</option>
                      <option value="58mm">58mm (Small Thermal)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                    <strong>Note:</strong> Currently relying on Browser Print
                    Dialog. Please ensure your system default printer is set
                    correctly.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <PriceBookManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

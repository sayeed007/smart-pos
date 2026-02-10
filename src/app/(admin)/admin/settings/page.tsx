"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator,
  DollarSign,
  FileText,
  Printer,
  Save,
  Store,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [storeSettings, setStoreSettings] = useState({
    name: "My POS Store",
    address: "123 Main Street, City, State",
    phone: "+1234567890",
    email: "store@example.com",
  });

  const [currencySettings, setCurrencySettings] = useState({
    currency: "USD",
    taxRate: "10",
    symbol: "$",
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "INV",
    footerArg: "Thank you for your business!",
  });

  const [hardwareSettings, setHardwareSettings] = useState({
    printer: "",
    scanner: "",
    cashDrawer: "",
  });

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      toast.success("Settings saved successfully");
    }, 500);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Configure system settings
        </p>
      </div>

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
                  value={storeSettings.name}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, name: e.target.value })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={storeSettings.address}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      address: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={storeSettings.phone}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      phone: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={storeSettings.email}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      email: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card className="rounded-xl border border-sidebar-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <FileText className="w-5 h-5" />
              <CardTitle className="text-lg font-bold">
                Invoice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prefix">Invoice Prefix</Label>
                <Input
                  id="prefix"
                  value={invoiceSettings.prefix}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      prefix: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer">Invoice Footer Text</Label>
                <Textarea
                  id="footer"
                  value={invoiceSettings.footerArg}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      footerArg: e.target.value,
                    })
                  }
                  className="bg-muted/30 resize-none min-h-[80px]"
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
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={currencySettings.currency}
                  onChange={(e) =>
                    setCurrencySettings({
                      ...currencySettings,
                      currency: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Default Tax Rate (%)</Label>
                <Input
                  id="tax"
                  value={currencySettings.taxRate}
                  onChange={(e) =>
                    setCurrencySettings({
                      ...currencySettings,
                      taxRate: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symbol">Currency Symbol</Label>
                <Input
                  id="symbol"
                  value={currencySettings.symbol}
                  onChange={(e) =>
                    setCurrencySettings({
                      ...currencySettings,
                      symbol: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Hardware Integration */}
          <Card className="rounded-xl border border-sidebar-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Printer className="w-5 h-5" />
              <CardTitle className="text-lg font-bold">
                Hardware Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="printer">Receipt Printer</Label>
                <Input
                  id="printer"
                  placeholder="Printer not configured"
                  value={hardwareSettings.printer}
                  onChange={(e) =>
                    setHardwareSettings({
                      ...hardwareSettings,
                      printer: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scanner">Barcode Scanner</Label>
                <Input
                  id="scanner"
                  placeholder="Scanner not configured"
                  value={hardwareSettings.scanner}
                  onChange={(e) =>
                    setHardwareSettings({
                      ...hardwareSettings,
                      scanner: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drawer">Cash Drawer</Label>
                <Input
                  id="drawer"
                  placeholder="Drawer not configured"
                  value={hardwareSettings.cashDrawer}
                  onChange={(e) =>
                    setHardwareSettings({
                      ...hardwareSettings,
                      cashDrawer: e.target.value,
                    })
                  }
                  className="bg-muted/30"
                />
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
    </div>
  );
}

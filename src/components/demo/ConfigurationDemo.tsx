"use client";

/**
 * Configuration Demo Component
 * Shows all three configuration features in action:
 * 1. Instance Configuration
 * 2. Theme System
 * 3. i18n
 *
 * This is a reference component showing how to use all systems together
 */

import React from "react";
import { useInstance } from "@/providers/instance-provider";
import { useCustomTheme } from "@/providers/custom-theme-provider";
import { useLanguage } from "@/providers/i18n-provider";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function ConfigurationDemo() {
  const { t } = useTranslation("common");

  // 1. Instance Configuration
  const { instance, isLoading: instanceLoading } = useInstance();

  // 2. Theme System
  const { themeConfig, setThemeName, availableThemes } = useCustomTheme();
  const { theme, setTheme } = useTheme();

  // 3. i18n
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  if (instanceLoading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Configuration System Demo</h1>

      {/* Instance Configuration */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          1. Instance Configuration (Multi-Tenancy)
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Image
              src={instance.logoUrl}
              alt={instance.companyName}
              width={64}
              height={64}
              className="rounded-lg"
            />
            <div>
              <p className="font-semibold text-lg">{instance.companyName}</p>
              <p className="text-sm text-muted-foreground">
                {instance.tagline}
              </p>
              <p className="text-xs text-muted-foreground">
                Instance ID: {instance.instanceId}
              </p>
            </div>
          </div>

          {instance.contact && (
            <div className="text-sm space-y-1">
              <p>
                <strong>Email:</strong> {instance.contact.email}
              </p>
              <p>
                <strong>Phone:</strong> {instance.contact.phone}
              </p>
            </div>
          )}

          {instance.features && (
            <div className="text-sm">
              <p className="font-semibold mb-2">Enabled Features:</p>
              <ul className="list-disc list-inside space-y-1">
                {instance.features.enableInventory && (
                  <li>Inventory Management</li>
                )}
                {instance.features.enableOffers && <li>Offers & Promotions</li>}
                {instance.features.enableCustomerLoyalty && (
                  <li>Customer Loyalty</li>
                )}
                {instance.features.enableMultiCurrency && (
                  <li>Multi-Currency</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Theme System */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">2. Theme System</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">
              Current Theme: {themeConfig.name}
            </p>
            <p className="text-sm font-semibold mb-2">
              Current Mode: {theme || "system"}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Light/Dark Mode:</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                size="sm"
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                size="sm"
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Color Themes:</p>
            <div className="flex gap-2 flex-wrap">
              {availableThemes.map((themeName) => (
                <Button
                  key={themeName}
                  size="sm"
                  variant={
                    themeConfig.name === themeName ? "default" : "outline"
                  }
                  onClick={() => setThemeName(themeName)}
                  className="capitalize"
                >
                  {themeName}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Theme Colors:</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: themeConfig.light.primary }}
                />
                <span className="text-xs">Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: themeConfig.light.secondary }}
                />
                <span className="text-xs">Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: themeConfig.light.accent }}
                />
                <span className="text-xs">Accent</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* i18n */}
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          3. Internationalization (i18n)
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">
              Current Language:{" "}
              {
                availableLanguages.find((l) => l.code === currentLanguage)
                  ?.nativeName
              }
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Available Languages:</p>
            <div className="flex gap-2 flex-wrap">
              {availableLanguages.map((lang) => (
                <Button
                  key={lang.code}
                  size="sm"
                  variant={
                    currentLanguage === lang.code ? "default" : "outline"
                  }
                  onClick={() => changeLanguage(lang.code)}
                >
                  {lang.nativeName}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Translation Example:</p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Welcome:</strong> {t("welcome")}
              </p>
              <p>
                <strong>Save:</strong> {t("save")}
              </p>
              <p>
                <strong>Cancel:</strong> {t("cancel")}
              </p>
              <p>
                <strong>Loading:</strong> {t("loading")}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Integration Example */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <h2 className="text-2xl font-semibold mb-4">All Together</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>{instance.companyName}</strong> is using the{" "}
            <strong>{themeConfig.name}</strong> theme in{" "}
            <strong>{theme || "system"}</strong> mode with{" "}
            <strong>
              {availableLanguages.find((l) => l.code === currentLanguage)?.name}
            </strong>{" "}
            language.
          </p>
          <p className="text-muted-foreground">
            All these settings are persistent and will be restored on page
            reload.
          </p>
        </div>
      </Card>
    </div>
  );
}

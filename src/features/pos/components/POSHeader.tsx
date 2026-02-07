"use client";

/**
 * POS Header Component
 * Header with theme and language selectors for the POS interface
 */

import React from "react";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useInstance } from "@/providers/instance-provider";

export function POSHeader() {
  const { t } = useTranslation("pos");
  const { instance } = useInstance();

  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div>
        <h1 className="text-2xl font-black text-gray-900">{t("title")}</h1>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          {instance.companyName}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSelector />
      </div>
    </div>
  );
}

"use client";

/**
 * i18n Provider
 * Manages internationalization for the application
 */

import React, { useEffect } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { getEnabledLanguages } from "@/config/i18n.config";

interface I18nProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    // Set initial language
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }

    // Load saved language preference
    const savedLang = localStorage.getItem("preferred-language");
    if (savedLang && i18n.language !== savedLang) {
      const enabledLanguages = getEnabledLanguages();
      const isEnabled = enabledLanguages.some(
        (lang) => lang.code === savedLang,
      );

      if (isEnabled) {
        i18n.changeLanguage(savedLang);
      }
    }
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/**
 * Language Switcher Hook
 * Provides language switching functionality
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    localStorage.setItem("preferred-language", languageCode);

    // Update HTML lang attribute
    document.documentElement.lang = languageCode;

    // Update direction for RTL languages
    const enabledLanguages = getEnabledLanguages();
    const language = enabledLanguages.find(
      (lang) => lang.code === languageCode,
    );
    if (language) {
      document.documentElement.dir = language.dir;
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    availableLanguages: getEnabledLanguages(),
  };
}

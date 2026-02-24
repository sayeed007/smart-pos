/**
 * i18n Configuration
 * This file sets up internationalization for the POS system
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  enabled: boolean;
}

/**
 * Supported languages configuration
 */
export const supportedLanguages: LanguageConfig[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    enabled: true,
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    dir: "ltr",
    enabled: true,
  },
  // {
  //   code: "ar",
  //   name: "Arabic",
  //   nativeName: "العربية",
  //   dir: "rtl",
  //   enabled: true,
  // },
  // {
  //   code: "es",
  //   name: "Spanish",
  //   nativeName: "Español",
  //   dir: "ltr",
  //   enabled: false,
  // },
  // {
  //   code: "fr",
  //   name: "French",
  //   nativeName: "Français",
  //   dir: "ltr",
  //   enabled: false,
  // },
];

/**
 * Get enabled languages only
 */
export const getEnabledLanguages = () =>
  supportedLanguages.filter((lang) => lang.enabled);

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = "en";

/**
 * Fallback language (if translation is missing)
 */
export const FALLBACK_LANGUAGE = "en";

/**
 * i18n namespaces for code splitting translations
 */
export const I18N_NAMESPACES = {
  common: "common",
  pos: "pos",
  inventory: "inventory",
  sales: "sales",
  customers: "customers",
  reports: "reports",
  settings: "settings",
  auth: "auth",
  products: "products",
  categories: "categories",
  offers: "offers",
  returns: "returns",
  users: "users",
} as const;

export type I18nNamespace =
  (typeof I18N_NAMESPACES)[keyof typeof I18N_NAMESPACES];

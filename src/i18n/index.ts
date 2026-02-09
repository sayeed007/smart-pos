/**
 * i18n Initialization
 * Sets up i18next for the application
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import {
    DEFAULT_LANGUAGE,
    FALLBACK_LANGUAGE,
    I18N_NAMESPACES
} from '@/config/i18n.config';

// Import translation files
import enCommon from './locales/en/common.json';
import enPos from './locales/en/pos.json';
import bnCommon from './locales/bn/common.json';
import bnPos from './locales/bn/pos.json';
import enProducts from './locales/en/products.json';
import bnProducts from './locales/bn/products.json';
import enCustomers from './locales/en/customers.json';
import bnCustomers from './locales/bn/customers.json';
import enDashboard from './locales/en/dashboard.json';
import bnDashboard from './locales/bn/dashboard.json';
import enSales from './locales/en/sales.json';
import bnSales from './locales/bn/sales.json';

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                [I18N_NAMESPACES.common]: enCommon,
                [I18N_NAMESPACES.pos]: enPos,
                [I18N_NAMESPACES.products]: enProducts,
                [I18N_NAMESPACES.customers]: enCustomers,
                [I18N_NAMESPACES.sales]: enSales,
                dashboard: enDashboard,
            },
            bn: {
                [I18N_NAMESPACES.common]: bnCommon,
                [I18N_NAMESPACES.pos]: bnPos,
                [I18N_NAMESPACES.products]: bnProducts,
                [I18N_NAMESPACES.customers]: bnCustomers,
                [I18N_NAMESPACES.sales]: bnSales,
                dashboard: bnDashboard,
            },
        },
        lng: DEFAULT_LANGUAGE,
        fallbackLng: FALLBACK_LANGUAGE,
        defaultNS: I18N_NAMESPACES.common,
        ns: [I18N_NAMESPACES.common, I18N_NAMESPACES.pos, I18N_NAMESPACES.products, I18N_NAMESPACES.customers, I18N_NAMESPACES.sales, 'dashboard'],

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        react: {
            useSuspense: false, // Set to true if you want to use Suspense
        },

        // Debug mode - disable in production
        debug: process.env.NODE_ENV === 'development',
    });

export default i18n;

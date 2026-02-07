/**
 * Instance Configuration
 * This file defines the structure for instance-specific settings
 * that will be fetched from the server for each company/tenant
 */

export interface InstanceConfig {
    /** Company/Business name */
    companyName: string;
    /** Company logo URL */
    logoUrl: string;
    /** Favicon URL */
    faviconUrl?: string;
    /** Primary brand color (will override theme if provided) */
    brandColor?: string;
    /** Company tagline/subtitle */
    tagline?: string;
    /** Instance/Tenant ID */
    instanceId: string;
    /** Company contact info */
    contact?: {
        email?: string;
        phone?: string;
        address?: string;
    };
    /** Feature flags for this instance */
    features?: {
        enableInventory?: boolean;
        enableMultiCurrency?: boolean;
        enableOffers?: boolean;
        enableCustomerLoyalty?: boolean;
    };
}

/**
 * Default instance configuration
 * Used as fallback when server data is not available
 */
export const defaultInstanceConfig: InstanceConfig = {
    companyName: "POS System",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    tagline: "Point of Sale",
    instanceId: "default",
    features: {
        enableInventory: true,
        enableMultiCurrency: false,
        enableOffers: true,
        enableCustomerLoyalty: true,
    },
};

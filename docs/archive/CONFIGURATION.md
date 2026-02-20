# Configuration System Documentation

## Overview

This POS system now supports a **multi-tenant SaaS architecture** with configurable:
1. **Instance Configuration** - Company branding (logo, name) from server
2. **Theme System** - Colors, fonts, and spacing
3. **i18n** - Multi-language support

## Directory Structure

```
src/
├── config/
│   ├── instance.config.ts    # Instance/tenant configuration
│   ├── theme.config.ts        # Theme configuration & presets
│   └── i18n.config.ts         # Language settings
│
├── providers/
│   ├── instance-provider.tsx  # Instance data management
│   ├── custom-theme-provider.tsx  # Theme management
│   └── i18n-provider.tsx      # Language management
│
├── i18n/
│   ├── index.ts               # i18n initialization
│   └── locales/
│       ├── en/                # English translations
│       │   ├── common.json
│       │   └── pos.json
│       └── bn/                # Bengali translations
│           ├── common.json
│           └── pos.json
│
└── components/
    ├── theme/
    │   └── ThemeSelector.tsx  # Theme switcher component
    └── language/
        └── LanguageSwitcher.tsx  # Language switcher component
```

## 1. Instance Configuration

### Server Endpoint
The system expects an API endpoint at `/instance/config` that returns:

```json
{
  "companyName": "Your Company Name",
  "logoUrl": "/path/to/logo.png",
  "faviconUrl": "/path/to/favicon.ico",
  "brandColor": "#f87171",
  "tagline": "Your tagline",
  "instanceId": "your-instance-id",
  "contact": {
    "email": "contact@company.com",
    "phone": "+1234567890",
    "address": "123 Main St"
  },
  "features": {
    "enableInventory": true,
    "enableMultiCurrency": false,
    "enableOffers": true,
    "enableCustomerLoyalty": true
  }
}
```

### Usage in Components

```tsx
import { useInstance } from "@/providers/instance-provider";

function YourComponent() {
  const { instance, isLoading, error } = useInstance();
  
  return (
    <div>
      <h1>{instance.companyName}</h1>
      <img src={instance.logoUrl} alt={instance.companyName} />
    </div>
  );
}
```

## 2. Theme System

### Available Theme Presets

- `default` - Red theme
- `blue` - Blue theme
- `green` - Green theme
- `purple` - Purple theme

### Adding New Themes

Edit `src/config/theme.config.ts`:

```typescript
export const themePresets: Record<string, ThemeConfig> = {
  // ... existing themes
  
  orange: {
    ...defaultTheme,
    name: "orange",
    light: {
      ...defaultLightColors,
      primary: "#fb923c",
      primaryHover: "#f97316",
      ring: "#fb923c",
    },
    dark: {
      ...defaultDarkColors,
      primary: "#fb923c",
      primaryHover: "#f97316",
      ring: "#fb923c",
    },
  },
};
```

### Custom Typography

```typescript
export const customTypography: ThemeTypography = {
  fontFamily: {
    sans: '"Inter", system-ui, sans-serif',
    serif: '"Merriweather", serif',
    mono: '"Fira Code", monospace',
  },
  fontSize: {
    // customize sizes
  },
  // ... other settings
};
```

### Using Theme in Components

```tsx
import { useCustomTheme } from "@/providers/custom-theme-provider";
import { useTheme } from "next-themes";

function YourComponent() {
  const { themeConfig, setThemeName, availableThemes } = useCustomTheme();
  const { theme, setTheme } = useTheme(); // for light/dark mode
  
  return (
    <div>
      <button onClick={() => setThemeName("blue")}>Blue Theme</button>
      <button onClick={() => setTheme("dark")}>Dark Mode</button>
    </div>
  );
}
```

## 3. Internationalization (i18n)

### Supported Languages

Currently enabled:
- English (en)
- Bengali (bn)
- Arabic (ar) - with RTL support

To enable more languages, edit `src/config/i18n.config.ts`:

```typescript
{
  code: 'es',
  name: 'Spanish',
  nativeName: 'Español',
  dir: 'ltr',
  enabled: true, // Set to true to enable
}
```

### Adding Translations

1. Create new translation files in `src/i18n/locales/[lang]/[namespace].json`
2. Import in `src/i18n/index.ts`

Example `src/i18n/locales/es/pos.json`:
```json
{
  "title": "Punto de Venta",
  "cart": {
    "title": "Carrito",
    "empty": "El carrito está vacío"
  }
}
```

### Using Translations in Components

```tsx
import { useTranslation } from "react-i18next";

function YourComponent() {
  const { t } = useTranslation("pos"); // namespace
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("cart.empty")}</p>
    </div>
  );
}
```

### Changing Language

```tsx
import { useLanguage } from "@/providers/i18n-provider";

function YourComponent() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  
  return (
    <select onChange={(e) => changeLanguage(e.target.value)} value={currentLanguage}>
      {availableLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

## 4. Theme & Language Selectors

### Pre-built Components

```tsx
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";

function Header() {
  return (
    <header>
      <LanguageSwitcher />
      <ThemeSelector />
    </header>
  );
}
```

## Implementation Status

### ✅ Completed
- [x] Instance configuration structure
- [x] Theme configuration with presets
- [x] i18n configuration
- [x] Instance provider with server integration
- [x] Theme provider with CSS variable injection
- [x] i18n provider with language switching
- [x] Theme selector component
- [x] Language switcher component
- [x] POS header with selectors
- [x] Sidebar integration with instance config
- [x] English translations (common, pos)
- [x] Bengali translations (common, pos)

### 🔄 Next Steps (To Expand)

1. **Add more translations**:
   - Create translation files for other namespaces (inventory, sales, customers, etc.)
   - Add more language options

2. **Theme Expansion**:
   - Add more color presets
   - Add font family options
   - Create theme builder UI

3. **Instance Features**:
   - Implement feature flags in components
   - Add more customization options
   - Create admin panel for instance settings

4. **Apply to Other Routes**:
   - Integrate i18n in admin panel
   - Integrate i18n in inventory module
   - Integrate i18n in sales module
   - etc.

## Backend Requirements

### Required API Endpoints

1. **GET /instance/config**
   - Returns instance configuration
   - Should be tenant-specific based on subdomain/domain or auth

2. **Optional: POST /instance/config** (Admin only)
   - Update instance configuration
   - Requires admin authentication

### Example Backend Response

```json
{
  "success": true,
  "data": {
    "companyName": "ABC Store",
    "logoUrl": "https://cdn.example.com/logos/abc-store.png",
    "instanceId": "abc-store",
    "features": {
      "enableInventory": true,
      "enableOffers": true
    }
  }
}
```

## Testing

### Test Instance Config
The system uses default config if server is unavailable:
- Company Name: "POS System"
- Logo: "/logo.png"

### Test Themes
Try switching between themes using the ThemeSelector in the POS header.

### Test Languages
Try switching between English and Bengali using the LanguageSwitcher in the POS header.

## Migration Guide

### For Existing Components

1. **Use translations instead of hardcoded text**:
   ```tsx
   // Before
   <h1>Point of Sale</h1>
   
   // After
   const { t } = useTranslation("pos");
   <h1>{t("title")}</h1>
   ```

2. **Use theme variables**:
   ```tsx
   // Before
   <div className="bg-[#f87171]">
   
   // After
   <div style={{ backgroundColor: 'var(--primary)' }}>
   // Or use Tailwind's built-in theme colors which now use CSS vars
   ```

3. **Use instance config**:
   ```tsx
   // Before
   <img src="/logo.png" alt="Logo" />
   
   // After
   const { instance } = useInstance();
   <img src={instance.logoUrl} alt={instance.companyName} />
   ```

## Troubleshooting

### Theme not applying
- Check browser console for CSS variable errors
- Ensure CustomThemeProvider is in the root layout
- Clear localStorage and refresh

### Translations not showing
- Check i18n initialization in network tab
- Verify translation files are in the correct namespace
- Check browser console for i18n errors

### Instance config not loading
- Check API endpoint `/instance/config`
- Verify API is returning correct JSON structure
- Check network tab for failed requests

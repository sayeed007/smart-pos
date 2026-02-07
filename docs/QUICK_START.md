# Quick Start Guide - Configuration System

## 🎉 What's Been Created

Your POS system now has a complete **multi-tenant SaaS configuration system** with:

1. **Instance Configuration** - Dynamic company branding from server
2. **Theme System** - Customizable colors, fonts, and spacing  
3. **i18n Support** - Multi-language with English and Bengali ready

## 🚀 See It In Action

Your dev server should be running. Navigate to:
- **Main POS**: http://localhost:3000/cashier/pos
- **Configuration Demo**: Create a route for `/demo` to show `ConfigurationDemo` component

### Try These Features:

1. **Language Switcher** (Top right in POS)
   - Click the globe icon
   - Switch between English and Bengali
   - Notice all text updates immediately

2. **Theme Selector** (Top right in POS)
   - Click the palette icon
   - Try different modes: Light/Dark/System
   - Try different color themes: Default, Blue, Green, Purple

3. **Instance Branding** (Sidebar)
   - The logo and company name come from instance config
   - Currently shows defaults (since backend isn't ready)

## 📁 What Was Created

### Configuration Files:
- `src/config/instance.config.ts` - Instance/tenant settings
- `src/config/theme.config.ts` - Theme configurations
- `src/config/i18n.config.ts` - Language settings

### Providers:
- `src/providers/instance-provider.tsx` - Instance data from server
- `src/providers/custom-theme-provider.tsx` - Theme management
- `src/providers/i18n-provider.tsx` - Language management

### Components:
- `src/components/theme/ThemeSelector.tsx` - Theme switcher UI
- `src/components/language/LanguageSwitcher.tsx` - Language switcher UI
- `src/features/pos/components/POSHeader.tsx` - POS header with selectors
- `src/components/demo/ConfigurationDemo.tsx` - Demo showing all features

### Translations:
- `src/i18n/locales/en/common.json` - English common translations
- `src/i18n/locales/en/pos.json` - English POS translations
- `src/i18n/locales/bn/common.json` - Bengali common translations
- `src/i18n/locales/bn/pos.json` - Bengali POS translations

### Documentation:
- `CONFIGURATION.md` - Full API documentation and usage
- `IMPLEMENTATION_SUMMARY.md` - Overview and next steps  
- `QUICK_START.md` - This guide

## 🔧 Next: Backend Integration

### Create the Instance Config Endpoint

Add this endpoint to your backend:

**Endpoint:** `GET /instance/config`

**Response:**
```json
{
  "companyName": "Your Store Name",
  "logoUrl": "https://your-cdn.com/logo.png",
  "faviconUrl": "https://your-cdn.com/favicon.ico",
  "instanceId": "your-store-001",
  "tagline": "Your Tagline",
  "features": {
    "enableInventory": true,
    "enableOffers": true,
    "enableCustomerLoyalty": true,
    "enableMultiCurrency": false
  }
}
```

Once you add this endpoint:
- The sidebar will show your custom logo and company name
- Feature flags will control what's enabled
- Document title and favicon will update automatically

## 📝 How to Use in Your Code

### 1. Use Instance Config:
```tsx
import { useInstance } from "@/providers/instance-provider";

function MyComponent() {
  const { instance } = useInstance();
  
  return (
    <div>
      <h1>{instance.companyName}</h1>
      <img src={instance.logoUrl} alt={instance.companyName} />
    </div>
  );
}
```

### 2. Use Translations:
```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation("pos"); // or "common"
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("cart.checkout")}</button>
    </div>
  );
}
```

### 3. Use Theme:
```tsx
import { useCustomTheme } from "@/providers/custom-theme-provider";

function MyComponent() {
  const { themeConfig, setThemeName } = useCustomTheme();
  
  return (
    <button onClick={() => setThemeName("blue")}>
      Blue Theme
    </button>
  );
}
```

## 🎨 Adding More Translations

1. Create translation file:
   - Path: `src/i18n/locales/[lang]/[namespace].json`
   - Example: `src/i18n/locales/es/pos.json` for Spanish POS translations

2. Import in `src/i18n/index.ts`:
   ```typescript
   import esPos from './locales/es/pos.json';
   
   // Add to resources
   es: {
     pos: esPos,
   }
   ```

3. Enable language in `src/config/i18n.config.ts`:
   ```typescript
   {
     code: 'es',
     name: 'Spanish',
     nativeName: 'Español',
     dir: 'ltr',
     enabled: true, // Set to true
   }
   ```

## 🎨 Adding More Themes

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

## 📚 Need More Info?

- **Full API Docs**: See `CONFIGURATION.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Demo Component**: See `src/components/demo/ConfigurationDemo.tsx`

## ✅ Current Status

### Completed:
- ✅ Config infrastructure created
- ✅ All providers implemented
- ✅ Theme and language selectors created
- ✅ POS page fully integrated
- ✅ Sidebar updated with instance config
- ✅ CartPanel translated to i18n
- ✅ English & Bengali translations ready
- ✅ 4 theme presets available
- ✅ Light/Dark mode support
- ✅ RTL support configured

### To Do:
- ⏳ Backend: Implement `/instance/config` endpoint
- ⏳ Add more translations to other components
- ⏳ Add more languages (Spanish, French, etc.)
- ⏳ Expand to other modules (inventory, sales, etc.)
- ⏳ Create admin UI for theme/instance customization

## 🐛 Troubleshooting

**Q: Theme not changing?**
- Clear browser localStorage
- Hard refresh (Ctrl+Shift+R)
- Check browser console for errors

**Q: Translations not showing?**
- Check that i18n initialized (browser console)
- Verify translation key exists in JSON file
- Check namespace is correct

**Q: Instance config shows defaults?**
- Backend endpoint not implemented yet
- Check network tab for API errors
- Verify API returns correct JSON structure

## 🎯 What to Do Now

1. **Test the POS page** - Try switching themes and languages
2. **Check the demo** - Create a demo page to see all features
3. **Implement backend** - Add the `/instance/config` endpoint
4. **Expand translations** - Translate more components
5. **Customize themes** - Add your brand colors

## 💬 Questions?

Refer to the comprehensive documentation in:
- `CONFIGURATION.md`
- `IMPLEMENTATION_SUMMARY.md`

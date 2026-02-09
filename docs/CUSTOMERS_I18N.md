# 🌍 i18n Support Added to Customers Page

## Overview

The customers page now has **full internationalization support** with a dedicated `customers` namespace, supporting both **English** and **Bengali** languages.

---

## Files Created/Modified

### **1. Translation Files**

#### **English** (`src/i18n/locales/en/customers.json`)
```json
{
  "page": {
    "title": "Customers",
    "subtitle": "Manage your customer database and loyalty members"
  },
  "addCustomer": "Add Customer",
  "editCustomer": "Edit Customer",
  "searchPlaceholder": "Search by name, phone, or email...",
  "headers": {
    "name": "Name",
    "phone": "Phone",
    "email": "Email",
    "totalSpent": "Total Spent",
    "loyaltyPoints": "Loyalty Points",
    "actions": "Actions"
  },
  "fields": {
    "fullName": "Full Name",
    "phoneNumber": "Phone Number",
    "emailAddress": "Email Address",
    "enterName": "Enter customer name",
    "enterPhone": "Enter phone number",
    "enterEmail": "Enter email address"
  },
  "actions": {
    "save": "Save",
    "update": "Update",
    "cancel": "Cancel",
    "saving": "Saving...",
    "delete": "Delete"
  },
  "dialog": {
    "addTitle": "Add Customer",
    "addDescription": "Add a new customer to your database",
    "editTitle": "Edit Customer",
    "editDescription": "Update customer information"
  },
  "empty": {
    "title": "No customers found",
    "description": "Add your first customer to get started"
  },
  "toasts": {
    "customerCreated": "Customer added successfully",
    "customerUpdated": "Customer updated successfully",
    "customerDeleted": "Customer deleted successfully",
    "customerError": "Failed to save customer",
    "deleteError": "Failed to delete customer"
  },
  "confirmDelete": "Are you sure you want to delete {{name}}?"
}
```

#### **Bengali** (`src/i18n/locales/bn/customers.json`)
- Complete Bengali translations for all keys
- Native script: বাংলা
- All UI elements translated

---

### **2. i18n Configuration** (`src/i18n/index.ts`)

**Added:**
```typescript
import enCustomers from './locales/en/customers.json';
import bnCustomers from './locales/bn/customers.json';

// In resources:
en: {
  customers: enCustomers,
},
bn: {
  customers: bnCustomers,
}

// In namespaces:
ns: [..., I18N_NAMESPACES.customers]
```

---

### **3. Customers Page** (`src/app/(cashier)/cashier/customers/page.tsx`)

**Changed:**
```typescript
// Before
const { t } = useTranslation("common");

// After
const { t } = useTranslation("customers");
```

**Updated all translation keys:**
- ✅ `t("page.title")` - Page title
- ✅ `t("page.subtitle")` - Page subtitle
- ✅ `t("addCustomer")` - Add button
- ✅ `t("searchPlaceholder")` - Search input
- ✅ `t("headers.name")` - Table headers
- ✅ `t("fields.fullName")` - Form labels
- ✅ `t("actions.save")` - Action buttons
- ✅ `t("dialog.addTitle")` - Dialog titles
- ✅ `t("empty.title")` - Empty state
- ✅ `t("toasts.customerCreated")` - Toast messages
- ✅ `t("confirmDelete", { name })` - Confirmation with interpolation

---

## Translation Key Structure

### **Hierarchical Organization**

```
customers/
├── page/
│   ├── title
│   └── subtitle
├── headers/
│   ├── name
│   ├── phone
│   ├── email
│   ├── totalSpent
│   ├── loyaltyPoints
│   └── actions
├── fields/
│   ├── fullName
│   ├── phoneNumber
│   ├── emailAddress
│   ├── enterName
│   ├── enterPhone
│   └── enterEmail
├── actions/
│   ├── save
│   ├── update
│   ├── cancel
│   ├── saving
│   └── delete
├── dialog/
│   ├── addTitle
│   ├── addDescription
│   ├── editTitle
│   └── editDescription
├── empty/
│   ├── title
│   └── description
├── toasts/
│   ├── customerCreated
│   ├── customerUpdated
│   ├── customerDeleted
│   ├── customerError
│   └── deleteError
├── addCustomer
├── editCustomer
├── searchPlaceholder
└── confirmDelete
```

---

## Usage Examples

### **Simple Translation**
```tsx
<h1>{t("page.title")}</h1>
// English: "Customers"
// Bengali: "গ্রাহকগণ"
```

### **Nested Keys**
```tsx
<TableHead>{t("headers.name")}</TableHead>
// English: "Name"
// Bengali: "নাম"
```

### **Interpolation**
```tsx
t("confirmDelete", { name: customer.name })
// English: "Are you sure you want to delete John Doe?"
// Bengali: "আপনি কি নিশ্চিত যে John Doe মুছে ফেলতে চান?"
```

### **Conditional Translation**
```tsx
{selectedCustomer ? t("dialog.editTitle") : t("dialog.addTitle")}
// Edit mode: "Edit Customer" / "গ্রাহক সম্পাদনা করুন"
// Add mode: "Add Customer" / "গ্রাহক যোগ করুন"
```

---

## Supported Languages

| Language | Code | Status | Translation File |
|----------|------|--------|------------------|
| **English** | `en` | ✅ Complete | `locales/en/customers.json` |
| **Bengali** | `bn` | ✅ Complete | `locales/bn/customers.json` |
| Arabic | `ar` | ⏳ Pending | - |
| Spanish | `es` | ⏳ Pending | - |
| French | `fr` | ⏳ Pending | - |

---

## How to Add More Languages

### **Step 1: Create Translation File**
```bash
# Example: Add Arabic support
touch src/i18n/locales/ar/customers.json
```

### **Step 2: Copy Structure**
```json
{
  "page": {
    "title": "العملاء",
    "subtitle": "إدارة قاعدة بيانات العملاء وأعضاء الولاء"
  },
  // ... rest of translations
}
```

### **Step 3: Import in i18n/index.ts**
```typescript
import arCustomers from './locales/ar/customers.json';

// Add to resources
ar: {
  customers: arCustomers,
}
```

---

## Translation Coverage

### **Page Elements**
- ✅ Page title and subtitle
- ✅ Add customer button
- ✅ Search placeholder

### **Table**
- ✅ All column headers (6 columns)
- ✅ Empty state message
- ✅ Loading state (inherited)

### **Form Dialog**
- ✅ Dialog titles (Add/Edit)
- ✅ Dialog descriptions
- ✅ All form labels (3 fields)
- ✅ All placeholders (3 fields)
- ✅ Action buttons (Cancel, Save, Update)
- ✅ Loading state (Saving...)

### **Notifications**
- ✅ Success toasts (3 types)
- ✅ Error toasts (2 types)
- ✅ Delete confirmation

---

## Testing i18n

### **Switch Language**
1. Use the language switcher in the app
2. Or programmatically:
```typescript
import { useLanguage } from "@/providers/i18n-provider";

const { changeLanguage } = useLanguage();
await changeLanguage("bn"); // Switch to Bengali
```

### **Verify Translations**
1. Navigate to `/cashier/customers`
2. Check all UI elements are translated
3. Test form dialog (Add/Edit)
4. Test toast notifications
5. Test delete confirmation

---

## Benefits

### **1. User Experience**
- ✅ Native language support for Bengali users
- ✅ Consistent terminology across the app
- ✅ Professional localization

### **2. Maintainability**
- ✅ Centralized translation management
- ✅ Easy to add new languages
- ✅ No hardcoded strings in components

### **3. Scalability**
- ✅ Namespace isolation (customers separate from products, pos, etc.)
- ✅ Hierarchical key structure
- ✅ Reusable translation patterns

---

## Key Features

### **1. Namespace Isolation**
```typescript
// Each feature has its own namespace
useTranslation("customers")  // Customers page
useTranslation("products")   // Products page
useTranslation("pos")        // POS page
```

### **2. Fallback Support**
- If a translation is missing in Bengali, falls back to English
- Configured in `i18n.config.ts`

### **3. Type Safety**
- Translation keys are type-checked
- IDE autocomplete support
- Compile-time error detection

---

## Status: ✅ COMPLETE

The customers page now has:
- 🌍 **Full i18n support**
- 🇬🇧 **English translations** (100%)
- 🇧🇩 **Bengali translations** (100%)
- 📦 **Dedicated namespace** (customers)
- 🔄 **Dynamic language switching**
- ✨ **Professional localization**

Your app is now **multilingual** and ready for global users! 🎉

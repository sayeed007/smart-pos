# System Overview & Feature Reference

## 1. Administrator Role (`/admin`)

The Administrator has comprehensive control over the system, focusing on management, analytics, and configuration.

### Routes & Tasks

| Route | Feature | Key Tasks |
| :--- | :--- | :--- |
| **`/admin/dashboard`** | **Dashboard** | • View Revenue, Orders, and Average Order Value metrics<br>• Analyze Revenue Trend and Sales by Category charts<br>• Monitor Recent Activity feed |
| **`/admin/sales`** | **Sales History** | • List all past sales transactions<br>• Filter sales by status or date<br>• View detailed Invoice receipts |
| **`/admin/products`** | **Products** | • Create, Edit, and Delete products<br>• Manage product pricing and tax rates<br>• Manage product categories |
| **`/admin/inventory`** | **Inventory** | • Track stock levels<br>• Monitor low stock items<br>• Adjust inventory quantities |
| **`/admin/customers`** | **Customers** | • Manage customer profiles<br>• View customer purchase history<br>• Track loyalty points |
| **`/admin/reports`** | **Reports** | • **Visual Analytics:** Revenue Trends, Best Selling Categories<br>• **Tabular Reports:** Sales Transactions, Product Performance, Payment Methods |
| **`/admin/returns`** | **Returns** | • Process new Returns (Search Invoice → Select Items)<br>• Calculate Refund amounts<br>• detailed Return history |
| **`/admin/users`** | **User Management** | • Add new system users<br>• Assign roles (Admin, Manager, Cashier)<br>• Manage user status (Active/Inactive) |
| **`/admin/settings`** | **Settings** | • **Store:** Configure Name, Address, Contact Info<br>• **Invoice:** Set Prefix and Footer text<br>• **Financial:** Set Currency and Tax Rate<br>• **Hardware:** Configure Printer, Scanner, Cash Drawer |

---

## 2. Cashier Role (`/cashier`)

The Cashier role is streamlined for efficiency in daily sales operations and basic management.

### Routes & Tasks

| Route | Feature | Key Tasks |
| :--- | :--- | :--- |
| **`/cashier/pos`** | **Point of Sale** | • **Transaction Processing:** Add items to cart, apply discounts, checkout<br>• **Product Lookup:** Search by Name, SKU, or Barcode<br>• **Cart Management:** Adjust quantities, remove items<br>• **Receipts:** Print receipts after checkout |
| **`/cashier/customers`** | **Customers** | • Register new customers (Walk-ins)<br>• View customer list and details<br>• Check loyalty points balance |
| **`/cashier/products`** | **Products** | • View Product List<br>• Check prices and stock availability<br>• *Add/Edit Products (Shared capability)* |

---

## Feature Matrix

| Feature Module | Admin Access | Cashier Access | Description |
| :--- | :---: | :---: | :--- |
| **Dashboard** | ✅ | ❌ | Business overview and analytics |
| **POS Interface** | ❌* | ✅ | Front-line sales processing |
| **Sales History** | ✅ | ❌ | Historical transaction records |
| **Products** | ✅ | ✅ | Item management and lookup |
| **Inventory** | ✅ | ❌ | Dedicated stock tracking |
| **Customers** | ✅ | ✅ | CRM and Loyalty |
| **Reports** | ✅ | ❌ | Detailed financial reporting |
| **Returns** | ✅ | ❌ | Refund processing |
| **Users** | ✅ | ❌ | Staff management |
| **Settings** | ✅ | ❌ | System configuration |

*\*Note: Admins typically do not access the POS interface directly in this flow, though they have permissions to do so if routed.*

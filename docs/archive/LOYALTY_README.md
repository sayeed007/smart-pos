# Loyalty System Implementation

## Overview
The Loyalty System allows cashiers to:
1. Attach a customer to a sale.
2. View customer's Name, Tier (Bronze/Silver/Gold), and available Points.
3. Redeem points for a discount (100 Points = $1.00).
4. Earn points on sales (1 Point per $1.00, scaled by Tier).
5. Automatically upgrade Tiers based on Total Spent.

## How to Test

### 1. Customer Selection
- Open POS.
- In the Cart Panel (right side), click **"Add Customer to Sale"**.
- **Search**: Type "John" or "555" to find the seeded customer ("John Doe").
- **Select**: Click the customer to add them.
- **Verify**: You should see "John Doe", "Silver Member", and their points (e.g., 150 pts).

### 2. Create New Customer
- In the Member Search Modal, click **"Add New Customer"**.
- Enter Name (e.g., "Jane Smith") and Phone (e.g., "555-9999").
- Click "Create Customer".
- Verify Jane is selected and has 0 pts (Bronze).

### 3. Earning Points (Sale)
- Add items to the cart (e.g., $50 worth).
- Complete the sale (Cash/Card).
- **Verify**:
    - The `loyaltyLogs` table in Dexie will have an 'earning' entry.
    - The Customer's `loyaltyPoints` will increase by 50 (or more based on tier).
    - The Customer's `totalSpent` will increase by $50.

### 4. Redeeming Points
- Select "John Doe" (has 150 pts).
- Add items to cart ($10.00).
- In Cart Panel, you will see a **"Use Points"** section.
- Drag the slider to use points (e.g., 100 pts = -$1.00).
- Verify the Total amount decreases.
- Complete sale.
- **Verify**:
    - John's points decrease by 100.
    - He earns points on the *final* total ($9.00).

## Technical Details
- **Database**: Uses `Dexie.js` tables: `customers`, `loyaltyTiers`, `loyaltyLogs`.
- **Offline**: All logic (earning/burning) happens locally first.
- **Sync**: Sales are queued for sync. Customer profile sync is pending future implementation.

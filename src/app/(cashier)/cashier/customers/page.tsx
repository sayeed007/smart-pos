"use client";

import CustomersPage from "@/app/(admin)/admin/customers/page";

// Cashier shares the same view for now.
// Ideally we would wrap this or pass props to disable 'Delete' or sensitive controls if we had them.
// But for "Lookup/Add", the Admin page already does exactly that.

export default function CashierCustomersPage() {
  return <CustomersPage />;
}

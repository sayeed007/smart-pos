import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { Customer } from "@/types";
import { CustomersService } from "@/lib/services/backend/customers.service";

export function useOfflineCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["customers", "offline-sync"],
    queryFn: async () => {
      let customers: Customer[] = [];

      // 1. Try Online First
      try {
        if (navigator.onLine) {
          const limit = 50;
          const firstPage = await CustomersService.list({ page: 1, limit });

          const totalPages = firstPage?.meta?.totalPages ?? 1;

          const remainingPages =
            totalPages > 1
              ? await Promise.all(
                  Array.from({ length: totalPages - 1 }, (_, idx) =>
                    CustomersService.list({ page: idx + 2, limit }),
                  ),
                )
              : [];

          const allCustomers = [
            ...(firstPage.data || []),
            ...remainingPages.flatMap((page) => page.data || []),
          ];

          // Sync to local DB
          if (allCustomers.length > 0) {
            await db.customers.bulkPut(allCustomers);
          }
        }
      } catch (error) {
        console.warn("Online customer fetch failed, falling back to DB", error);
      }

      // 2. Fetch from Local DB (Source of Truth)
      try {
        // Always fetch from local DB to ensure we have the merged state (local + synced)
        customers = await db.customers.toArray();
        return customers;
      } catch (dbError) {
        console.error("Critical: DB Access Failed", dbError);
        throw dbError;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

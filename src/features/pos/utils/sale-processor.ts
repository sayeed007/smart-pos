import { api } from "@/lib/axios";
import { db, SaleQueueItem } from "@/lib/db";
import { CartItem } from "@/types";
import { toast } from "sonner";
// Using browser native crypto.randomUUID() for simplicity if environment supports, otherwise fallback.

interface SalePayload {
    items: CartItem[];
    total: number;
    paymentMethod: string;
    payments?: { method: string; amount: number }[];
    cashierId: string;
    subtotal: number;
    tax: number;
    customerId?: string;
    redeemedPoints?: number;
}

export async function processSale(payload: SalePayload): Promise<{ success: boolean; isOffline: boolean; localId?: string }> {
    // 1. Validate Stock (Optional - Local check)
    // For now, assume POS UI handled basic stock check.

    const saleId = crypto.randomUUID();
    const { customerId, redeemedPoints, total } = payload;

    // Handle Local Customer Updates (Always, for offline support)
    if (customerId) {
        try {
            const customer = await db.customers.get(customerId);
            if (customer) {
                const now = new Date().toISOString();
                let newPoints = customer.loyaltyPoints;

                // Deduct Redeemed
                if (redeemedPoints && redeemedPoints > 0) {
                    if (redeemedPoints > newPoints) {
                        throw new Error("Insufficient loyalty points balance.");
                    }
                    newPoints -= redeemedPoints;
                    await db.loyaltyLogs.add({
                        id: `log-${Date.now()}-r`,
                        customerId,
                        saleId,
                        type: 'redemption',
                        points: -redeemedPoints,
                        createdAt: now
                    });
                }

                // Add Earned (Fetch tier for rate?)
                // MVP: 1 point per $1. Gold gets 2x?
                // We'll fetch Tier from local DB if possible, strict logic later.
                const tier = customer.tierId ? await db.loyaltyTiers.get(customer.tierId) : null;
                const earnRate = tier?.earnRate || 1;

                const earnedPoints = Math.floor(total * earnRate);

                if (earnedPoints > 0) {
                    newPoints += earnedPoints;
                    await db.loyaltyLogs.add({
                        id: `log-${Date.now()}-e`,
                        customerId,
                        saleId,
                        type: 'earning',
                        points: earnedPoints,
                        createdAt: now
                    });
                }

                // Update Customer
                const newTotalSpent = (customer.totalSpent || 0) + total;

                // Simple Tier Upgrade Check (MVP)
                let newTierId = customer.tierId;
                const allTiers = await db.loyaltyTiers.orderBy('minSpend').toArray();
                // Find highest tier qualifying
                const qualifyingTier = allTiers.reverse().find(t => newTotalSpent >= t.minSpend);
                if (qualifyingTier) {
                    newTierId = qualifyingTier.id;
                }

                await db.customers.update(customerId, {
                    loyaltyPoints: newPoints,
                    totalSpent: newTotalSpent,
                    tierId: newTierId
                });
            }
        } catch (e) {
            console.error("Failed to update customer loyalty", e);
            // Don't fail sale for this, just log
        }
    }

    try {
        if (!navigator.onLine) {
            throw new Error("Offline");
        }

        // 2. Try Online Sync
        await api.post("/sales", { ...payload, id: saleId }); // API might generate its own ID or accept client ID
        return { success: true, isOffline: false, localId: saleId };

    } catch (error) {
        console.warn("Sale failed online. Queuing offline.", error);

        // 3. Save Offline
        try {
            const queueItem: SaleQueueItem = {
                id: saleId,
                items: payload.items.map(item => ({
                    id: item.id, // Variant or Product ID
                    quantity: item.quantity,
                    price: item.sellingPrice,
                    name: item.name,
                    taxRate: item.taxRate || 0,
                    sku: item.sku
                })),
                total: payload.total,
                paymentMethod: payload.paymentMethod,
                payments: payload.payments,
                cashierId: payload.cashierId,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await db.salesQueue.add(queueItem);
            toast.info("Sale saved offline. Will sync when back online.");
            return { success: true, isOffline: true, localId: saleId };
        } catch (dbError) {
            console.error("Critical: Failed to save offline sale!", dbError);
            toast.error("Critical Error: Could not save sale anywhere.");
            return { success: false, isOffline: true };
        }
    }
}

import { CartItem, Offer } from "@/types";

export function calculateCartDiscounts(cart: CartItem[], offers: Offer[]) {
    let totalDiscount = 0;
    const appliedOffers: Offer[] = [];
    const now = new Date();

    const validOffers = offers.filter(o => {
        const start = new Date(o.startDate);
        const end = new Date(o.endDate);
        return o.status === 'active' && now >= start && now <= end;
    });

    // 1. Calculate Subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);

    for (const offer of validOffers) {
        let eligibleAmount = 0;

        if (offer.applicableOn === 'all') {
            eligibleAmount = subtotal;
        } else if (offer.applicableOn === 'category') {
            eligibleAmount = cart
                .filter(item => item.categoryId === offer.categoryId)
                .reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        } else if (offer.applicableOn === 'product') {
            eligibleAmount = cart
                // Check against productId or originalProductId
                .filter(item => offer.productIds?.includes(item.id) || (item.originalProductId && offer.productIds?.includes(item.originalProductId)))
                .reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
        }

        // Check Min Purchase
        if (offer.minPurchase && eligibleAmount < offer.minPurchase) {
            continue;
        }

        if (eligibleAmount > 0) {
            let discount = 0;
            if (offer.type === 'percentage') {
                discount = eligibleAmount * (offer.value / 100);
                // Cap at maxDiscount if set
                if (offer.maxDiscount && discount > offer.maxDiscount) {
                    discount = offer.maxDiscount;
                }
            } else if (offer.type === 'fixed') {
                discount = offer.value;
            }
            // Ignore 'buy_x_get_y' for MVP

            if (discount > 0) {
                totalDiscount += discount;
                appliedOffers.push(offer);
            }
        }
    }

    // Cap total discount at subtotal
    if (totalDiscount > subtotal) {
        totalDiscount = subtotal;
    }

    return { totalDiscount, appliedOffers };
}

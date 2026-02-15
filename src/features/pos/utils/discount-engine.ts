import { CartItem, Offer } from "@/types";

export interface LineDiscount {
  itemId: string; // CartItem id (product or variant)
  originalProductId?: string;
  discountAmount: number;
  offerId: string;
  offerName: string;
}

export interface DiscountResult {
  totalDiscount: number;
  appliedOffers: Offer[];
  lineDiscounts: LineDiscount[];
}

export function calculateCartDiscounts(
  cart: CartItem[],
  offers: Offer[],
): DiscountResult {
  let totalDiscount = 0;
  const appliedOffers: Offer[] = [];
  const lineDiscounts: LineDiscount[] = [];
  const now = new Date();

  const validOffers = offers.filter((o) => {
    const start = new Date(o.startDate);
    const end = new Date(o.endDate);
    return o.status === "active" && now >= start && now <= end;
  });

  // 1. Calculate Subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );

  for (const offer of validOffers) {
    // Determine eligible items for this offer
    let eligibleItems: CartItem[] = [];

    if (offer.applicableOn === "all") {
      eligibleItems = cart;
    } else if (offer.applicableOn === "category") {
      eligibleItems = cart.filter(
        (item) => item.categoryId === offer.categoryId,
      );
    } else if (offer.applicableOn === "product") {
      eligibleItems = cart.filter(
        (item) =>
          offer.productIds?.includes(item.id) ||
          (item.originalProductId &&
            offer.productIds?.includes(item.originalProductId)),
      );
    }

    const eligibleAmount = eligibleItems.reduce(
      (sum, item) => sum + item.sellingPrice * item.quantity,
      0,
    );

    // Check Min Purchase
    if (offer.minPurchase && eligibleAmount < offer.minPurchase) {
      continue;
    }

    let offerTotalDiscount = 0;

    // ===== Percentage discount =====
    if (offer.type === "percentage" && eligibleAmount > 0) {
      offerTotalDiscount = eligibleAmount * (offer.value / 100);
      if (offer.maxDiscount && offerTotalDiscount > offer.maxDiscount) {
        offerTotalDiscount = offer.maxDiscount;
      }
    }

    // ===== Fixed discount =====
    else if (offer.type === "fixed" && eligibleAmount > 0) {
      offerTotalDiscount = Math.min(offer.value, eligibleAmount);
    }

    // ===== Category-wide discount (treated like percentage on category items) =====
    else if (offer.type === "category_discount" && eligibleAmount > 0) {
      offerTotalDiscount = eligibleAmount * (offer.value / 100);
      if (offer.maxDiscount && offerTotalDiscount > offer.maxDiscount) {
        offerTotalDiscount = offer.maxDiscount;
      }
    }

    // ===== Buy X Get Y =====
    else if (offer.type === "buy_x_get_y" && offer.rule) {
      const rule = "buyXGetY" in offer.rule ? offer.rule.buyXGetY : undefined;
      if (rule) {
        // Find buy items in the cart
        const buyItems = cart.filter(
          (item) =>
            rule.buyProductIds.includes(item.id) ||
            (item.originalProductId &&
              rule.buyProductIds.includes(item.originalProductId)),
        );
        const buyQtyInCart = buyItems.reduce((sum, i) => sum + i.quantity, 0);

        if (buyQtyInCart >= rule.buyQty) {
          // How many times the rule triggers
          const requiredQty = rule.sameProduct
            ? rule.buyQty + rule.getQty
            : rule.buyQty;
          if (requiredQty <= 0) continue;
          const timesApplied = Math.floor(buyQtyInCart / requiredQty);
          const freeQty = timesApplied * rule.getQty;
          if (freeQty <= 0) continue;

          // Determine "get" items
          const getProductIds = rule.sameProduct
            ? rule.buyProductIds
            : rule.getProductIds || [];
          const getItems = cart.filter(
            (item) =>
              getProductIds.includes(item.id) ||
              (item.originalProductId &&
                getProductIds.includes(item.originalProductId)),
          );

          // Apply discount to cheapest "get" items
          const sortedGetItems = [...getItems].sort(
            (a, b) => a.sellingPrice - b.sellingPrice,
          );
          let remainingFree = freeQty;

          for (const item of sortedGetItems) {
            if (remainingFree <= 0) break;
            const qtyToDiscount = Math.min(item.quantity, remainingFree);

            let itemDiscount = 0;
            if (rule.discountType === "free") {
              itemDiscount = item.sellingPrice * qtyToDiscount;
            } else if (rule.discountType === "percent") {
              itemDiscount =
                item.sellingPrice *
                qtyToDiscount *
                ((rule.discountValue || 0) / 100);
            } else if (rule.discountType === "fixed") {
              itemDiscount = (rule.discountValue || 0) * qtyToDiscount;
            }

            if (itemDiscount > 0) {
              offerTotalDiscount += itemDiscount;
              lineDiscounts.push({
                itemId: item.id,
                originalProductId: item.originalProductId,
                discountAmount: Math.round(itemDiscount * 100) / 100,
                offerId: offer.id,
                offerName: offer.name,
              });
            }
            remainingFree -= qtyToDiscount;
          }
        }
      }
    }

    // ===== Bundle discount =====
    else if (offer.type === "bundle" && offer.rule) {
      const rule = "bundle" in offer.rule ? offer.rule.bundle : undefined;
      if (rule) {
        const productIds = Array.from(new Set(rule.productIds || []));
        if (productIds.length === 0) continue;

        // Group cart items by bundle product id
        const itemsByProduct = new Map<string, CartItem[]>();
        productIds.forEach((id) => itemsByProduct.set(id, []));

        for (const item of cart) {
          const matchId = productIds.find(
            (pid) => pid === item.id || pid === item.originalProductId,
          );
          if (matchId) {
            itemsByProduct.get(matchId)?.push(item);
          }
        }

        // Determine how many full bundles can be applied
        const bundleCounts = productIds.map((pid) =>
          (itemsByProduct.get(pid) || []).reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
        );
        const bundleCount = Math.min(...bundleCounts);
        if (!Number.isFinite(bundleCount) || bundleCount <= 0) continue;

        // Allocate bundleCount units per product (highest priced units first)
        const allocation = new Map<
          string,
          { item: CartItem; qty: number }
        >();

        for (const pid of productIds) {
          let remaining = bundleCount;
          const items = [...(itemsByProduct.get(pid) || [])].sort(
            (a, b) => b.sellingPrice - a.sellingPrice,
          );

          for (const item of items) {
            if (remaining <= 0) break;
            const qtyToUse = Math.min(item.quantity, remaining);
            if (qtyToUse <= 0) continue;
            const existing = allocation.get(item.id);
            allocation.set(item.id, {
              item,
              qty: (existing?.qty || 0) + qtyToUse,
            });
            remaining -= qtyToUse;
          }
        }

        const bundleTotal = Array.from(allocation.values()).reduce(
          (sum, entry) => sum + entry.item.sellingPrice * entry.qty,
          0,
        );

        if (bundleTotal > 0) {
          if (rule.pricingType === "fixed_price" && rule.price != null) {
            // Bundle for a fixed price - discount is the difference
            offerTotalDiscount = Math.max(
              0,
              bundleTotal - rule.price * bundleCount,
            );
          } else if (rule.pricingType === "percent" && rule.percent != null) {
            // Percentage discount on the bundle total
            offerTotalDiscount = bundleTotal * (rule.percent / 100);
          }
        }

        // Distribute bundle discount proportionally to allocated items only
        if (offerTotalDiscount > 0 && bundleTotal > 0) {
          for (const entry of allocation.values()) {
            const itemTotal = entry.item.sellingPrice * entry.qty;
            const proportion = itemTotal / bundleTotal;
            const itemDiscount =
              Math.round(offerTotalDiscount * proportion * 100) / 100;
            if (itemDiscount > 0) {
              lineDiscounts.push({
                itemId: entry.item.id,
                originalProductId: entry.item.originalProductId,
                discountAmount: itemDiscount,
                offerId: offer.id,
                offerName: offer.name,
              });
            }
          }
        }
      }
    }

    // For percentage/fixed/category_discount: distribute discount proportionally
    if (
      (offer.type === "percentage" ||
        offer.type === "fixed" ||
        offer.type === "category_discount") &&
      offerTotalDiscount > 0 &&
      eligibleAmount > 0
    ) {
      for (const item of eligibleItems) {
        const itemTotal = item.sellingPrice * item.quantity;
        const proportion = itemTotal / eligibleAmount;
        const itemDiscount =
          Math.round(offerTotalDiscount * proportion * 100) / 100;

        if (itemDiscount > 0) {
          const existing = lineDiscounts.find(
            (ld) => ld.itemId === item.id && ld.offerId === offer.id,
          );
          if (existing) {
            existing.discountAmount += itemDiscount;
          } else {
            lineDiscounts.push({
              itemId: item.id,
              originalProductId: item.originalProductId,
              discountAmount: itemDiscount,
              offerId: offer.id,
              offerName: offer.name,
            });
          }
        }
      }
    }

    if (offerTotalDiscount > 0) {
      totalDiscount += offerTotalDiscount;
      appliedOffers.push(offer);
    }
  }

  // Cap total discount at subtotal
  if (totalDiscount > subtotal) {
    totalDiscount = subtotal;
  }

  return { totalDiscount, appliedOffers, lineDiscounts };
}

/**
 * Aggregate per-line discounts by item ID.
 * Returns a map of itemId -> { totalDiscount, primaryOfferId }
 */
export function getPerLineDiscounts(
  lineDiscounts: LineDiscount[],
): Map<string, { totalDiscount: number; primaryOfferId: string }> {
  const map = new Map<
    string,
    { totalDiscount: number; primaryOfferId: string }
  >();

  for (const ld of lineDiscounts) {
    const existing = map.get(ld.itemId);
    if (existing) {
      existing.totalDiscount += ld.discountAmount;
    } else {
      map.set(ld.itemId, {
        totalDiscount: ld.discountAmount,
        primaryOfferId: ld.offerId,
      });
    }
  }

  return map;
}

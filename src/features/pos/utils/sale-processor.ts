import {
  SalesService,
  CreateSaleDto,
  SaleLineDto,
  SalePaymentDto,
} from "@/lib/services/backend/sales.service";
import { CartItem, Offer } from "@/types";
import { calculateCartDiscounts, getPerLineDiscounts } from "./discount-engine";

// ── Payment method mapping: frontend label → backend enum ──
const PAYMENT_METHOD_MAP: Record<string, SalePaymentDto["method"]> = {
  card: "CARD",
  Card: "CARD",
  cash: "CASH",
  Cash: "CASH",
  wallet: "DIGITAL_WALLET",
  Wallet: "DIGITAL_WALLET",
  digital: "DIGITAL_WALLET",
  Digital: "DIGITAL_WALLET",
  voucher: "GIFT_CARD",
  Voucher: "GIFT_CARD",
  Split: "OTHER", // Split payments have individual methods
};

function mapPaymentMethod(method: string): SalePaymentDto["method"] {
  return PAYMENT_METHOD_MAP[method] || "OTHER";
}

// ── Sale Payload from POS UI ──
export interface ProcessSalePayload {
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  paymentMethod: string;
  payments?: { method: string; amount: number }[];
  locationId: string;
  customerId?: string;
  loyaltyPointsRedeemed?: number;
  loyaltyDiscount?: number;
  offers: Offer[];
}

export interface ProcessSaleResult {
  success: boolean;
  saleId?: string;
  invoiceNo?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saleData?: any; // Full sale response from backend
  error?: string;
}

/**
 * Process a sale through the real backend API.
 * Transforms POS cart data into the backend's expected CreateSaleDto format.
 */
export async function processSale(
  payload: ProcessSalePayload,
): Promise<ProcessSaleResult> {
  try {
    // 1. Calculate per-line discounts from offers
    const { lineDiscounts } = calculateCartDiscounts(
      payload.items,
      payload.offers,
    );
    const perLineDiscounts = getPerLineDiscounts(lineDiscounts);

    // 2. Build sale lines from cart items
    const lines: SaleLineDto[] = payload.items.map((item) => {
      const productId = item.originalProductId || item.id;
      const isVariant =
        !!item.originalProductId && item.id !== item.originalProductId;
      const variantId = isVariant ? item.id : undefined;

      // Get per-line discount info
      const lineDiscount = perLineDiscounts.get(item.id);

      return {
        productId,
        variantId,
        quantity: item.quantity,
        unitPrice: item.sellingPrice,
        discountAmount: lineDiscount?.totalDiscount || 0,
        offerId: lineDiscount?.primaryOfferId,
      };
    });

    // 3. Build payments
    let payments: SalePaymentDto[];

    if (
      payload.paymentMethod === "Split" &&
      payload.payments &&
      payload.payments.length > 0
    ) {
      // Split payment: each split entry becomes a payment
      payments = payload.payments.map((p) => ({
        method: mapPaymentMethod(p.method),
        amount: p.amount,
      }));
    } else {
      // Single payment method
      payments = [
        {
          method: mapPaymentMethod(payload.paymentMethod),
          amount: payload.total,
        },
      ];
    }

    // 4. Build the CreateSaleDto
    const dto: CreateSaleDto = {
      locationId: payload.locationId,
      lines,
      payments,
      customerId: payload.customerId || undefined,
      loyaltyPointsRedeemed: payload.loyaltyPointsRedeemed || 0,
      loyaltyDiscount: payload.loyaltyDiscount || 0,
    };

    // 5. Call the backend API
    const saleData = await SalesService.create(dto);

    return {
      success: true,
      saleId: saleData.id,
      invoiceNo: (saleData as unknown as Record<string, unknown>)
        .invoiceNo as string,
      saleData,
    };
  } catch (error: unknown) {
    console.error("Sale processing failed:", error);

    let errorMessage = "Sale processing failed";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Extract backend error message if available
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

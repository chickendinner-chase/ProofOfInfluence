/**
 * Checkout utility functions for calculating fees and applying discounts
 * Ensures compliance: POI is a utility token, only for fee discounts, not item prices
 */

export type QuoteInput = {
  itemTotalCents: number; // Pure item price total
  fees: {
    platform: number;
    auth: number;
    custody: number;
    shipping: number;
  };
  tier: {
    feeDiscountRate: number; // e.g., 0.10 = 10% discount
    shippingCapCents: number; // Max shipping credit
  };
  feeCreditsApplyCents: number; // User wants to apply this many fee credits
  feeCreditMaxRate: number; // e.g., 0.20 = max 20% of fees can be paid with credits
};

export type QuoteOutput = {
  itemTotalCents: number; // Unchanged item price
  feeOriginalCents: number; // Original total fees
  tierDiscountCents: number; // Discount from tier membership
  feeCreditsAppliedCents: number; // Fee credits actually applied
  shippingCreditAppliedCents: number; // Shipping credit applied
  payableCents: number; // Final amount to pay with Visa/Crypto
  breakdown: {
    itemPrice: number;
    platformFee: number;
    authFee: number;
    custodyFee: number;
    shipping: number;
    tierDiscount: number;
    feeCreditsUsed: number;
    shippingCredit: number;
  };
};

/**
 * Calculate checkout quote with tier discounts and fee credits
 * IMPORTANT: Fee credits and tier discounts ONLY apply to fees, NOT item prices
 */
export function computeQuote(input: QuoteInput): QuoteOutput {
  // Calculate original fee total (platform + auth + custody)
  const feeOriginal = input.fees.platform + input.fees.auth + input.fees.custody;

  // Apply tier discount (only to platform fee in this example)
  const tierDiscount = Math.floor(input.fees.platform * input.tier.feeDiscountRate);

  // Apply shipping credit (capped)
  const shippingCredit = Math.min(input.fees.shipping, input.tier.shippingCapCents);

  // Apply fee credits (capped at maxRate of total fees)
  const feeCreditCap = Math.floor(feeOriginal * input.feeCreditMaxRate);
  const feeCreditsApplied = Math.min(input.feeCreditsApplyCents, feeCreditCap);

  // Calculate payable fees (after discounts)
  const feesPayable = Math.max(0, feeOriginal - tierDiscount - feeCreditsApplied);
  
  // Calculate payable shipping (after credit)
  const shippingPayable = Math.max(0, input.fees.shipping - shippingCredit);

  // Final payable amount (item price is NEVER discounted)
  const payable = input.itemTotalCents + feesPayable + shippingPayable;

  return {
    itemTotalCents: input.itemTotalCents,
    feeOriginalCents: feeOriginal,
    tierDiscountCents: tierDiscount,
    feeCreditsAppliedCents: feeCreditsApplied,
    shippingCreditAppliedCents: shippingCredit,
    payableCents: payable,
    breakdown: {
      itemPrice: input.itemTotalCents,
      platformFee: input.fees.platform,
      authFee: input.fees.auth,
      custodyFee: input.fees.custody,
      shipping: input.fees.shipping,
      tierDiscount: tierDiscount,
      feeCreditsUsed: feeCreditsApplied,
      shippingCredit: shippingCredit,
    },
  };
}

/**
 * Format cents to USD string
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate percentage of a value
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Validate fee credit application
 * Returns error message if invalid, null if valid
 */
export function validateFeeCreditApplication(
  requestedCents: number,
  availableCents: number,
  totalFeeCents: number,
  maxRate: number
): string | null {
  if (requestedCents < 0) {
    return "Fee credit amount cannot be negative";
  }

  if (requestedCents > availableCents) {
    return `Insufficient fee credits. Available: ${formatCents(availableCents)}`;
  }

  const maxAllowed = Math.floor(totalFeeCents * maxRate);
  if (requestedCents > maxAllowed) {
    return `Fee credits cannot exceed ${(maxRate * 100).toFixed(0)}% of total fees (${formatCents(maxAllowed)})`;
  }

  return null;
}


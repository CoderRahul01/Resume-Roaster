/**
 * Central config — change one value here to update across the whole app.
 * Add new services (LinkedIn optimizer, cover letter, etc.) by extending SERVICES.
 */

export const AI_MODEL = "claude-sonnet-4-5";

export const RATE_LIMITS = {
  roast:       { limit: 5,  windowSecs: 3600 },
  createOrder: { limit: 10, windowSecs: 3600 },
  rewrite:     { limit: 20, windowSecs: 3600 },
} as const;

export const RESUME = {
  minChars:    100,
  maxChars:    50_000,
  aiMaxChars:  8_000,
} as const;

// All prices in paise (1 INR = 100 paise)
export const SERVICES = {
  roast: {
    label:     "Resume Roast",
    maxTokens: 1400,
  },
  rewrite: {
    label:       "AI Resume Rewrite",
    description: "ATS-optimized, achievement-focused",
    pricePaise:  9_900,    // ₹99
    priceLabel:  "₹99",
    maxTokens:   5000,
  },
  // Uncomment when ready to launch:
  // linkedinOptimizer: {
  //   label:       "LinkedIn Profile Optimizer",
  //   description: "Summary, headline, experience bullets",
  //   pricePaise:  29_900,   // ₹299
  //   priceLabel:  "₹299",
  //   maxTokens:   2048,
  // },
  // coverLetter: {
  //   label:       "Cover Letter Generator",
  //   description: "Tailored to the specific role",
  //   pricePaise:  19_900,   // ₹199
  //   priceLabel:  "₹199",
  //   maxTokens:   1024,
  // },
} as const;

export type ServiceKey = keyof typeof SERVICES;

export const APP_NAME = "Resume Roaster";
export const BRAND_COLOR = "#ff4444"; // neon red — matches the roast energy

/**
 * COUPON_CODES — env var format: "CODE1:100,CODE2:50"
 * Each entry is CODE:discountPercent. 100 = fully free.
 * Set COUPON_CODES in Railway env to manage coupons without redeploy.
 */
export function parseCouponCodes(): Map<string, number> {
  const raw = process.env.COUPON_CODES ?? "";
  const map = new Map<string, number>();
  for (const entry of raw.split(",")) {
    const [code, pct] = entry.trim().split(":");
    if (code && pct) {
      const discount = parseInt(pct, 10);
      if (!isNaN(discount) && discount > 0 && discount <= 100) {
        map.set(code.toUpperCase(), discount);
      }
    }
  }
  return map;
}

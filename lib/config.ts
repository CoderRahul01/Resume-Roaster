/**
 * Central config — change one value here to update across the whole app.
 * Add new services (LinkedIn optimizer, cover letter, etc.) by extending SERVICES.
 */

// ── AI Provider ───────────────────────────────────────────────────────────────
// Change THIS ONE LINE to switch between free NVIDIA NIM and Anthropic Claude:
export const AI_PROVIDER: "nvidia" | "claude" = "nvidia"; // ← "nvidia" | "claude"

// NVIDIA NIM free-tier models (https://build.nvidia.com/models)
export const NVIDIA_MODELS = {
  roast:           "meta/llama-3.3-70b-instruct",
  rewrite:         "meta/llama-3.3-70b-instruct",
  coverLetter:     "meta/llama-3.3-70b-instruct",
  linkedinOptimizer: "meta/llama-3.3-70b-instruct",
} as const;

// Anthropic Claude models (used when AI_PROVIDER = "claude")
export const CLAUDE_MODELS = {
  roast:           "claude-sonnet-4-5",
  rewrite:         "claude-sonnet-4-5",
  coverLetter:     "claude-sonnet-4-5",
  linkedinOptimizer: "claude-sonnet-4-5",
} as const;

// Active models — resolved automatically from AI_PROVIDER above
export const ACTIVE_MODELS = AI_PROVIDER === "nvidia" ? NVIDIA_MODELS : CLAUDE_MODELS;

// Legacy export kept for backward compat
export const AI_MODEL = ACTIVE_MODELS.roast;

// ── Rate limits ───────────────────────────────────────────────────────────────
export const RATE_LIMITS = {
  roast:         { limit: 5,  windowSecs: 3600 },
  createOrder:   { limit: 10, windowSecs: 3600 },
  rewrite:       { limit: 20, windowSecs: 3600 },
  coverLetter:   { limit: 10, windowSecs: 3600 },
  linkedin:      { limit: 10, windowSecs: 3600 },
} as const;

// ── Resume constraints ────────────────────────────────────────────────────────
export const RESUME = {
  minChars:    100,
  maxChars:    50_000,
  aiMaxChars:  8_000,
} as const;

// ── Services & Pricing (all prices in paise, 1 INR = 100 paise) ──────────────
export const SERVICES = {
  roast: {
    label:     "Resume Roast",
    maxTokens: 2000,
  },
  rewrite: {
    label:       "AI Resume Rewrite",
    description: "ATS-optimized, achievement-focused",
    pricePaise:  9_900,    // ₹99
    priceLabel:  "₹99",
    maxTokens:   5000,
  },
  coverLetter: {
    label:       "AI Cover Letter",
    description: "Tailored to the job description",
    pricePaise:  19_900,   // ₹199
    priceLabel:  "₹199",
    maxTokens:   2048,
  },
  linkedinOptimizer: {
    label:       "LinkedIn Profile Optimizer",
    description: "Summary, headline, experience bullets",
    pricePaise:  29_900,   // ₹299
    priceLabel:  "₹299",
    maxTokens:   2048,
  },
} as const;

export type ServiceKey = keyof typeof SERVICES;

export const APP_NAME = "Resume Roaster";
export const BRAND_COLOR = "#ff4444"; // neon red

// ── Free Mode (bypass payment for testing) ─────────────────────────────────
// Set true to skip Razorpay and allow rewrites without payment.
// Set false before going live.
export const FREE_MODE = false; // ← set true to bypass payments for testing

// ── Coupon codes ──────────────────────────────────────────────────────────────
/**
 * COUPON_CODES — env var format: "CODE1:100,CODE2:50"
 * Each entry is CODE:discountPercent. 100 = fully free.
 * Set COUPON_CODES in Railway/Supabase env to manage coupons without redeploy.
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

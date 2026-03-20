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
    pricePaise:  49_900,   // ₹499
    priceLabel:  "₹499",
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

export const APP_NAME = "Resume Roaster";
export const BRAND_COLOR = "#ff4444"; // neon red — matches the roast energy

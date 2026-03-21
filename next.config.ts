import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// ── Content Security Policy ───────────────────────────────────────────────────
// Prevents XSS by whitelisting every source the app legitimately loads from.
const CSP = [
  "default-src 'self'",
  // Scripts: self + Razorpay checkout JS (loaded at runtime in PaywallBanner)
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
  // Styles: self + inline (Tailwind generates inline styles)
  "style-src 'self' 'unsafe-inline'",
  // Fonts: Google Fonts (Geist is loaded via next/font — resolves to Google)
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self + Google user avatars (Google Sign-In profile pictures)
  "img-src 'self' data: https://lh3.googleusercontent.com",
  // API calls: self + NVIDIA NIM + Anthropic + Razorpay APIs
  `connect-src 'self' https://integrate.api.nvidia.com https://api.anthropic.com https://api.razorpay.com https://lumberjack.razorpay.com`,
  // Frames: Razorpay payment iframe
  "frame-src https://api.razorpay.com",
  // Everything else: block
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Upgrade any http:// requests to https://
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow iframing the app
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS filter (belt-and-suspenders)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Don't send full URL in Referer header to third-parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable unused browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for 1 year (HSTS) — middleware also sets this but belt+suspenders
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }]
    : []),
  // Content Security Policy
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

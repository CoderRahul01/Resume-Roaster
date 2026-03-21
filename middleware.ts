import { NextRequest, NextResponse } from "next/server";

// Paths that must only accept POST with JSON content-type
const API_POST_ONLY = [
  "/api/roast",
  "/api/rewrite",
  "/api/create-order",
  "/api/validate-coupon",
];

// Known bad user-agent substrings (scanners, exploit kits)
const BAD_UA_PATTERNS = [
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "zgrab",
  "nuclei",
  "dirbuster",
  "gobuster",
  "wfuzz",
  "havij",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // ── Block obvious scanner bots ────────────────────────────────────────────
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();
  if (BAD_UA_PATTERNS.some((p) => ua.includes(p))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ── Enforce POST + JSON content-type on mutating API routes ───────────────
  if (API_POST_ONLY.some((p) => pathname.startsWith(p))) {
    if (req.method !== "POST") {
      return new NextResponse("Method Not Allowed", { status: 405 });
    }
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return new NextResponse("Unsupported Media Type", { status: 415 });
    }
  }

  // ── Security headers added to every response ──────────────────────────────
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("X-Download-Options", "noopen");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return res;
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon|public/).*)"],
};

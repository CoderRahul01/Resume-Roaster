# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

> Always use `pnpm` (not npm or yarn) for package management.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `ANTHROPIC_API_KEY` — Anthropic Claude API key
- `RAZORPAY_KEY_ID` — Razorpay Key ID (from dashboard.razorpay.com → Settings → API Keys)
- `RAZORPAY_KEY_SECRET` — Razorpay Key Secret
- `NEXT_PUBLIC_BASE_URL` — Base URL (e.g. `http://localhost:3000`)
- `REDIS_URL` — Railway Redis plugin URL; omit to disable rate limiting in development

Missing `ANTHROPIC_API_KEY`, `RAZORPAY_KEY_ID`, or `RAZORPAY_KEY_SECRET` throws immediately on first request (fail-fast).

## Adding a New Service (LinkedIn Optimizer, Cover Letter, etc.)

1. Add the service config to `lib/config.ts` → `SERVICES` object (price, label, maxTokens)
2. Create `app/api/create-order-<service>/route.ts` — copy `create-order/route.ts`, change `SERVICES.rewrite` to your new service key
3. Create `app/api/<service>/route.ts` — verification + Claude call
4. Add a new component `components/<Service>Banner.tsx` — copy `PaywallBanner.tsx`, update `service` reference
5. Done. No other files need changing.

## Architecture

**Resume Roaster** is a Next.js 16 App Router SaaS that critiques resumes for free and sells AI rewrites for ₹499.

### User Flow

```
Home (paste resume) → POST /api/roast → Results (roast + paywall)
  → POST /api/create-order → Razorpay modal (no redirect)
  → Payment success → sessionStorage → /success
  → POST /api/rewrite (verifies signature + calls Claude)
```

No database. Resume text lives in `sessionStorage`. After payment, the Razorpay response `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` is stored in `sessionStorage` and passed to `/api/rewrite`, which verifies the signature server-side before calling Claude.

### API Routes (`/app/api/`)

| Route | Purpose |
|-------|---------|
| `POST /api/roast` | Validates resume, calls Claude → 6 critique points + score (1–10). Rate limited: 5/IP/hr |
| `POST /api/create-order` | Creates Razorpay order (₹499), returns `{ orderId, amount, currency, keyId }`. Rate limited: 10/IP/hr |
| `POST /api/rewrite` | Verifies Razorpay HMAC-SHA256 signature, calls Claude to rewrite resume. Rate limited: 20/IP/hr |
| `GET /api/health` | Health check for Railway (`{ status: "ok" }`) |

### Payment Verification (`/api/rewrite`)

Razorpay signature is verified with:
```
HMAC-SHA256(key=RAZORPAY_KEY_SECRET, data="orderId|paymentId") === razorpay_signature
```
This ensures the rewrite is only served to users who actually paid.

### Rate Limiting (`/lib/ratelimit.ts`)

Fixed-window rate limiter backed by Railway Redis (`REDIS_URL`). Fails open (allows all requests) if Redis is unavailable — development works without Redis. IP read from `x-forwarded-for`.

### AI Integration (`/lib/anthropic.ts`)

- Singleton Anthropic client
- Model: `claude-sonnet-4-5` for both roasting and rewriting
- Roast: max 1024 tokens, returns strict JSON (`{ roast: RoastPoint[], overallScore: number }`)
- Rewrite: max 4096 tokens, returns plain text only
- User input wrapped in `<resume>` XML tags to reduce prompt injection risk

### Razorpay Integration (`/lib/razorpay.ts`)

- Singleton Razorpay client (backend only)
- Razorpay checkout JS loaded via CDN script tag at runtime in `PaywallBanner`
- Amount: 49900 paise = ₹499

### Key Components

- `RoastCard` — renders one critique point (emoji + title + text)
- `RoastSkeleton` — loading state for 6 roast cards
- `RewriteBlur` — blurred placeholder shown before purchase
- `PaywallBanner` — "Pay ₹499" CTA; creates order, loads Razorpay modal, stores response in `sessionStorage`, navigates to `/success`

### Routing & State

All pages are client components (`"use client"`). Data flow via `sessionStorage`:
- `roastData` — JSON-stringified `RoastResponse`, set on home page after roast
- `resumeText` — raw resume string, set on home page
- `paymentData` — JSON-stringified Razorpay response, set by `PaywallBanner` on payment success; cleared after first rewrite call

### Styling

Tailwind CSS 4 with shadcn/ui. Dark theme by default (`#0a0a0a` background). Custom animation `animate-fade-in` defined in `globals.css`. Use `cn()` from `/lib/utils.ts` for conditional class merging.

## Deployment (Railway Pro)

`railway.toml` at the repo root configures the build. Railway health checks hit `GET /api/health`.

**Services to add in Railway dashboard:**
1. **Next.js app** — deploy from GitHub, auto-deploys on push to `main`
2. **Redis** — Railway Redis plugin → copies `REDIS_URL` into the app service's env

**Env vars to set in Railway dashboard:**
```
ANTHROPIC_API_KEY
RAZORPAY_KEY_ID       # use live key (rzp_live_...) in production
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_BASE_URL  # your Railway domain or custom domain
REDIS_URL             # auto-set by Railway Redis plugin
```

**Razorpay test vs live:** Use `rzp_test_` keys locally and `rzp_live_` keys in Railway production env.

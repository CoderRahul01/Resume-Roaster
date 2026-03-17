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
- `STRIPE_SECRET_KEY` — Stripe secret key (backend)
- `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (frontend)
- `NEXT_PUBLIC_BASE_URL` — Base URL (e.g. `http://localhost:3000`)

## Architecture

**Resume Roaster** is a Next.js 16 App Router SaaS that critiques resumes for free and sells AI rewrites for $4.99.

### User Flow

```
Home (paste resume) → POST /api/roast → Results (roast + paywall)
  → POST /api/create-checkout → Stripe Checkout
  → POST /api/rewrite → Success (rewritten resume)
```

No database — resume text is stored in `sessionStorage` client-side and encoded as chunked base64 in Stripe session metadata for retrieval after payment.

### API Routes (`/app/api/`)

| Route | Purpose |
|-------|---------|
| `POST /api/roast` | Validates resume, calls Claude to generate 6 critique points + score (1–10) |
| `POST /api/create-checkout` | Encodes resume into Stripe metadata (490-char chunks), creates $4.99 checkout session |
| `POST /api/rewrite` | Verifies Stripe payment, reconstructs resume from metadata, calls Claude to rewrite |

### AI Integration (`/lib/anthropic.ts`)

- Singleton Anthropic client
- Model: `claude-sonnet-4-5` for both roasting and rewriting
- Roast: max 1024 tokens, returns strict JSON (`{ roast: RoastPoint[], overallScore: number }`)
- Rewrite: max 4096 tokens, returns plain text only

### Stripe Integration (`/lib/stripe.ts`)

- Singleton Stripe client, API version `2026-02-25.clover`
- Resume passed through metadata as chunked base64 (`resume_0`, `resume_1`, ..., `resume_chunks`)
- Max resume ~18KB plain text (~48 chunks × 490 chars)

### Key Components

- `RoastCard` — renders one critique point (emoji + title + text)
- `RoastSkeleton` — loading state for 6 roast cards
- `RewriteBlur` — blurred placeholder shown before purchase
- `PaywallBanner` — "Unlock for $4.99" CTA; calls `/api/create-checkout` then redirects

### Routing & State

All pages are client components (`"use client"`). Roast data is passed from the home page to `/results` via `sessionStorage` under the key `roastData`. The Stripe session ID is passed to `/success` via URL query param (`?session_id=...`).

### Styling

Tailwind CSS 4 with shadcn/ui. Dark theme by default (`#0a0a0a` background). Custom animation `animate-fade-in` defined in `globals.css`. Use `cn()` from `/lib/utils.ts` for conditional class merging.

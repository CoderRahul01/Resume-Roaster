# 🔥 Resume Roaster

**Your Resume Sucks. Let's Prove It.**

Resume Roaster is a Next.js 16 App Router SaaS that critiques resumes using AI for free, and offers AI-powered rewrites via a ₹499 paywall. It features a "god-tier" dark mode minimalist UI, seamless Stripe/Razorpay integration, and a Wall of Shame leaderboard.

---

## 📖 Table of Contents
- [Use Cases](#-use-cases)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [System Flow](#-system-flow)
- [Environment Variables](#-environment-variables)
- [Local Development](#-local-development)
- [Deployment](#-deployment)

---

## 🎯 Use Cases

1. **Free Brutal AI Roast**: Users paste their resume text and receive a brutally honest, 6-point critique from Claude 3.5 Sonnet, alongside an overall score out of 10.
2. **The "Wall of Shame"**: The worst resumes (e.g., scoring 1.0/10) are highlighted on a glowing leaderboard with anonymous aliases and their most devastating feedback snippets.
3. **AI Resume Rewrite (Paid)**: Users humiliated by their score can pay ₹499 via Razorpay to have Claude intelligently rewrite and format their resume into a professional, hirable version.

---

## 🏗 Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui.
- **Backend**: Next.js Serverless API Routes (`/api/roast`, `/api/create-order`, `/api/rewrite`).
- **Database**: Prisma ORM with Postgres (Neon/Cloud) for tracking the "Wall of Shame" users and roast history.
- **Caching & Rate Limiting**: Redis (via `ioredis`) for strict API rate-limiting to prevent AI abuse.
- **AI Integration**: Anthropic SDK (Claude 3.5 Sonnet) for parsing and roasting the text.
- **Payments**: Razorpay integration for the paywall mechanism.

### System Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant NextApi as Next.js API
    participant Redis
    participant Claude as Anthropic API
    participant DB as Postgres (Prisma)
    participant Razorpay

    User->>Frontend: Pastes Resume & Clicks "Roast"
    Frontend->>NextApi: POST /api/roast
    NextApi->>Redis: Check Rate Limit (5/IP/hr)
    NextApi->>Claude: Send Prompt "<resume>...</resume>"
    Claude-->>NextApi: Returns JSON (Score + 6 critiques)
    NextApi->>DB: Save Roast to "Wall of Shame" Candidate List
    NextApi-->>Frontend: Display Results & Score
    
    User->>Frontend: Clicks "Fix My Resume (₹499)"
    Frontend->>NextApi: POST /api/create-order
    NextApi->>Razorpay: Create Order
    Razorpay-->>NextApi: orderId
    NextApi-->>Frontend: Load Razorpay Modal
    User->>Razorpay: Completes Payment
    Razorpay-->>Frontend: paymentId & signature
    Frontend->>NextApi: POST /api/rewrite (signature)
    NextApi->>NextApi: Verify HMAC-SHA256 Signature
    NextApi->>Claude: Send specific Rewrite prompt
    Claude-->>NextApi: Returns Professional Resume
    NextApi-->>Frontend: Displays New Resume
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# AI Provider
ANTHROPIC_API_KEY="..."

# Payments (Choose Stripe or Razorpay based on region)
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Infrastructure
DATABASE_URL="postgresql://user:password@hostname:5432/db"
REDIS_URL="redis://default:password@hostname:port"
```

---

## 💻 Local Development

1. **Install Dependencies:**
   Must use `pnpm`:
   ```bash
   pnpm install
   ```

2. **Database Setup:**
   Ensure `DATABASE_URL` is set, then generate the Prisma client and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🚀 Deployment

The target deployment environment is **Railway Pro** or **Vercel**. 

1. Push your code to GitHub.
2. Link your repository to Railway/Vercel.
3. Automatically provision a **Postgres** and **Redis** instance in your Railway project, or link external URIs.
4. Add all environment variables from `.env.local` to the production environment settings.
5. Setup the build command: `pnpm build` (Prisma generate MUST run during the build step).

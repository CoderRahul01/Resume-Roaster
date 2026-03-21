# syntax=docker/dockerfile:1

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
# Allow prisma/engine build scripts to run so the native binary is compiled
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm approve-builds --yes 2>/dev/null || true
RUN pnpm rebuild 2>/dev/null || true

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Only NEXT_PUBLIC_* vars are baked into the bundle at build time.
# All secrets (API keys, DB URL) are injected at runtime by Railway.
ARG NEXT_PUBLIC_BASE_URL=https://resumeroaster.in
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Generate Prisma client from schema (uses schema only, no DB connection needed)
RUN pnpm prisma generate

# Build Next.js
RUN pnpm build

# ─── Stage 3: Production runner ──────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# Copy Prisma schema + generated client for runtime queries
COPY --from=builder --chown=nextjs:nodejs /app/prisma           ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/generated        ./generated

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run DB migrations then start the server.
# Set DATABASE_URL in Railway environment variables.
CMD ["node", "server.js"]

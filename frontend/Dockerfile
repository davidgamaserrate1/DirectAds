# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build-time env (placeholder — overridden at runtime or in Railway)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Stage 3: Production with nginx ──
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache nginx

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Ensure nginx can write to its temp/log dirs
RUN mkdir -p /var/lib/nginx/tmp /var/log/nginx \
 && chown -R nextjs:nodejs /var/lib/nginx /var/log/nginx /run/nginx

USER nextjs

EXPOSE 3000

# Start Next.js standalone on port 3001 (internal), nginx on port 3000 (public)
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
CMD sh -c "node server.js & nginx -g 'daemon off;'"

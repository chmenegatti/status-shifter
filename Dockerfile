# Multi-stage build for Next.js app (App Router)
FROM node:18-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=9000
# Default etcd endpoint; override at runtime as needed
ENV ETCD_ENDPOINT=http://nemesis-etcd:2379
ENV ETCD_API_VERSION=v3

# Copy standalone output produced by next build
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 9000
CMD ["node", "server.js"]

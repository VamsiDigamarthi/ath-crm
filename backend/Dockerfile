# ----------------------------------------
# Stage 1: Build & Prisma Generation
# ----------------------------------------
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and Prisma schema
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# ----------------------------------------
# Stage 2: Production Runtime
# ----------------------------------------
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma files, config, and compiled code
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Start production server
CMD ["node", "dist/index.js"]

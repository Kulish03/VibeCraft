# ===================================================
# Stage 1: Build Frontend Single Page Application
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications first for layer caching
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy frontend source code
COPY . .

# Build production distribution
RUN npm run build

# ===================================================
# Stage 2: Production Nginx Runtime
# ===================================================
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check to ensure Nginx is serving the frontend
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

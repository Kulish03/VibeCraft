# ===================================================
# Production Dockerfile for VIBECRAFT Backend
# ===================================================
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Create application directory
WORKDIR /app

# Install security updates and utilities
RUN apk --no-cache add curl wget

# Create non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev

# Copy backend application source code
COPY src ./src

# Set proper ownership for non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

# Start production server
CMD ["node", "src/server.js"]

# Multi-stage build for Real Estate Portal Backend

# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=development

# Copy source code
COPY . .

# Expose ports (app + debug)
EXPOSE 3000 9229

# Development command with debugging
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations

# Copy health check script
COPY healthcheck.js ./

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads && \
    chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node healthcheck.js

# Start the application
CMD ["node", "dist/server.js"]
# Multi-stage Dockerfile for NestJS application

# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json yarn.lock* ./

# Install dependencies (including dev dependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production stage
FROM node:22-alpine AS production

# Create app directory
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package*.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any necessary static files (if any)
# COPY --from=builder /app/public ./public

# Change ownership to the nodejs user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]

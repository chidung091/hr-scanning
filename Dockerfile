# Multi-stage build for production
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for PDF processing
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Create app user for development
RUN addgroup -g 1001 -S nodejs && \
    adduser -S adonisjs -u 1001

# Install all dependencies (including dev dependencies)
RUN npm ci

# Create necessary directories with proper permissions
RUN mkdir -p uploads/cvs tmp storage/cvs /tmp/.vite && \
    chown -R adonisjs:nodejs /app /tmp/.vite && \
    chmod -R 755 /app /tmp/.vite

# Switch to non-root user before copying files
USER adonisjs

# Copy application files
COPY --chown=adonisjs:nodejs . .

# Ensure node_modules has proper permissions for Vite cache
RUN chmod -R 755 node_modules || true

EXPOSE 3333
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build

# Create app user for build stage
RUN addgroup -g 1001 -S nodejs && \
    adduser -S adonisjs -u 1001

# Install all dependencies (including dev dependencies)
RUN npm ci

# Create necessary directories and set permissions
RUN mkdir -p uploads/cvs tmp storage/cvs /tmp/.vite && \
    chown -R adonisjs:nodejs /app /tmp/.vite && \
    chmod -R 755 /app /tmp/.vite

# Switch to non-root user
USER adonisjs

# Copy application files
COPY --chown=adonisjs:nodejs . .

# Ensure node_modules has proper permissions for Vite
RUN chmod -R 755 node_modules || true

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies for PDF processing
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S adonisjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=adonisjs:nodejs /app/build .
COPY --from=build --chown=adonisjs:nodejs /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p uploads/cvs && chown -R adonisjs:nodejs uploads

# Switch to non-root user
USER adonisjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node ace healthcheck || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "bin/server.js"]

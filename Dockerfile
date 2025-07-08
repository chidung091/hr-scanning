FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=development
ENV IS_DOCKER=true

# Set working directory
WORKDIR /app

# Install system dependencies (for PDF and Vite deps)
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

# Add app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S adonisjs -u 1001

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Create Vite cache directory and app data dirs
RUN mkdir -p /tmp/vite_cache uploads/cvs tmp storage/cvs && \
    chown -R adonisjs:nodejs /app /tmp/vite_cache && \
    chmod -R 755 /app /tmp/vite_cache

# Switch to non-root user
USER adonisjs

# Copy source code
COPY --chown=adonisjs:nodejs . .

# Ensure permissions for node_modules
RUN chmod -R 755 node_modules || true

# Expose dev port
EXPOSE 3333

# Start AdonisJS dev server
CMD ["npm", "run", "dev"]
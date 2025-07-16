# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY data-reader/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY data-reader/src ./src
COPY data-reader/tsconfig.json ./
COPY data-reader/migrate-mongo-config.js ./

# Install TypeScript and build tools for production build
RUN npm install -g typescript ts-node

# Build the application
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 
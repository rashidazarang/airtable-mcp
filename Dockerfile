FROM node:20-slim

WORKDIR /app

# Copy package files and source
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY bin/ ./bin/

# Install all dependencies (including dev for build)
RUN npm ci

# Build TypeScript
RUN npm run build

# Remove dev dependencies to slim down
RUN npm prune --production

# Expose HTTP port
EXPOSE 8080

# Set environment variable for HTTP mode
ENV PORT=8080

# Start the server
CMD ["node", "dist/typescript/airtable-mcp-server.js"]

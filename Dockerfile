FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/
COPY bin/ ./bin/

# Set entrypoint
ENTRYPOINT ["node", "dist/typescript/airtable-mcp-server.js"]

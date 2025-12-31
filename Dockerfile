FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/
COPY bin/ ./bin/

# Expose HTTP port
EXPOSE 8080

# Set environment variable for HTTP mode
ENV PORT=8080

# Start the server
CMD ["node", "dist/typescript/airtable-mcp-server.js"]

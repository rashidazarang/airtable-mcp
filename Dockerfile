FROM python:3.10-slim

WORKDIR /app

# Install Node.js for the NPX functionality
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first (for better layer caching)
COPY package.json /app/
COPY package-lock.json /app/

# Install Node.js dependencies
RUN npm install

# Copy Python requirements and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY index.js /app/
COPY airtable_mcp/ /app/airtable_mcp/

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

# Expose the port the server might run on
EXPOSE 3000

# Start the server in STDIO mode by default
# Smithery will override this with their own command
CMD ["node", "index.js"] 
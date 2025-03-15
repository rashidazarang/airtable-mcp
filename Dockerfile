FROM python:3.10-slim

WORKDIR /app

# Install Node.js for the NPX functionality
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json index.js /app/
COPY airtable_mcp/ /app/airtable_mcp/
COPY requirements.txt /app/

# Install MCP Python Core from the Smithery release
RUN pip install --no-cache-dir https://smithery.ai/api/packages/base-python-client/releases/latest/download && \
    pip install --no-cache-dir -r requirements.txt

# Install the Node.js package
RUN npm install

# Expose the port the server will run on
EXPOSE 3000

# Command to run the server
ENTRYPOINT ["node", "index.js"] 
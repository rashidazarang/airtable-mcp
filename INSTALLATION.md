# Installation

Airtable MCP embeds Airtable database connectivity directly into your AI-powered code editor

## Getting Started

Built by Rashid Azarang,

Airtable MCP gives AI code editors and agents the ability to access and manipulate your Airtable databases for powerful data management capabilities - all in a secure manner with your own API tokens.

With this MCP server tool, you can enable AI code editors and agents to have access to:

* List and access all your Airtable bases
* Browse tables, fields, and record data
* Create, read, update, and delete records
* Export and manipulate schemas
* Perform complex queries against your data
* Create data migration mappings
* Analyze and transform your Airtable data

That way, you can simply tell Cursor or any AI code editor with MCP integrations:

"Show me all the tables in my Airtable base"

"Find all records from the Customers table where the status is Active and the last purchase was after January 1st"

"Create a new record in the Products table with these fields..."

"Export the schema of my current Airtable base"

"Help me create a mapping between these two tables for data migration"

---

## Requirements

* Node.js 14+ installed on your machine
* Python 3.10+ installed on your machine (automatically detected)
* Airtable Personal Access Token (API Key)
* MCP Client Application (Cursor, Claude Desktop, Cline, Zed, etc.)

**Note**: Model Context Protocol (MCP) is specific to Anthropic models. When using an editor like Cursor, make sure to enable composer agent with Claude 3.5 Sonnet selected as the model.

---

## Installation

### 1. Install via NPX (Recommended)

The simplest way to install and use Airtable MCP is via NPX:

```bash
# Install globally
npm install -g airtable-mcp

# Or use directly with npx (no installation needed)
npx airtable-mcp --token YOUR_AIRTABLE_TOKEN --base YOUR_BASE_ID
```

### 2. Get Your Airtable API Token

1. Log in to your Airtable account
2. Go to your [Account Settings](https://airtable.com/account)
3. Navigate to the "API" section
4. Create a Personal Access Token with appropriate permissions
5. Copy your token to use in the configuration

### 3. Configure Your MCP Client

#### For Cursor:

1. Go to Cursor Settings
2. Navigate to Features, scroll down to MCP Servers and click "Add new MCP server"
3. Give it a unique name (airtable-tools), set type to "command" and set the command to:

**For macOS/Linux/Windows:**
```bash
npx airtable-mcp --token YOUR_AIRTABLE_TOKEN --base YOUR_BASE_ID
```

Replace `YOUR_AIRTABLE_TOKEN` with your Airtable Personal Access Token and `YOUR_BASE_ID` with your default Airtable base ID (optional).

#### For Advanced Users via ~/.cursor/mcp.json:

Edit your `~/.cursor/mcp.json` file to include:

```json
{
  "mcpServers": {
    "airtable-tools": {
      "command": "npx",
      "args": [
        "airtable-mcp",
        "--token", "YOUR_AIRTABLE_TOKEN",
        "--base", "YOUR_BASE_ID"
      ]
    }
  }
}
```

### 4. Verify Connection

1. Restart your MCP client (Cursor, etc.)
2. Create a new query using the Composer Agent with Claude 3.5 Sonnet model
3. Ask something like "List my Airtable bases" or "Show me the tables in my current base"
4. You should see a response with your Airtable data

### 5. For Production Use (Optional)

For continuous availability, you can set up Airtable MCP using PM2:

```bash
# Install PM2 if you don't have it
npm install -g pm2

# Create a PM2 config file
echo 'module.exports = {
  apps: [
    {
      name: "airtable-mcp",
      script: "npx",
      args: [
        "airtable-mcp",
        "--token", "YOUR_AIRTABLE_TOKEN",
        "--base", "YOUR_BASE_ID"
      ],
      env: {
        PATH: process.env.PATH,
      },
    },
  ],
};' > ecosystem.config.js

# Start the process
pm2 start ecosystem.config.js

# Set it to start on boot
pm2 startup
pm2 save
```

---

## Troubleshooting

Here are some common issues and their solutions:

### Error: Unable to connect to Airtable API

- Double-check your Airtable API token is correct and has sufficient permissions
- Verify your internet connection
- Check if Airtable API is experiencing downtime

### Issue: MCP server not connecting

- Make sure Node.js 14+ and Python 3.10+ are installed and in your PATH
- Try specifying a specific version: `npx airtable-mcp@latest`
- Check the Cursor logs for any connection errors

### Error: Base not found

- Verify your base ID is correct
- Make sure your API token has access to the specified base
- Try listing all bases first to confirm access

### Issue: Permission denied errors

- Make sure your token has the necessary permissions for the operations you're trying to perform
- Check if you're attempting operations on tables/bases that your token doesn't have access to

### For more help

- Open an issue on the [GitHub repository](https://github.com/rashidae/airtable-mcp/issues)
- Check the Airtable API documentation for any API-specific errors 
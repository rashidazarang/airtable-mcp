# Quick Start Guide for Claude Users

This guide provides simple instructions for getting the Airtable MCP working with Claude.

## Step 1: Clone the repository

```bash
git clone https://github.com/rashidazarang/airtable-mcp.git
cd airtable-mcp
```

## Step 2: Install dependencies

```bash
npm install
pip install mcp
```

## Step 3: Configure Claude

In Claude settings, add a new MCP server with this configuration (adjust paths as needed):

```json
{
  "mcpServers": {
    "airtable": {
      "command": "python3",
      "args": [
        "/path/to/airtable-mcp/inspector_server.py",
        "--token",
        "YOUR_AIRTABLE_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

Replace:
- `/path/to/airtable-mcp/` with the actual path where you cloned the repository
- `YOUR_AIRTABLE_TOKEN` with your Airtable Personal Access Token
- `YOUR_BASE_ID` with your Airtable Base ID

## Step 4: Restart Claude

After configuring, restart Claude and try these commands:

1. "List the tables in my Airtable base"
2. "Show me records from [table name]"

## Troubleshooting

If you encounter issues:

1. Check the Claude logs (click on the error message)
2. Verify your Airtable token and base ID are correct
3. Make sure you've specified the correct path to `inspector_server.py`

This version includes enhanced error handling to properly format JSON responses and avoid "Method not found" errors in Claude. 
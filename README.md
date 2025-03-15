# Airtable MCP

![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![Available on Smithery](https://img.shields.io/badge/Available%20on-Smithery-black?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAzOCAzOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyNl8xMzUpIj4KPHBhdGggZD0iTTguNjI1IDE0LjYyNUgxOS44NzVMMTQuMzc1IDIzLjM3NUg4LjYyNUwxNC4zNzUgMTQuNjI1VjguODc1TDMuMTI1IDIzLjM3NVYyOS4xMjVIMTQuMzc1TDE5Ljg3NSAyMC4zNzVIMjUuNjI1TDE5Ljg3NSAyOS4xMjVMMzQuODc1IDExLjc1SDI5LjEyNUwyMy42MjUgMTEuNzVMMTkuODc1IDMuMTI1SDMuMTI1VjhMMTQuMzc1IDhMMTkuODc1IDE3LjI1SDI1LjYyNUwxOS44NzUgOC44NzVMOC42MjUgMjYuMjVMMjkuMTI1IDI2LjI1SDM0Ljg3NUwzNC44NzUgMjAuMzc1TDIzLjYyNSAyMC4zNzVMMTkuODc1IDExLjc1SDguNjI1VjE0LjYyNVoiIGZpbGw9IndoaXRlIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMTI2XzEzNSI+CjxyZWN0IHdpZHRoPSIzMS43NSIgaGVpZ2h0PSIyNiIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMuMTI1IDMuMTI1KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=)](https://smithery.ai/server/@rashidazarang/airtable-mcp/tools)

> Connect your AI tools directly to Airtable. Query, create, update, and delete records using natural language. Features include base management, table operations, schema manipulation, record filtering, and data migration—all through a standardized MCP interface compatible with Cursor, Claude Code, Cline, Zed, and other Claude-powered editors.

This application is a powerful Airtable integration tool that enables AI-powered applications via Anthropic's Model Context Protocol (MCP) to access and manipulate Airtable data directly from your IDE.

## Features

- **Base Management**: List and select Airtable bases
- **Table Operations**: Browse tables, fields, and records
- **Data Access**: Read, create, update, and delete records
- **Schema Management**: Export, compare, and update schemas
- **Command-line Configuration**: Use API tokens directly through command-line parameters
- **NPX Compatible**: Easy installation with a single command
- **Smithery Integration**: One-click installation via Smithery

## Architecture

There are two core components used to access and manipulate Airtable data:

1. **Airtable MCP Server**: A Python server that provides standardized tools for AI clients to interact with Airtable.
2. **MCP Client**: Any client that supports the Model Context Protocol (Cursor, Claude Desktop, Cline, Zed, etc.).

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  MCP Client │ ──► │  Airtable    │ ──► │   Airtable    │
│  (e.g.      │ ◄── │  MCP Server  │ ◄── │     API       │
│   Cursor)   │     │              │     │               │
└─────────────┘     └──────────────┘     └───────────────┘
```

Model Context Protocol (MCP) is a capability supported by Anthropic AI models that allows you to create custom tools for any compatible client. MCP clients like Claude Desktop, Cursor, Cline, or Zed can run an MCP server which "teaches" these clients about new tools they can use.

## Installation

### Prerequisites

- Node.js 14+
- Python 3.10+ (automatically detected)
- Airtable API token
- A compatible MCP client (Cursor, Claude Desktop, etc.)

### Smithery Installation (Recommended)

The easiest way to install:

1. Visit [Smithery](https://smithery.ai)
2. Search for "@rashidazarang/airtable-mcp"
3. Click "Install" and follow the prompts

### Quick Setup with NPX (Alternative)

Another fast way to get started:

```bash
# Install globally
npm install -g airtable-mcp

# Or run directly with npx
npx airtable-mcp --token "your_airtable_token" --base "your_base_id"
```

### Configure Your MCP Client

For Cursor, update your `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "airtable-tools": {
      "command": "npx",
      "args": [
        "airtable-mcp",
        "--token", "your_airtable_token",
        "--base", "your_base_id"
      ]
    }
  }
}
```

Restart your MCP client to load the new tools.

### Manual Installation (Advanced)

If you prefer to clone the repository and install manually:

1. Clone this repository:
   ```bash
   git clone https://github.com/rashidazarang/airtable-mcp.git
   cd airtable-mcp
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python airtable_mcp/src/server.py --token "your_airtable_token" --base "your_base_id"
   ```

## Usage

Once installed and configured, you can use natural language to interact with your Airtable data:

- "Show me all the bases I have access to"
- "List the tables in my current base"
- "Show me the structure of the Customers table"
- "Get the first 10 records from the Orders table"
- "Create a new record in the Products table"
- "Update record XYZ in the Inventory table"
- "Export the schema of my current base"

## Available Tools

| Tool Name | Description |
|-----------|-------------|
| `list_bases` | List all accessible Airtable bases |
| `list_tables` | List all tables in the specified or default base |
| `list_records` | List records from a table with optional filtering |
| `get_record` | Get a specific record from a table |
| `create_records` | Create records in a table from JSON string |
| `update_records` | Update records in a table from JSON string |
| `delete_records` | Delete records from a table by IDs |
| `export_records` | Export records from a table as JSON string |
| `import_records` | Import records to a table from JSON string |
| `create_tables` | Create tables from a JSON schema |
| `update_schema` | Update existing tables to match a JSON schema |
| `set_base_id` | Set the current Airtable base ID |
| `inspect_table` | Get detailed information about a table's structure and fields |
| `export_schema` | Export the schema of the current base in JSON or CSV format |
| `compare_schemas` | Compare the provided schema with the current base schema |
| `generate_field_mapping` | Generate a field mapping between two tables |
| `migrate_data` | Migrate data from one table to another using the specified field mapping |

## PM2 Configuration

For production use, you can use PM2 to manage the Airtable MCP server:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'airtable-mcp',
      script: 'npx',
      args: [
        'airtable-mcp',
        '--token', 'your_airtable_token',
        '--base', 'your_base_id'
      ],
      interpreter: '/usr/local/bin/node',
      env: {
        PATH: process.env.PATH,
      },
    },
  ],
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

## Compatibility

- Works with any MCP-compatible client
- Primarily designed for Cursor IDE integration
- Supports other AI editors and MCP clients

## Detailed Documentation

For detailed installation instructions, troubleshooting, and advanced configurations, see [INSTALLATION.md](INSTALLATION.md).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
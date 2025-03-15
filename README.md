# Airtable MCP

> Connect your AI tools directly to Airtable for seamless data access and management

This application is a powerful Airtable integration tool that enables AI-powered applications via Anthropic's Model Context Protocol (MCP) to access and manipulate Airtable data directly from your IDE.

## Features

- **Base Management**: List and select Airtable bases
- **Table Operations**: Browse tables, fields, and records
- **Data Access**: Read, create, update, and delete records
- **Schema Management**: Export, compare, and update schemas
- **Command-line Configuration**: Use API tokens directly through command-line parameters

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

- Python 3.10+
- Airtable API token
- A compatible MCP client (Cursor, Claude Desktop, etc.)

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/rashidae/airtable-mcp.git
   cd airtable-mcp
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure your MCP client to use the Airtable MCP server.

   For Cursor, update your `~/.cursor/mcp.json` file:
   ```json
   {
     "mcpServers": {
       "airtable-tools": {
         "command": "/path/to/python3.10",
         "args": [
           "/path/to/airtable-mcp/src/server.py",
           "--token", "your_airtable_token",
           "--base", "your_base_id"
         ]
       }
     }
   }
   ```

4. Restart your MCP client to load the new tools.

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
      script: '/path/to/airtable-mcp/src/server.py',
      args: [
        '--token', 'your_airtable_token',
        '--base', 'your_base_id'
      ],
      interpreter: '/path/to/python3.10',
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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
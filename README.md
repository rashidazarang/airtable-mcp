# Airtable MCP Server

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/rashidazarang/airtable-mcp)](https://archestra.ai/mcp-catalog/rashidazarang__airtable-mcp)
[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)
![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![MCP](https://img.shields.io/badge/MCP-3.2.6-blue)](https://github.com/rashidazarang/airtable-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![AI Agent](https://img.shields.io/badge/AI_Agent-Enhanced-purple)](https://github.com/rashidazarang/airtable-mcp)
[![Security](https://img.shields.io/badge/Security-Enterprise-green)](https://github.com/rashidazarang/airtable-mcp)
[![Protocol](https://img.shields.io/badge/Protocol-2024--11--05-success)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server for Airtable with full CRUD operations, schema management, webhooks, batch operations, and AI-powered analytics.

**Version 3.2.6** | MCP Protocol 2024-11-05

---

## Overview

This server provides comprehensive Airtable integration through the Model Context Protocol, enabling natural language interactions with your Airtable data. It includes 33 tools for data operations and 10 AI prompt templates for intelligent analytics.

### Key Features

- **Full CRUD Operations** — Create, read, update, and delete records with filtering and pagination
- **Schema Management** — Create and modify tables, fields, and views programmatically
- **Batch Operations** — Process up to 10 records per operation for improved performance
- **Webhook Management** — Set up real-time notifications for data changes
- **AI Analytics** — Predictive analytics, natural language queries, and automated insights
- **Multi-Base Support** — Discover and work with multiple bases dynamically
- **Type Safety** — Full TypeScript support with comprehensive type definitions

---

## Prerequisites

- Node.js 14 or later
- An Airtable account with a Personal Access Token
- Your Airtable Base ID (optional—can be discovered via the `list_bases` tool)

---

## Installation

### Option 1: NPM (Recommended)

```bash
npm install -g @rashidazarang/airtable-mcp
```

### Option 2: Clone from GitHub

```bash
git clone https://github.com/rashidazarang/airtable-mcp.git
cd airtable-mcp
npm install
```

---

## Configuration

### Step 1: Get Your Airtable Credentials

1. **Personal Access Token**: Go to [Airtable Account Settings](https://airtable.com/account) and create a token with these scopes:
   - `data.records:read` — Read records
   - `data.records:write` — Create, update, delete records
   - `schema.bases:read` — View table schemas
   - `schema.bases:write` — Create and modify tables and fields
   - `webhook:manage` — Manage webhooks (optional)

2. **Base ID**: Open your Airtable base and copy the ID from the URL: `https://airtable.com/[BASE_ID]/...`

### Step 2: Environment Variables

Create a `.env` file in your project directory:

```bash
AIRTABLE_TOKEN=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id  # Optional in v3.2.5+
```

> **Note**: The Base ID is optional. You can start without one and use the `list_bases` tool to discover accessible bases, or specify base IDs per tool call.

### Step 3: Configure Your MCP Client

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["@rashidazarang/airtable-mcp"],
      "env": {
        "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN",
        "AIRTABLE_BASE_ID": "YOUR_BASE_ID"
      }
    }
  }
}
```

To start without a base ID (and discover bases dynamically):

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["@rashidazarang/airtable-mcp"],
      "env": {
        "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN"
      }
    }
  }
}
```

### Step 4: Restart Your MCP Client

Restart Claude Desktop or your MCP client to load the server.

---

## Usage

Once configured, interact with your Airtable data using natural language:

### Basic Operations

- "List all my accessible Airtable bases"
- "Show me all records in the Projects table"
- "Create a new task with priority 'High' and due date tomorrow"
- "Update the status of task ID rec123 to 'Completed'"
- "Search for records where Status equals 'Active'"

### Schema Management

- "Show me the complete schema for this base"
- "Create a new table called 'Tasks' with Name, Priority, and Due Date fields"
- "Add a Status field to the Projects table"

### Batch Operations

- "Create 5 new records at once in the Tasks table"
- "Update multiple records with new status values"
- "Delete these 3 records in one operation"

### Webhooks

- "Create a webhook for my table that notifies https://my-app.com/webhook"
- "List all active webhooks in my base"

### TypeScript Usage

```typescript
import {
  AirtableMCPServer,
  ListRecordsInput,
  AnalyzeDataPrompt
} from '@rashidazarang/airtable-mcp/types';

const server = new AirtableMCPServer();

const params: ListRecordsInput = {
  table: 'Tasks',
  maxRecords: 10,
  filterByFormula: "Status = 'Active'"
};

const records = await server.handleToolCall('list_records', params);
```

---

## Available Tools

### Data Operations (7 tools)

| Tool | Description |
|------|-------------|
| `list_tables` | Get all tables in your base with schema information |
| `list_records` | Query records with filtering and pagination |
| `get_record` | Retrieve a single record by ID |
| `create_record` | Add new records to any table |
| `update_record` | Modify existing record fields |
| `delete_record` | Remove records from a table |
| `search_records` | Advanced search with Airtable formulas |

### Schema Discovery (6 tools)

| Tool | Description |
|------|-------------|
| `list_bases` | List all accessible bases with permissions |
| `get_base_schema` | Get complete schema for any base |
| `describe_table` | Get detailed table and field specifications |
| `list_field_types` | Reference guide for available field types |
| `get_table_views` | List all views for a table |

### Table Management (3 tools)

| Tool | Description |
|------|-------------|
| `create_table` | Create tables with custom field definitions |
| `update_table` | Modify table names and descriptions |
| `delete_table` | Remove tables (requires confirmation) |

### Field Management (3 tools)

| Tool | Description |
|------|-------------|
| `create_field` | Add fields to existing tables |
| `update_field` | Modify field properties and options |
| `delete_field` | Remove fields (requires confirmation) |

### Batch Operations (4 tools)

| Tool | Description |
|------|-------------|
| `batch_create_records` | Create up to 10 records at once |
| `batch_update_records` | Update up to 10 records simultaneously |
| `batch_delete_records` | Delete up to 10 records in one operation |
| `batch_upsert_records` | Update or create records based on key fields |

### Webhook Management (5 tools)

| Tool | Description |
|------|-------------|
| `list_webhooks` | View all configured webhooks |
| `create_webhook` | Set up real-time notifications |
| `delete_webhook` | Remove webhook configurations |
| `get_webhook_payloads` | Retrieve notification history |
| `refresh_webhook` | Extend webhook expiration |

### Views and Attachments (3 tools)

| Tool | Description |
|------|-------------|
| `create_view` | Create views (grid, form, calendar, etc.) |
| `get_view_metadata` | Get view details including filters |
| `upload_attachment` | Attach files from URLs |

### Base Management (3 tools)

| Tool | Description |
|------|-------------|
| `create_base` | Create new bases with initial structure |
| `list_collaborators` | View collaborators and permissions |
| `list_shares` | List shared views and configurations |

---

## AI Intelligence Suite

Ten AI prompt templates for advanced analytics:

| Prompt | Description |
|--------|-------------|
| `analyze_data` | Statistical analysis with anomaly detection |
| `create_report` | Intelligent report generation |
| `data_insights` | Business intelligence and pattern discovery |
| `optimize_workflow` | Automation recommendations |
| `smart_schema_design` | Database optimization suggestions |
| `data_quality_audit` | Quality assessment and remediation |
| `predictive_analytics` | Forecasting and trend prediction |
| `natural_language_query` | Process questions with context awareness |
| `smart_data_transformation` | AI-assisted data processing |
| `automation_recommendations` | Workflow optimization with cost-benefit analysis |

---

## Advanced Configuration

### Smithery Cloud

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": [
        "@smithery/cli",
        "run",
        "@rashidazarang/airtable-mcp",
        "--token", "YOUR_TOKEN",
        "--base", "YOUR_BASE_ID"
      ]
    }
  }
}
```

### Direct Node.js Execution

```json
{
  "mcpServers": {
    "airtable": {
      "command": "node",
      "args": [
        "/path/to/airtable-mcp/airtable_simple.js",
        "--token", "YOUR_TOKEN",
        "--base", "YOUR_BASE_ID"
      ]
    }
  }
}
```

---

## Testing

### TypeScript

```bash
npm install
npm run test:types    # Type checking
npm run test:ts       # Full test suite
npm run build && npm run start:ts
```

### JavaScript

```bash
export AIRTABLE_TOKEN=your_token
export AIRTABLE_BASE_ID=your_base_id
node airtable_simple.js &
./test_v1.6.0_comprehensive.sh
```

---

## Troubleshooting

**Connection Refused**
- Verify the MCP server is running
- Check that port 8010 is available
- Restart your MCP client

**Invalid Token**
- Verify your Personal Access Token is correct
- Confirm the token has the required scopes
- Check for extra whitespace in credentials

**Base Not Found**
- Confirm your Base ID is correct
- Verify your token has access to the base

**Port Conflicts**
```bash
lsof -ti:8010 | xargs kill -9
```

---

## Project Structure

```
airtable-mcp/
├── src/
│   ├── typescript/       # TypeScript implementation (primary)
│   └── javascript/       # JavaScript implementation
├── dist/                 # Compiled output
├── docs/                 # Documentation
├── tests/                # Test files
├── examples/             # Usage examples
├── types/                # TypeScript definitions
└── bin/                  # CLI executables
```

---

## Documentation

- [Installation Guide](docs/guides/INSTALLATION.md)
- [Quick Start](docs/guides/QUICK_START.md)
- [Type Definitions](types/)
- [Release Notes](docs/releases/)
- [Changelog](docs/CHANGELOG.md)

---

## Contributing

Contributions are welcome. Please open an issue first to discuss major changes.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Support

- [GitHub Issues](https://github.com/rashidazarang/airtable-mcp/issues)
- [GitHub Discussions](https://github.com/rashidazarang/airtable-mcp/discussions)

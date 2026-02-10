# Airtable MCP Server

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/rashidazarang/airtable-mcp)](https://archestra.ai/mcp-catalog/rashidazarang__airtable-mcp)
[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)
![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![MCP](https://img.shields.io/badge/MCP-4.0.0-blue)](https://github.com/rashidazarang/airtable-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![AI Agent](https://img.shields.io/badge/AI_Agent-Enhanced-purple)](https://github.com/rashidazarang/airtable-mcp)
[![Security](https://img.shields.io/badge/Security-Enterprise-green)](https://github.com/rashidazarang/airtable-mcp)
[![Protocol](https://img.shields.io/badge/Protocol-2024--11--05-success)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server for Airtable with full CRUD operations, schema management, record comments, webhooks, batch operations, governance controls, and AI-powered analytics.

**Version 4.0.0** | MCP Protocol 2024-11-05 | [![npm](https://img.shields.io/npm/v/@rashidazarang/airtable-mcp)](https://www.npmjs.com/package/@rashidazarang/airtable-mcp)

---

## Quick Start

No installation required — just add this to your Claude Desktop config and restart:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["-y", "@rashidazarang/airtable-mcp"],
      "env": {
        "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN",
        "AIRTABLE_BASE_ID": "YOUR_BASE_ID"
      }
    }
  }
}
```

That's it. `npx` downloads and runs the server automatically. No `git clone`, no `npm install`.

> **Get your token** at [airtable.com/create/tokens](https://airtable.com/create/tokens). **Get your Base ID** from the URL when viewing your base: `https://airtable.com/[BASE_ID]/...`

---

## Overview

This server provides comprehensive Airtable integration through the Model Context Protocol, enabling natural language interactions with your Airtable data. It includes **42 tools** covering every Airtable PAT scope and **10 AI prompt templates** for intelligent analytics.

### Key Features

- **Full CRUD Operations** — Create, read, update, and delete records with filtering and pagination
- **Record Comments** — List, create, update, and delete comments on records
- **Schema Management** — Create and modify tables, fields, and views programmatically
- **Batch Operations** — Process up to 10 records per operation for improved performance
- **Webhook Management** — Set up real-time notifications for data changes
- **Governance & Compliance** — Allow-list governance, PII masking, and exception tracking
- **User Identity** — Verify token identity with the `whoami` tool
- **AI Analytics** — 10 prompt templates for predictive analytics, natural language queries, and automated insights
- **Multi-Base Support** — Discover and work with multiple bases dynamically
- **Type Safety** — Full TypeScript support with comprehensive type definitions

---

## Prerequisites

- Node.js 18 or later
- An Airtable account with a Personal Access Token
- Your Airtable Base ID (optional — can be discovered via the `list_bases` tool)

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
npm run build
```

---

## Configuration

### Step 1: Get Your Airtable Credentials

1. **Personal Access Token**: Go to [airtable.com/create/tokens](https://airtable.com/create/tokens) and create a token with these scopes:
   - `data.records:read` — Read records
   - `data.records:write` — Create, update, delete records
   - `data.recordComments:read` — Read record comments
   - `data.recordComments:write` — Create, update, delete comments
   - `schema.bases:read` — View table schemas
   - `schema.bases:write` — Create and modify tables and fields
   - `user.email:read` — Read user identity (whoami)
   - `webhook:manage` — Manage webhooks (optional)

2. **Base ID**: Open your Airtable base and copy the ID from the URL: `https://airtable.com/[BASE_ID]/...`

### Step 2: Configure Your MCP Client

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

### Claude Code Configuration

If you use [Claude Code](https://docs.anthropic.com/en/docs/claude-code), this project includes a configuration skill at `.claude/skills/configure-mcp` that can assist with agent-assisted MCP setup. Run `/configure-mcp` inside Claude Code to get guided configuration.

### Step 3: Restart Your MCP Client

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

### Record Comments

- "Show me all comments on record rec123"
- "Add a comment to this record: 'Reviewed and approved'"
- "Update my comment to say 'Needs revision'"

### Batch Operations

- "Create 5 new records at once in the Tasks table"
- "Update multiple records with new status values"
- "Delete these 3 records in one operation"

### Webhooks

- "List all active webhooks in my base"
- "Create a webhook for changes to my Projects table"

---

## Available Tools (42)

### Core Operations (4 tools)

| Tool | Description |
|------|-------------|
| `list_bases` | List all accessible bases with permissions |
| `describe` | Describe base or table schema (supports detail levels) |
| `query` | Query records with filtering, sorting, and pagination |
| `search_records` | Advanced search with Airtable formulas |

### Record CRUD (5 tools)

| Tool | Description |
|------|-------------|
| `list_records` | List records with field selection and pagination |
| `get_record` | Retrieve a single record by ID |
| `create` | Create new records (requires dryRun diff review) |
| `update` | Update existing records (requires dryRun diff review) |
| `delete_record` | Remove a record from a table |

### Upsert (2 tools)

| Tool | Description |
|------|-------------|
| `upsert` | Update or create records based on merge fields |
| `batch_upsert_records` | Batch upsert with merge-on fields |

### Schema Discovery (4 tools)

| Tool | Description |
|------|-------------|
| `list_tables` | Get all tables in a base with schema info |
| `get_base_schema` | Get complete schema for any base |
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

### Batch Operations (3 tools)

| Tool | Description |
|------|-------------|
| `batch_create_records` | Create up to 10 records at once |
| `batch_update_records` | Update up to 10 records simultaneously |
| `batch_delete_records` | Delete up to 10 records in one operation |

### Webhook Management (5 tools)

| Tool | Description |
|------|-------------|
| `list_webhooks` | View all configured webhooks |
| `create_webhook` | Set up real-time notifications |
| `delete_webhook` | Remove webhook configurations |
| `get_webhook_payloads` | Retrieve notification history |
| `refresh_webhook` | Extend webhook expiration |

### Views & Attachments (3 tools)

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

### Record Comments (4 tools)

| Tool | Description |
|------|-------------|
| `list_comments` | List comments on a record |
| `create_comment` | Add a comment to a record |
| `update_comment` | Edit an existing comment |
| `delete_comment` | Remove a comment |

### User Info (1 tool)

| Tool | Description |
|------|-------------|
| `whoami` | Get current user identity and scopes |

### Governance & Administration (2 tools)

| Tool | Description |
|------|-------------|
| `list_governance` | Return governance allow-lists and PII masking policies |
| `list_exceptions` | List recent exceptions and remediation proposals |

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
        "@rashidazarang/airtable-mcp"
      ],
      "env": {
        "AIRTABLE_TOKEN": "YOUR_TOKEN",
        "AIRTABLE_BASE_ID": "YOUR_BASE_ID"
      }
    }
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AIRTABLE_TOKEN` | Yes | Personal Access Token |
| `AIRTABLE_BASE_ID` | No | Default base ID (discoverable via `list_bases`) |
| `LOG_LEVEL` | No | Logging level (default: `info`) |
| `MCP_HTTP_PORT` | No | Enable HTTP transport for hosted deployments |

---

## Testing

```bash
npm install
npm run build          # Compile TypeScript
npm run test:types     # Type checking
npm test               # Run test suite
```

---

## Troubleshooting

**Connection Issues**
- Verify the MCP server is running
- Restart your MCP client
- Check that your token has the required scopes

**Invalid Token**
- Verify your Personal Access Token is correct
- Confirm the token has the required scopes
- Check for extra whitespace in credentials

**Base Not Found**
- Confirm your Base ID is correct
- Verify your token has access to the base
- Use `list_bases` to discover accessible bases

---

## Project Structure

```
airtable-mcp/
├── src/typescript/          # TypeScript implementation
│   ├── app/
│   │   ├── tools/           # 42 tool implementations
│   │   ├── prompts/         # 10 AI prompt registrations
│   │   ├── airtable-client.ts
│   │   ├── governance.ts
│   │   └── context.ts
│   └── airtable-mcp-server.ts
├── dist/                    # Compiled output
├── docs/                    # Documentation
├── types/                   # TypeScript definitions
└── bin/                     # CLI executables
```

---

## Documentation

- [Changelog](docs/CHANGELOG.md)
- [Release Notes](docs/releases/)

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

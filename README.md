# Airtable MCP Server

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/rashidazarang/airtable-mcp)](https://archestra.ai/mcp-catalog/rashidazarang__airtable-mcp)
[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)
![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![MCP](https://img.shields.io/badge/MCP-5.1.0-blue)](https://github.com/rashidazarang/airtable-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![AI Agent](https://img.shields.io/badge/AI_Agent-Enhanced-purple)](https://github.com/rashidazarang/airtable-mcp)
[![Security](https://img.shields.io/badge/Security-Enterprise-green)](https://github.com/rashidazarang/airtable-mcp)
[![Protocol](https://img.shields.io/badge/Protocol-2026--07--28-success)](https://modelcontextprotocol.io/)

A Model Context Protocol (MCP) server for Airtable with full CRUD operations, schema management, record comments, webhooks, batch operations, governance controls, and AI-powered analytics.

**Version 5.1.0** | MCP Protocol 2026-07-28 (stateless core, legacy 2025-era clients still served) | Works with Claude, Codex, Cursor, Windsurf, VS Code, and any MCP client | [![npm](https://img.shields.io/npm/v/@rashidazarang/airtable-mcp)](https://www.npmjs.com/package/@rashidazarang/airtable-mcp)

---

## Quick Start (Claude Desktop)

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

> **Get your token** at [airtable.com/create/tokens](https://airtable.com/create/tokens) — grant all scopes listed under [Token Scopes](#token-scopes) below. **Get your Base ID** from the URL when viewing your base: `https://airtable.com/[BASE_ID]/...` (or omit it and use `list_bases` to discover bases dynamically).

---

## Quick Start (Claude Code)

### One-command install

```bash
curl -fsSL https://raw.githubusercontent.com/rashidazarang/airtable-mcp/main/setup.sh | bash
```

The script checks prerequisites, prompts for your Airtable token, and writes the MCP config to `~/.claude.json`. Restart Claude Code (or run `/mcp`) to connect.

You can also pass your token directly:

```bash
curl -fsSL https://raw.githubusercontent.com/rashidazarang/airtable-mcp/main/setup.sh | bash -s -- YOUR_AIRTABLE_TOKEN
```

### Manual config

Add to `~/.claude.json` under `mcpServers`:

```json
{
  "airtable": {
    "type": "stdio",
    "command": "/bin/bash",
    "args": ["-c", "cd /tmp && npx -y @rashidazarang/airtable-mcp"],
    "env": {
      "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN"
    }
  }
}
```

> **Why the bash wrapper?** `npx` can fail to resolve the binary when run from a directory that contains a `package.json` with the same package name. The `cd /tmp &&` prefix avoids this edge case.

---

## Quick Start (Codex, Cursor, Windsurf, VS Code)

The server works with any MCP client. It serves both the modern 2026-07-28 protocol and 2025-era clients automatically — no configuration needed for either.

### OpenAI Codex (CLI, IDE extension, ChatGPT desktop)

One command:

```bash
codex mcp add airtable -- npx -y @rashidazarang/airtable-mcp
```

Or edit `~/.codex/config.toml` (or `.codex/config.toml` for a trusted project) directly:

```toml
[mcp_servers.airtable]
command = "npx"
args = ["-y", "@rashidazarang/airtable-mcp"]

[mcp_servers.airtable.env]
AIRTABLE_TOKEN = "YOUR_AIRTABLE_TOKEN"
```

The Codex CLI, IDE extension, and ChatGPT desktop app share this configuration.

### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per project):

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": ["-y", "@rashidazarang/airtable-mcp"],
      "env": {
        "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN",
        "AIRTABLE_TOOLSET": "core"
      }
    }
  }
}
```

> **Why `AIRTABLE_TOOLSET=core`?** Cursor caps agents at **40 enabled tools across all servers**, and this server exposes 42. The `core` profile registers the 18 record-centric tools (reads, writes, batches, governance), leaving room for other servers. Omit it (or set `full`) if Airtable is your only MCP server and you manage the cap by disabling individual tools in Cursor's *Tools & MCP* settings. Also note: Cursor offers MCP tools in **Agent** and **Plan** modes only (not Ask/Edit), and consumes tools and resources but not MCP prompts.

### Windsurf

Add the same JSON block to `~/.codeium/windsurf/mcp_config.json` (Cascade → MCP settings). Windsurf supports per-tool toggling if you prefer the full toolset.

### VS Code (GitHub Copilot agent mode)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "airtable": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@rashidazarang/airtable-mcp"],
      "env": { "AIRTABLE_TOKEN": "YOUR_AIRTABLE_TOKEN" }
    }
  }
}
```

### Compatibility notes (any client)

- **Both protocol eras served** — modern 2026-07-28 clients and legacy 2025-era clients (Codex, Cursor, Windsurf, Cline, Zed, and most others today) negotiate automatically.
- **Tool names are client-safe** — bare snake_case, well under length limits, and free of `:` and `*` (reserved by Cursor's allowlist grammar `server:tool`).
- **Logs never touch stdout** — all logging goes to stderr, so stdio framing is never corrupted.
- **Remote/HTTP clients** — start the server with `PORT` or `MCP_HTTP_PORT` set and point the client at `http://host:port/mcp` (streamable HTTP, stateless; `/health` for orchestrators).
- **Tool caps** — use `AIRTABLE_TOOLSET=core` or an explicit allowlist (e.g. `AIRTABLE_TOOLSET=describe,query,list_records`) for clients that limit enabled tools or to slim the agent's context.

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

## Protocol Support

Built on the **MCP 2026-07-28 specification** with the v2 TypeScript SDK (`@modelcontextprotocol/server`):

- **Stateless core** — every request is served by a fresh server instance from a shared factory; no sessions, no sticky routing. In HTTP mode any request can land on any replica, so the server deploys cleanly to serverless and horizontally scaled environments.
- **Both eras served** — modern 2026-07-28 clients (per-request envelope) and legacy 2025-era clients (`initialize` handshake) are handled by the same factory: per-connection era pinning over stdio, per-request stateless fallback over HTTP.
- **Transports** — stdio (`serveStdio`) for local clients like Claude Desktop/Code, and streamable HTTP (`createMcpHandler` + Node adapter) when `PORT`/`MCP_HTTP_PORT` is set, with a `/health` endpoint for orchestrators.
- **Tasks extension** — deliberately not implemented: the 2026-07-28 spec moved Tasks out of core into the `io.modelcontextprotocol/tasks` extension, and every operation this server exposes is a sub-second Airtable API call (batches are capped at 10 records), so background-task semantics add nothing. This will be revisited if long-running tools are added.

---

## Prerequisites

- Node.js 20 or later (required by the MCP v2 SDK)
- An Airtable account with a Personal Access Token
- Your Airtable Base ID (optional — can be discovered via the `list_bases` tool)

---

## Token Scopes

Create a Personal Access Token at [airtable.com/create/tokens](https://airtable.com/create/tokens) with these scopes:

| Scope | Purpose |
|-------|---------|
| `data.records:read` | Read records |
| `data.records:write` | Create, update, delete records |
| `data.recordComments:read` | Read record comments |
| `data.recordComments:write` | Create, update, delete comments |
| `schema.bases:read` | View table schemas |
| `schema.bases:write` | Create and modify tables and fields |
| `user.email:read` | Read user identity (whoami) |
| `webhook:manage` | Manage webhooks (optional) |

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
| `AIRTABLE_TOOLSET` | No | Which tools to register: `full` (default, all 42), `core` (18 record-centric tools — fits Cursor's 40-tool cap), or a comma-separated allowlist of tool names |
| `LOG_LEVEL` | No | Logging level (default: `info`) |
| `MCP_HTTP_PORT` | No | Enable HTTP transport for hosted deployments |

---

## Development

> **Not required for users.** Clone the repo only if you want to contribute or modify the server. End users should use `npx` as shown in the Quick Start sections above.

```bash
git clone https://github.com/rashidazarang/airtable-mcp.git
cd airtable-mcp
npm install
npm run build
```

### Testing

```bash
npm run test:types     # Type checking
npm test               # Run test suite
```

### Project Structure

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

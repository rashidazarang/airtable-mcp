# Airtable MCP Server

[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)
![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![MCP](https://img.shields.io/badge/MCP-1.5.0-green)](https://github.com/rashidazarang/airtable-mcp)

A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with your Airtable bases. Query, create, update, and delete records using natural language through a secure, standardized interface.

## 🔒 Security Notice

**Important**: Version 1.5.0 adds comprehensive schema management with 23 total tools. Major upgrade with full table and field management capabilities.

## ✨ Features

- 🔍 **Natural Language Queries** - Ask questions about your data in plain English
- 📊 **Full CRUD Operations** - Create, read, update, and delete records
- 🪝 **Webhook Management** - Create and manage webhooks for real-time notifications
- 🏗️ **Advanced Schema Management** - Create tables, fields, and manage base structure
- 🔍 **Base Discovery** - Explore all accessible bases and their schemas
- 🔧 **Field Management** - Add, modify, and remove fields programmatically
- 🔐 **Secure Authentication** - Uses environment variables for credentials
- 🚀 **Easy Setup** - Multiple installation options available
- ⚡ **Fast & Reliable** - Built with Node.js for optimal performance
- 🎯 **23 Powerful Tools** - Most comprehensive Airtable API coverage available

## 📋 Prerequisites

- Node.js 14+ installed on your system
- An Airtable account with a Personal Access Token
- Your Airtable Base ID

## 🚀 Quick Start

### Step 1: Get Your Airtable Credentials

1. **Personal Access Token**: Visit [Airtable Account](https://airtable.com/account) → Create a token with the following scopes:
   - `data.records:read` - Read records from tables
   - `data.records:write` - Create, update, delete records
   - `schema.bases:read` - View table schemas
   - `schema.bases:write` - **New in v1.5.0** - Create/modify tables and fields
   - `webhook:manage` - (Optional) For webhook features

2. **Base ID**: Open your Airtable base and copy the ID from the URL:
   ```
   https://airtable.com/[BASE_ID]/...
   ```

### Step 2: Installation

Choose one of these installation methods:

#### Option A: Install via NPM (Recommended)

```bash
npm install -g @rashidazarang/airtable-mcp
```

#### Option B: Clone from GitHub

```bash
git clone https://github.com/rashidazarang/airtable-mcp.git
cd airtable-mcp
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in your project directory:

```env
AIRTABLE_TOKEN=your_personal_access_token_here
AIRTABLE_BASE_ID=your_base_id_here
```

**Security Note**: Never commit `.env` files to version control!

### Step 4: Configure Your MCP Client

#### For Claude Desktop

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": [
        "@rashidazarang/airtable-mcp",
        "--token",
        "YOUR_AIRTABLE_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

#### For Environment Variables (More Secure)

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

### Step 5: Restart Your MCP Client

After configuration, restart Claude Desktop or your MCP client to load the Airtable server.

## 🎯 Usage Examples

Once configured, you can interact with your Airtable data naturally:

### Basic Operations
```
"Show me all records in the Projects table"
"Create a new task with priority 'High' and due date tomorrow"
"Update the status of task ID rec123 to 'Completed'"
"Delete all records where status is 'Archived'"
"What tables are in my base?"
"Search for records where Status equals 'Active'"
```

### Webhook Operations (v1.4.0+)
```
"Create a webhook for my table that notifies https://my-app.com/webhook"
"List all active webhooks in my base"
"Show me the recent webhook payloads"
"Delete webhook ach123xyz"
```

### Schema Management (v1.5.0+)
```
"List all my accessible Airtable bases"
"Show me the complete schema for this base"
"Describe the Projects table with all field details"
"Create a new table called 'Tasks' with Name, Priority, and Due Date fields"
"Add a Status field to the existing Projects table"
"What field types are available in Airtable?"
```

## 🛠️ Available Tools (23 Total)

### 📊 Data Operations (7 tools)
| Tool | Description |
|------|-------------|
| `list_tables` | Get all tables in your base with schema information |
| `list_records` | Query records with optional filtering and pagination |
| `get_record` | Retrieve a single record by ID |
| `create_record` | Add new records to any table |
| `update_record` | Modify existing record fields |
| `delete_record` | Remove records from a table |
| `search_records` | Advanced search with Airtable formulas and sorting |

### 🪝 Webhook Management (5 tools)
| Tool | Description |
|------|-------------|
| `list_webhooks` | View all webhooks configured for your base |
| `create_webhook` | Set up real-time notifications for data changes |
| `delete_webhook` | Remove webhook configurations |
| `get_webhook_payloads` | Retrieve webhook notification history |
| `refresh_webhook` | Extend webhook expiration time |

### 🔍 Schema Discovery (6 tools) - **New in v1.5.0**
| Tool | Description |
|------|-------------|
| `list_bases` | List all accessible Airtable bases with permissions |
| `get_base_schema` | Get complete schema information for any base |
| `describe_table` | Get detailed table info including all field specifications |
| `list_field_types` | Reference guide for all available Airtable field types |
| `get_table_views` | List all views for a specific table with configurations |

### 🏗️ Table Management (3 tools) - **New in v1.5.0**
| Tool | Description |
|------|-------------|
| `create_table` | Create new tables with custom field definitions |
| `update_table` | Modify table names and descriptions |
| `delete_table` | Remove tables (with safety confirmation required) |

### 🔧 Field Management (3 tools) - **New in v1.5.0**
| Tool | Description |
|------|-------------|
| `create_field` | Add new fields to existing tables with all field types |
| `update_field` | Modify field properties, names, and options |
| `delete_field` | Remove fields (with safety confirmation required) |

## 🔧 Advanced Configuration

### Using with Smithery Cloud

For cloud-hosted MCP servers:

```json
{
  "mcpServers": {
    "airtable": {
      "command": "npx",
      "args": [
        "@smithery/cli",
        "run",
        "@rashidazarang/airtable-mcp",
        "--token",
        "YOUR_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

### Direct Node.js Execution

If you cloned the repository:

```json
{
  "mcpServers": {
    "airtable": {
      "command": "node",
      "args": [
        "/path/to/airtable-mcp/airtable_simple.js",
        "--token",
        "YOUR_TOKEN",
        "--base",
        "YOUR_BASE_ID"
      ]
    }
  }
}
```

## 🧪 Testing

Run the comprehensive test suite to verify all 12 tools:

```bash
# Set environment variables first
export AIRTABLE_TOKEN=your_token
export AIRTABLE_BASE_ID=your_base_id

# Start the server
node airtable_simple.js &

# Run comprehensive tests (v1.5.0+)
./test_v1.5.0_final.sh
```

The test suite validates:
- All 23 tools with real API calls
- Complete CRUD operations
- Advanced schema management
- Webhook management
- Table and field creation/modification
- Error handling and edge cases
- Security verification
- 100% test coverage

## 🐛 Troubleshooting

### "Connection Refused" Error
- Ensure the MCP server is running
- Check that port 8010 is not blocked
- Restart your MCP client

### "Invalid Token" Error
- Verify your Personal Access Token is correct
- Check that the token has the required scopes
- Ensure no extra spaces in your credentials

### "Base Not Found" Error
- Confirm your Base ID is correct
- Check that your token has access to the base

### Port Conflicts
If port 8010 is in use:
```bash
lsof -ti:8010 | xargs kill -9
```

## 📚 Documentation

- 🎆 [Release Notes v1.5.0](./RELEASE_NOTES_v1.5.0.md) - **Latest major release**
- [Release Notes v1.4.0](./RELEASE_NOTES_v1.4.0.md)
- [Detailed Setup Guide](./CLAUDE_INTEGRATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [Security Notice](./SECURITY_NOTICE.md)

## 📦 Version History

- **v1.5.0** (2025-08-15) - 🎆 **Major release**: Added comprehensive schema management (23 total tools)
- **v1.4.0** (2025-08-14) - Added webhook support and enhanced CRUD operations (12 tools)
- **v1.2.4** (2025-08-12) - Security fixes and stability improvements
- **v1.2.3** (2025-08-11) - Bug fixes and error handling
- **v1.2.2** (2025-08-10) - Initial stable release

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Built for the [Model Context Protocol](https://modelcontextprotocol.io/)
- Powered by [Airtable API](https://airtable.com/developers/web/api/introduction)
- Compatible with [Claude Desktop](https://claude.ai/) and other MCP clients

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/rashidazarang/airtable-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rashidazarang/airtable-mcp/discussions)

---

**Version**: 1.2.4 | **Status**: ✅ Production Ready | **Last Updated**: August 14, 2025
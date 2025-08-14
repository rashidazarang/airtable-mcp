# Airtable MCP Server

[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)
![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![MCP](https://img.shields.io/badge/MCP-1.2.4-green)](https://github.com/rashidazarang/airtable-mcp)

A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with your Airtable bases. Query, create, update, and delete records using natural language through a secure, standardized interface.

## 🔒 Security Notice

**Important**: Version 1.2.4 includes critical security fixes. If you used this MCP before January 2025, please see [SECURITY_NOTICE.md](./SECURITY_NOTICE.md) for important information about token rotation.

## ✨ Features

- 🔍 **Natural Language Queries** - Ask questions about your data in plain English
- 📊 **Full CRUD Operations** - Create, read, update, and delete records
- 🏗️ **Schema Management** - View and understand your base structure
- 🔐 **Secure Authentication** - Uses environment variables for credentials
- 🚀 **Easy Setup** - Multiple installation options available
- ⚡ **Fast & Reliable** - Built with Node.js for optimal performance

## 📋 Prerequisites

- Node.js 14+ installed on your system
- An Airtable account with a Personal Access Token
- Your Airtable Base ID

## 🚀 Quick Start

### Step 1: Get Your Airtable Credentials

1. **Personal Access Token**: Visit [Airtable Account](https://airtable.com/account) → Create a token with the following scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`

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

```
"Show me all records in the Projects table"
"Create a new task with priority 'High' and due date tomorrow"
"Update the status of task ID rec123 to 'Completed'"
"Delete all records where status is 'Archived'"
"What tables are in my base?"
```

## 🛠️ Available Tools

| Tool | Description |
|------|-------------|
| `list_tables` | Get all tables in your base |
| `list_records` | Query records with optional filtering |
| `create_record` | Add new records to a table |
| `update_record` | Modify existing records |
| `delete_record` | Remove records from a table |

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

Run the test suite to verify your setup:

```bash
# Set environment variables first
export AIRTABLE_TOKEN=your_token
export AIRTABLE_BASE_ID=your_base_id

# Run tests
npm test
```

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

- [Detailed Setup Guide](./CLAUDE_INTEGRATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [Security Notice](./SECURITY_NOTICE.md)
- [Release Notes](./RELEASE_NOTES_v1.2.4.md)

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
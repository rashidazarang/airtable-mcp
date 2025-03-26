# Airtable MCP

![Airtable](https://img.shields.io/badge/Airtable-18BFFF?style=for-the-badge&logo=Airtable&logoColor=white)
[![smithery badge](https://smithery.ai/badge/@rashidazarang/airtable-mcp)](https://smithery.ai/server/@rashidazarang/airtable-mcp)

> Connect your AI tools directly to Airtable. Query, create, update, and delete records using natural language. Features include base management, table operations, schema manipulation, record filtering, and data migration—all through a standardized MCP interface compatible with Claude Desktop and other Claude-powered editors.

## Quick Start

1. **Get Your Airtable Credentials**
   - Get your Airtable API token from your [account page](https://airtable.com/account)
   - Get your base ID from your Airtable base URL (format: `appi7fWMQcB3BNzPs`)

2. **Configure Claude Desktop**
   - Open `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Add the following configuration:
   ```json
   {
     "mcpServers": {
       "airtable-mcp": {
         "command": "npx",
         "args": [
           "@smithery/cli",
           "run",
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
   - Replace `YOUR_AIRTABLE_TOKEN` and `YOUR_BASE_ID` with your actual credentials
   - Save and restart Claude Desktop

3. **Start Using Airtable Tools**
   - Open Claude Desktop
   - Wait 30 seconds for the connection to establish
   - Start using Airtable commands in natural language

## Features

- **Base Management**: List and select Airtable bases
- **Table Operations**: Browse tables, fields, and records
- **Data Access**: Read, create, update, and delete records
- **Schema Management**: Export, compare, and update schemas
- **Natural Language Interface**: Use plain English to interact with your Airtable data

## Available Tools

| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `list_bases` | List all accessible Airtable bases | "Show me all my Airtable bases" |
| `list_tables` | List all tables in the current base | "What tables are in this base?" |
| `list_records` | List records with optional filtering | "Show me all records in the Projects table" |
| `get_record` | Get a specific record | "Get record ABC123 from Tasks table" |
| `create_records` | Create new records | "Create a new record in Contacts with name John" |
| `update_records` | Update existing records | "Update status to Complete in record XYZ" |
| `set_base_id` | Switch to a different base | "Switch to base appi7fWMQcB3BNzPs" |

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Make sure Node.js is installed (`node -v` should show v14 or higher)
   - Verify your API token and base ID are correct
   - Restart Claude Desktop after configuration changes

2. **JSON Parsing Errors**
   - Double-check the JSON format in your configuration file
   - Avoid using extra backslashes or escape characters
   - Use the simplified configuration format shown above

3. **Command Not Found**
   - Install Node.js if not already installed
   - Run `npm install -g npm@latest` to update npm
   - Try running `npx @smithery/cli --version` to verify the installation

### Need Help?

- Check the [Issues](https://github.com/rashidazarang/airtable-mcp/issues) page
- Join our [Discord community](https://discord.gg/your-discord)
- Email support at support@example.com

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

For detailed setup instructions with other MCP clients, see [CLAUDE_INTEGRATION.md](./CLAUDE_INTEGRATION.md).
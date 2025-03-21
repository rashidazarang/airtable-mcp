# Using Airtable MCP with Claude

This guide explains how to integrate the Airtable MCP with various Claude MCP clients.

## Compatible Claude MCP Clients

This MCP works with any client that supports Anthropic's Model Context Protocol (MCP), including:

- [Claude Desktop](https://claude.ai/desktop)
- [Cursor](https://cursor.sh/)
- [Cline](https://github.com/lpw/cline)
- [Zed](https://zed.dev/)
- Any other MCP-compatible client

## Setting Up with Claude Desktop

1. **Install the Airtable MCP**:
   ```bash
   npm install -g airtable-mcp
   ```

2. **Start the MCP server**:
   ```bash
   airtable-mcp --token "your_airtable_token" --base "your_base_id"
   ```

3. **Configure Claude Desktop**:
   - Open Claude Desktop
   - Go to Settings > Tools > Add Tool
   - For the tool URL, use: `http://localhost:8010/mcp` (default port)
   - Click "Add Tool"
   - You'll now see the Airtable tools in Claude's tool palette

## Setting Up with Cursor

1. **Edit your Cursor MCP configuration**:
   - Open or create the file: `~/.cursor/mcp.json`
   - Add the following configuration:

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

2. **Restart Cursor** to load the new tools

## Setting Up with Cline

1. **Start the MCP server**:
   ```bash
   npx airtable-mcp --token "your_airtable_token" --base "your_base_id"
   ```

2. **Run Cline with MCP support**:
   ```bash
   cline --mcp-urls http://localhost:8010/mcp
   ```

## Using the MCP in Claude

Once configured, you can use natural language to work with Airtable data. Here are some examples:

- "Can you list all the tables in our Airtable base?"
- "Get all records from the Projects table where Status is Complete"
- "Create a new record in the Contacts table with name John Smith and email john@example.com"
- "Update the Budget field for the Marketing project to $15,000"

## Troubleshooting

- **Tool not appearing**: Make sure the MCP server is running and the client is properly configured
- **Authentication errors**: Verify your Airtable token has the necessary permissions
- **Connection issues**: Confirm the MCP server is running on the expected port (default is 8010)

For more detailed troubleshooting, check the server logs where you started the Airtable MCP. 
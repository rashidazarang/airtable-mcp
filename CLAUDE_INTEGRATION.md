# Using Airtable MCP with Claude

This guide explains how to integrate the Airtable MCP with various Claude MCP clients.

## Compatible Claude MCP Clients

This MCP works with any client that supports Anthropic's Model Context Protocol (MCP), including:

- [Claude Desktop](https://claude.ai/desktop)
- [Cursor](https://cursor.sh/)
- [Cline](https://github.com/lpw/cline)
- [Zed](https://zed.dev/)
- Any other MCP-compatible client

## Recommended: Using Smithery (Easiest Method)

The recommended way to use this MCP is through Smithery, which handles all dependencies and configuration automatically:

1. **Configure your MCP client**:
   - Edit your client's MCP configuration file (e.g., `~/.cursor/mcp.json`)
   - Add the following configuration:

   ```json
   {
     "mcpServers": {
       "airtable-mcp": {
         "command": "npx",
         "args": [
           "-y",
           "@smithery/cli@latest",
           "run",
           "@rashidazarang/airtable-mcp",
           "--config",
           "{\"airtable_token\":\"YOUR_AIRTABLE_TOKEN\\\"\",\"base_id\":\"YOUR_BASE_ID\"}"
         ]
       }
     }
   }
   ```

2. **Replace tokens**:
   - Replace `YOUR_AIRTABLE_TOKEN\"` with your Airtable Personal Access Token (maintaining the backslash and quote)
   - Replace `YOUR_BASE_ID` with your Airtable base ID

3. **Restart your client** to load the new tools

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
   - Add the Smithery configuration as described in the "Recommended" section above

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

## Testing Your Setup

To confirm your MCP setup is working correctly:

1. Restart your MCP client after making configuration changes
2. Start a conversation with Claude
3. Ask a simple question like "Can you list all the tables in my Airtable base?"
4. Claude should respond with a list of tables from your Airtable base

If you see tables listed, congratulations! Your Airtable MCP is working correctly.

## Troubleshooting

- **Tool not appearing**: Make sure the MCP server is running and the client is properly configured
- **Authentication errors**: Verify your Airtable token has the necessary permissions
- **Connection issues**: Confirm the MCP server is running on the expected port (default is 8010)
- **JSON escaping issues**: Make sure the backslash characters in the configuration are preserved
- **Smithery not found**: Try installing the Smithery CLI globally with `npm install -g @smithery/cli`

For more detailed troubleshooting, check the server logs where you started the Airtable MCP. 
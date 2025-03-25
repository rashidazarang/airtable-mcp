# Claude/Windsurf Integration Guide

This guide explains how to set up the Airtable MCP for use with Claude (including Anthropic's tools and in VSCode extensions like Windsurf).

## Setup for Claude

### Requirements

- Node.js v14 or higher
- An Airtable account with Personal Access Token
- An Airtable base you want to connect to

### Configuration

Claude requires the configuration to be specified in JSON format. Here's how to set up the configuration for Claude:

1. In Claude settings, add a new MCP server with these settings:
   - Name: `airtable-mcp`
   - Command: `npx`
   - Arguments:
     ```
     -y @smithery/cli@latest run @rashidazarang/airtable-mcp --config {"airtable_token":"your_token_here","base_id":"your_base_id_here"}
     ```

2. **IMPORTANT: JSON Format**  
   Make sure the JSON in the `--config` parameter is properly formatted:
   - No line breaks
   - No extra backslashes
   - No surrounding quotes

### Troubleshooting JSON Issues

If you encounter the error `Unexpected token 'F', "Found & ig"... is not valid JSON`, try these fixes:

1. **Method 1: Simplify JSON** - Remove any complex characters from your token and try again.

2. **Method 2: Escape Properly** - Make sure you format the command with proper escaping:
   ```
   -y @smithery/cli@latest run @rashidazarang/airtable-mcp --config {\"airtable_token\":\"your_token_here\",\"base_id\":\"your_base_id_here\"}
   ```

3. **Method 3: Use Separate Parameters** - Instead of using --config, use individual parameters:
   ```
   -y @smithery/cli@latest run @rashidazarang/airtable-mcp --token your_token_here --base your_base_id_here
   ```

## Setup for Windsurf

Windsurf users should use a dedicated config file to avoid JSON parsing issues:

1. Create a file called `mcp_config.json` with:
   ```json
   {
     "mcpServers": {
       "AIRTABLE": {
         "command": "npx",
         "args": [
           "-y",
           "@smithery/cli@latest",
           "run",
           "@rashidazarang/airtable-mcp",
           "--token",
           "your_token_here",
           "--base",
           "your_base_id_here"
         ]
       }
     }
   }
   ```

2. In Windsurf settings, configure it to use this file.

## Common Issues

### AbortController Error

If you see an error like `ReferenceError: AbortController is not defined`, this is because you're using an older version of Node.js that doesn't include this feature. Options to fix:

1. **Update Node.js** (recommended) - Install Node.js v15+ which includes AbortController natively.

2. **Use Polyfill** - New versions of our MCP (1.1.0+) automatically add a polyfill for older Node versions.

### Server Disconnected or Timeout Errors

1. Check that your Airtable token is valid and has the necessary permissions
2. Ensure you have proper internet connectivity
3. Try restarting the MCP server
4. Check the logs for any specific error messages

## Using the MCP with Claude

Once connected, you can use the following tools:

- `list_bases` - Show available Airtable bases
- `list_tables` - List tables in the current base
- `list_records` - Get records from a specific table
- `create_records` - Add new records to a table
- `update_records` - Modify existing records

For example, in Claude, you might ask:
"Please list all tables in my Airtable base and then show me records from the 'Contacts' table."

## Support

If you continue to experience issues, please report them on GitHub with:
- Error messages
- Node.js version (`node -v`)
- Operating system details 
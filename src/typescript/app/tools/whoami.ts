import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

export function registerWhoamiTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'whoami',
    {
      description: 'Get the current user info (ID, email, scopes) for the configured PAT. Requires user.email:read scope for email.'
    },
    async () => {
      try {
        const result = await ctx.airtable.whoami();
        return createToolResponse({ user: result });
      } catch (error) {
        return handleToolError('whoami', error, ctx);
      }
    }
  );
}

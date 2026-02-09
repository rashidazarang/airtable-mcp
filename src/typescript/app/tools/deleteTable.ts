import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableId: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerDeleteTableTool(server: McpServer): void {
  server.registerTool(
    'delete_table',
    {
      description: 'Delete an Airtable table (informational — not supported by API).',
      inputSchema: inputSchema.shape as any
    },
    async (_raw: InputType) => {
      return createToolResponse({
        supported: false,
        message: 'The Airtable REST API does not support deleting tables. Please use the Airtable web interface to delete tables.',
        suggestion: 'Navigate to your base in the Airtable web app, right-click the table tab, and select "Delete table".'
      });
    }
  );
}

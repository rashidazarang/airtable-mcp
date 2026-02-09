import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerCreateViewTool(server: McpServer, _ctx: AppContext): void {
  server.registerTool(
    'create_view',
    {
      description: 'Create a view (informational — not supported by API).',
      inputSchema: inputSchema.shape as any
    },
    async (_raw: InputType) => {
      return createToolResponse({
        supported: false,
        message: 'The Airtable REST API does not support creating views. Please use the Airtable web interface.',
        suggestion: 'Navigate to your base in the Airtable web app and click the "+" button next to the view tabs.'
      });
    }
  );
}

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableId: z.string().min(1),
  fieldId: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerDeleteFieldTool(server: McpServer, _ctx: AppContext): void {
  server.registerTool(
    'delete_field',
    {
      description: 'Delete an Airtable field (informational — not supported by API).',
      inputSchema: inputSchema.shape as any
    },
    async (_raw: InputType) => {
      return createToolResponse({
        supported: false,
        message: 'The Airtable REST API does not support deleting fields. Please use the Airtable web interface to delete fields.',
        suggestion: 'Navigate to your table in the Airtable web app, click the field header dropdown, and select "Delete field".'
      });
    }
  );
}

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableId: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerUpdateTableTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'update_table',
    {
      description: 'Update an Airtable table name or description.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_schema');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const payload: Record<string, string> = {};
        if (args.name !== undefined) payload.name = args.name;
        if (args.description !== undefined) payload.description = args.description;

        const result = await ctx.airtable.updateTable(args.baseId, args.tableId, payload);

        return createToolResponse({ table: result });
      } catch (error) {
        return handleToolError('update_table', error, ctx);
      }
    }
  );
}

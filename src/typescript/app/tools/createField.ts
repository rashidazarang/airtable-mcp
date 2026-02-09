import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerCreateFieldTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_field',
    {
      description: 'Create a new field in an Airtable table.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_schema');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const result = await ctx.airtable.createField(args.baseId, args.tableId, {
          name: args.name,
          type: args.type,
          description: args.description,
          options: args.options
        });

        return createToolResponse({ field: result });
      } catch (error) {
        return handleToolError('create_field', error, ctx);
      }
    }
  );
}

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableId: z.string().min(1),
  fieldId: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerUpdateFieldTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'update_field',
    {
      description: 'Update an Airtable field name or description.',
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

        const result = await ctx.airtable.updateField(args.baseId, args.tableId, args.fieldId, payload);

        return createToolResponse({ field: result });
      } catch (error) {
        return handleToolError('update_field', error, ctx);
      }
    }
  );
}

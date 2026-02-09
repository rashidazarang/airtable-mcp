import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({
    name: z.string().min(1),
    type: z.string().min(1),
    description: z.string().optional(),
    options: z.record(z.string(), z.unknown()).optional()
  }).strict()).min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerCreateTableTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_table',
    {
      description: 'Create a new table in an Airtable base.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_schema');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const result = await ctx.airtable.createTable(args.baseId, {
          name: args.name,
          description: args.description,
          fields: args.fields
        });

        return createToolResponse({ table: result });
      } catch (error) {
        return handleToolError('create_table', error, ctx);
      }
    }
  );
}

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerGetBaseSchemaTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'get_base_schema',
    {
      description: 'Get the full schema for an Airtable base including all tables, fields, and views.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('describe');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const result = await ctx.airtable.listTables(args.baseId);

        return createToolResponse({
          baseId: args.baseId,
          tables: (result as any).tables
        });
      } catch (error) {
        return handleToolError('get_base_schema', error, ctx);
      }
    }
  );
}

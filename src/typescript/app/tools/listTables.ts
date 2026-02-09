import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerListTablesTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_tables',
    {
      description: 'List all tables in an Airtable base (lightweight — returns only IDs and names).',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('describe');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const result = await ctx.airtable.listTables(args.baseId);
        const tables = (result as any).tables as any[];

        return createToolResponse({
          tables: tables.map((t: any) => ({ id: t.id, name: t.name }))
        });
      } catch (error) {
        return handleToolError('list_tables', error, ctx);
      }
    }
  );
}

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableIdOrName: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerGetTableViewsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'get_table_views',
    {
      description: 'List all views for a specific Airtable table.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('describe');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const result = await ctx.airtable.listTables(args.baseId);
        const tables = (result as any).tables as any[];

        const table = tables.find(
          (t: any) => t.id === args.tableIdOrName || t.name === args.tableIdOrName
        );

        if (!table) {
          throw new Error(`Table "${args.tableIdOrName}" not found in base "${args.baseId}".`);
        }

        return createToolResponse({
          tableId: table.id,
          tableName: table.name,
          views: table.views || []
        });
      } catch (error) {
        return handleToolError('get_table_views', error, ctx);
      }
    }
  );
}

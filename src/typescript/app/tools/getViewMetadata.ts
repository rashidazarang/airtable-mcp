import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  tableIdOrName: z.string().min(1),
  viewIdOrName: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerGetViewMetadataTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'get_view_metadata',
    {
      description: 'Get metadata for a specific view in an Airtable table.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('describe');
        ctx.governance.ensureBaseAllowed(args.baseId);

        const result = await ctx.airtable.listTables(args.baseId) as any;
        const tables: any[] = Array.isArray(result?.tables) ? result.tables : [];

        const table = tables.find(
          (t: any) => t.id === args.tableIdOrName || t.name === args.tableIdOrName
        );
        if (!table) {
          throw new Error(`Table "${args.tableIdOrName}" not found in base "${args.baseId}".`);
        }

        const views: any[] = Array.isArray(table.views) ? table.views : [];
        const view = views.find(
          (v: any) => v.id === args.viewIdOrName || v.name === args.viewIdOrName
        );
        if (!view) {
          throw new Error(`View "${args.viewIdOrName}" not found in table "${table.name}".`);
        }

        return createToolResponse({
          tableId: table.id,
          tableName: table.name,
          view
        });
      } catch (error) {
        return handleToolError('get_view_metadata', error, ctx);
      }
    }
  );
}

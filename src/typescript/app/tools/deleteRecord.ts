import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const schema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordIds: z.array(z.string().min(1)).min(1).max(10)
}).strict();

type DeleteRecordInput = z.infer<typeof schema>;

export function registerDeleteRecordTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'delete_record',
    {
      description: 'Delete one or more Airtable records by ID.',
      inputSchema: schema.shape as any
    },
    async (raw: DeleteRecordInput) => {
      try {
        const args = schema.parse(raw);
        ctx.governance.ensureOperationAllowed('delete');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({
          tool: 'delete_record',
          baseId: args.baseId,
          table: args.table
        });

        const response: any = await ctx.airtable.deleteRecords(args.baseId, args.table, args.recordIds);

        const deletedIds: string[] = Array.isArray(response?.records)
          ? response.records
              .filter((r: any) => r?.deleted)
              .map((r: any) => String(r.id))
          : [];

        logger.info('Delete completed', { count: deletedIds.length });

        return createToolResponse({ deletedIds, count: deletedIds.length });
      } catch (error) {
        return handleToolError('delete_record', error, ctx);
      }
    }
  );
}

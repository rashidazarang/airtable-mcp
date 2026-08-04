import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';
import {
  DeleteGuardInput,
  buildDeletePreview,
  deleteGuardInputSchema,
  performDelete
} from './deleteGuard';

export function registerBatchDeleteRecordsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'batch_delete_records',
    {
      description:
        'Delete up to 10 Airtable records in a single batch. Use dryRun first to preview the records and their linked-record impact; pass idempotencyKey on the real delete.',
      inputSchema: deleteGuardInputSchema.shape as any
    },
    async (raw: DeleteGuardInput) => {
      try {
        const args = deleteGuardInputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('delete');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({
          tool: 'batch_delete_records',
          baseId: args.baseId,
          table: args.table
        });

        if (args.dryRun) {
          const records = await buildDeletePreview(ctx, args);
          logger.info('Batch delete dry run completed', { count: records.length });
          return createToolResponse({ dryRun: true, records, count: records.length });
        }

        const deletedIds = await performDelete(ctx, args);
        logger.info('Batch delete completed', { count: deletedIds.length });

        return createToolResponse({ dryRun: false, deletedIds, count: deletedIds.length });
      } catch (error) {
        return handleToolError('batch_delete_records', error, ctx);
      }
    }
  );
}

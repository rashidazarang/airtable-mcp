import { McpServer } from '@modelcontextprotocol/server';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';
import {
  DeleteGuardInput,
  buildDeletePreview,
  deleteGuardInputSchema,
  performDelete
} from './deleteGuard';

export function registerDeleteRecordTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'delete_record',
    {
      description:
        'Delete one or more Airtable records by ID. Use dryRun first to preview the records and their linked-record impact; pass idempotencyKey on the real delete.',
      inputSchema: deleteGuardInputSchema.shape as any
    },
    async (raw: DeleteGuardInput) => {
      try {
        const args = deleteGuardInputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('delete');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({
          tool: 'delete_record',
          baseId: args.baseId,
          table: args.table
        });

        if (args.dryRun) {
          const records = await buildDeletePreview(ctx, args);
          logger.info('Delete dry run completed', { count: records.length });
          return createToolResponse({ dryRun: true, records, count: records.length });
        }

        const deletedIds = await performDelete(ctx, args);
        logger.info('Delete completed', { count: deletedIds.length });

        return createToolResponse({ dryRun: false, deletedIds, count: deletedIds.length });
      } catch (error) {
        return handleToolError('delete_record', error, ctx);
      }
    }
  );
}

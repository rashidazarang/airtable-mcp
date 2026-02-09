import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordIds: z.array(z.string().min(1)).min(1).max(10)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerBatchDeleteRecordsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'batch_delete_records',
    {
      description: 'Delete up to 10 Airtable records in a single batch.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('delete');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        await ctx.airtable.deleteRecords(args.baseId, args.table, args.recordIds);

        return createToolResponse({
          deletedIds: args.recordIds,
          count: args.recordIds.length
        });
      } catch (error) {
        return handleToolError('batch_delete_records', error, ctx);
      }
    }
  );
}

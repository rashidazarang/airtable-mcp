import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  records: z.array(
    z.object({
      fields: z.record(z.string(), z.unknown())
    }).strict()
  ).min(1).max(10),
  typecast: z.boolean().optional().default(false),
  idempotencyKey: z.string().min(1).optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerBatchCreateRecordsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'batch_create_records',
    {
      description: 'Create up to 10 Airtable records in a single batch.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('create');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const response = await ctx.airtable.createRecords(
          args.baseId,
          args.table,
          { records: args.records, typecast: args.typecast },
          args.idempotencyKey
        ) as any;

        return createToolResponse({
          records: response.records,
          created: response.records.length
        });
      } catch (error) {
        return handleToolError('batch_create_records', error, ctx);
      }
    }
  );
}

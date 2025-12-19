import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AppContext } from '../context';
import {
  UpsertInput,
  UpsertOutput,
  upsertInputSchema,
  upsertOutputSchema
} from '../types';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function registerUpsertTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'upsert',
    {
      description: 'Upsert Airtable records using performUpsert.fieldsToMergeOn.',
      inputSchema: upsertInputSchema.shape as any,
      outputSchema: upsertOutputSchema.shape as any
    },
    async (raw: UpsertInput) => {
      try {
        const args = upsertInputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('upsert');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({ tool: 'upsert', baseId: args.baseId, table: args.table });
        const matchedBy = args.performUpsert.fieldsToMergeOn;

        if (args.dryRun) {
          const structuredContent: UpsertOutput = {
            diff: { added: args.records.length, updated: 0, unchanged: 0, conflicts: 0 },
            dryRun: true,
            records: args.records.map((r) => ({ id: 'pending', fields: r.fields })),
            conflicts: []
          } as any;
          // Note: Upsert output in PRD expects 'matchedBy' array and no conflicts property; keep consistent with docs
          // When using strict PRD output, we can omit conflicts and include matchedBy
          (structuredContent as any).matchedBy = matchedBy;
          delete (structuredContent as any).conflicts;
          return createToolResponse(structuredContent);
        }

        const chunks = chunk(args.records, 10);
        const aggregated: any[] = [];

        for (let i = 0; i < chunks.length; i++) {
          const body = {
            records: chunks[i],
            typecast: args.typecast ?? false,
            performUpsert: { fieldsToMergeOn: matchedBy }
          };
          const headerKey = args.idempotencyKey ? `${args.idempotencyKey}:${i}` : undefined;
          const response: any = await ctx.airtable.upsertRecords(args.baseId, args.table, body, headerKey);
          if (Array.isArray(response?.records)) aggregated.push(...response.records);
        }

        const structuredContent: any = {
          diff: { added: 0, updated: aggregated.length, unchanged: 0 },
          matchedBy,
          records: aggregated.map((r) => ({ id: String(r.id), fields: r.fields || {} })),
          dryRun: false
        };

        logger.info('Upsert completed', { processed: aggregated.length, matchedBy });
        return createToolResponse(structuredContent);
      } catch (error) {
        return handleToolError('upsert', error, ctx);
      }
    }
  );
}


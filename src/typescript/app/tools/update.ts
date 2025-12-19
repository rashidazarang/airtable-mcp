import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AppContext } from '../context';
import {
  UpdateInput,
  UpdateOutput,
  updateInputSchema,
  updateOutputSchema
} from '../types';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function registerUpdateTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'update',
    {
      description: 'Update Airtable records (requires diff-before-write via dryRun first).',
      inputSchema: updateInputSchema.shape,
      outputSchema: updateOutputSchema.shape
    },
    async (raw: UpdateInput) => {
      try {
        const args = updateInputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('update');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({ tool: 'update', baseId: args.baseId, table: args.table });

        if (args.dryRun) {
          const structuredContent: UpdateOutput = {
            diff: { added: 0, updated: args.records.length, unchanged: 0, conflicts: 0 },
            dryRun: true,
            records: args.records.map((r) => ({ id: r.id, fields: r.fields })),
            conflicts: []
          };
          return createToolResponse(structuredContent);
        }

        const chunks = chunk(args.records, 10);
        const aggregated: any[] = [];

        for (let i = 0; i < chunks.length; i++) {
          const body = { records: chunks[i], typecast: args.typecast ?? false };
          const headerKey = args.idempotencyKey ? `${args.idempotencyKey}:${i}` : undefined;
          const response: any = await ctx.airtable.updateRecords(args.baseId, args.table, body, headerKey);
          if (Array.isArray(response?.records)) aggregated.push(...response.records);
        }

        const structuredContent: UpdateOutput = {
          diff: { added: 0, updated: aggregated.length, unchanged: 0, conflicts: 0 },
          records: aggregated.map((r) => ({ id: String(r.id), fields: r.fields || {} })),
          dryRun: false,
          conflicts: []
        };

        logger.info('Update completed', { updated: aggregated.length });
        return createToolResponse(structuredContent);
      } catch (error) {
        return handleToolError('update', error, ctx);
      }
    }
  );
}


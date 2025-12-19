import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import {
  CreateInput,
  CreateOutput,
  createInputSchema,
  createOutputSchema
} from '../types';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function registerCreateTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create',
    {
      description: 'Create Airtable records (requires diff-before-write via dryRun first).',
      inputSchema: createInputSchema.shape as any,
      outputSchema: createOutputSchema.shape as any
    },
    async (raw: CreateInput) => {
      try {
        const args = createInputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('create');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({ tool: 'create', baseId: args.baseId, table: args.table });

        if (args.dryRun) {
          const structuredContent: CreateOutput = {
            diff: { added: args.records.length, updated: 0, unchanged: 0 },
            dryRun: true,
            records: args.records.map((r) => ({ id: 'pending', fields: r.fields }))
          };
          return createToolResponse(structuredContent);
        }

        const chunks = chunk(args.records, 10);
        const aggregated: any[] = [];

        for (let i = 0; i < chunks.length; i++) {
          const body = { records: chunks[i], typecast: args.typecast ?? false };
          const headerKey = args.idempotencyKey ? `${args.idempotencyKey}:${i}` : undefined;
          const response: any = await ctx.airtable.createRecords(args.baseId, args.table, body, headerKey);
          if (Array.isArray(response?.records)) aggregated.push(...response.records);
        }

        const structuredContent: CreateOutput = {
          diff: { added: aggregated.length, updated: 0, unchanged: 0 },
          records: aggregated.map((r) => ({ id: String(r.id), fields: r.fields || {} })),
          dryRun: false
        };

        logger.info('Create completed', { added: aggregated.length });
        return createToolResponse(structuredContent);
      } catch (error) {
        return handleToolError('create', error, ctx);
      }
    }
  );
}


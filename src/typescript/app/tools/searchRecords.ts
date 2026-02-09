import { createHash } from 'node:crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';
import { buildSafeFindFormula } from '../sanitize';

type PiiPolicy = {
  field: string;
  policy: 'mask' | 'hash' | 'drop';
};

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isSafeKey(key: string): boolean {
  return typeof key === 'string' && !UNSAFE_KEYS.has(key);
}

function maskValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(() => '••••');
  }
  if (typeof value === 'object') {
    return '[redacted]';
  }
  return '••••';
}

function hashValue(value: unknown): string {
  const serialized =
    typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return createHash('sha256').update(serialized).digest('hex');
}

function applyPiiPolicies(
  fields: Record<string, unknown>,
  policies: PiiPolicy[]
): Record<string, unknown> {
  if (!policies.length) {
    return fields;
  }
  const result: Record<string, unknown> = { ...fields };
  for (const policy of policies) {
    if (!isSafeKey(policy.field)) continue;
    if (!(policy.field in result)) continue;
    switch (policy.policy) {
      case 'drop':
        delete result[policy.field];
        break;
      case 'mask':
        result[policy.field] = maskValue(result[policy.field]);
        break;
      case 'hash':
        result[policy.field] = hashValue(result[policy.field]);
        break;
      default:
        break;
    }
  }
  return result;
}

const schema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  searchTerm: z.string().min(1),
  fieldName: z.string().min(1),
  maxRecords: z.number().int().min(1).max(100).optional().default(100)
}).strict();

type SearchRecordsInput = z.infer<typeof schema>;

export function registerSearchRecordsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'search_records',
    {
      description: 'Search Airtable records using text search across a field.',
      inputSchema: schema.shape as any
    },
    async (raw: SearchRecordsInput) => {
      try {
        const args = schema.parse(raw);
        ctx.governance.ensureOperationAllowed('query');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({
          tool: 'search_records',
          baseId: args.baseId,
          table: args.table
        });

        const formula = buildSafeFindFormula(args.searchTerm, args.fieldName);

        const queryParams: Record<string, string | number | boolean> = {
          filterByFormula: formula,
          maxRecords: args.maxRecords
        };

        const response: any = await ctx.airtable.queryRecords(args.baseId, args.table, queryParams);
        const rawRecords: Array<Record<string, unknown>> = Array.isArray(response?.records)
          ? response.records
          : [];

        const piiPolicies = ctx.governance.listPiiPolicies(args.baseId, args.table) as PiiPolicy[];

        const sanitizedRecords = rawRecords.map((record) => {
          const fields = typeof record.fields === 'object' && record.fields !== null ? record.fields : {};
          return {
            id: String(record.id ?? ''),
            createdTime: record.createdTime ? String(record.createdTime) : undefined,
            fields: applyPiiPolicies(fields as Record<string, unknown>, piiPolicies)
          };
        });

        logger.debug('Search completed', { returned: sanitizedRecords.length });

        return createToolResponse({ records: sanitizedRecords, total: sanitizedRecords.length });
      } catch (error) {
        return handleToolError('search_records', error, ctx);
      }
    }
  );
}

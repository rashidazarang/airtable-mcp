import { createHash } from 'node:crypto';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

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
  recordId: z.string().min(1),
  returnFieldsByFieldId: z.boolean().optional().default(false)
}).strict();

type GetRecordInput = z.infer<typeof schema>;

export function registerGetRecordTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'get_record',
    {
      description: 'Get a single Airtable record by ID.',
      inputSchema: schema.shape as any
    },
    async (raw: GetRecordInput) => {
      try {
        const args = schema.parse(raw);
        ctx.governance.ensureOperationAllowed('query');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const logger = ctx.logger.child({
          tool: 'get_record',
          baseId: args.baseId,
          table: args.table,
          recordId: args.recordId
        });

        const response: any = await ctx.airtable.getRecord(args.baseId, args.table, args.recordId);

        const piiPolicies = ctx.governance.listPiiPolicies(args.baseId, args.table) as PiiPolicy[];

        const fields = typeof response?.fields === 'object' && response.fields !== null
          ? response.fields
          : {};

        const record = {
          id: String(response?.id ?? ''),
          createdTime: response?.createdTime ? String(response.createdTime) : undefined,
          fields: applyPiiPolicies(fields as Record<string, unknown>, piiPolicies)
        };

        logger.debug('Get record completed', { recordId: record.id });

        return createToolResponse({ record });
      } catch (error) {
        return handleToolError('get_record', error, ctx);
      }
    }
  );
}

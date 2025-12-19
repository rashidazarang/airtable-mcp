import { createHash } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
  QueryInput,
  QueryOutput,
  queryInputSchema,
  queryInputShape,
  queryOutputSchema
} from '../types';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

type PiiPolicy = {
  field: string;
  policy: 'mask' | 'hash' | 'drop';
};

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

export function registerQueryTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'query',
    {
      description: 'Query Airtable records with filtering, sorting, and pagination.',
      inputSchema: queryInputShape as any,
      outputSchema: queryOutputSchema.shape as any
    },
    async (args: QueryInput, _extra: unknown) => {
      try {
        const input = queryInputSchema.parse(args);
        ctx.governance.ensureOperationAllowed('query');
        ctx.governance.ensureBaseAllowed(input.baseId);
        ctx.governance.ensureTableAllowed(input.baseId, input.table);

        const logger = ctx.logger.child({
          tool: 'query',
          baseId: input.baseId,
          table: input.table
        });

        const queryParams: Record<string, string | number | boolean | Array<string>> = {};

        if (input.fields) {
          queryParams.fields = input.fields;
        }
        if (input.filterByFormula) {
          queryParams.filterByFormula = input.filterByFormula;
        }
        if (input.view) {
          queryParams.view = input.view;
        }
        if (input.pageSize) {
          queryParams.pageSize = input.pageSize;
        }
        if (input.maxRecords) {
          queryParams.maxRecords = input.maxRecords;
        }
        if (input.offset) {
          queryParams.offset = input.offset;
        }
        if (typeof input.returnFieldsByFieldId === 'boolean') {
          queryParams.returnFieldsByFieldId = input.returnFieldsByFieldId;
        }

        if (input.sorts) {
          input.sorts.forEach((sort, index) => {
            queryParams[`sort[${index}][field]`] = sort.field;
            queryParams[`sort[${index}][direction]`] = sort.direction ?? 'asc';
          });
        }

        const response: any = await ctx.airtable.queryRecords(input.baseId, input.table, queryParams);
        const rawRecords: Array<Record<string, unknown>> = Array.isArray(response?.records)
          ? response.records
          : [];

        const piiPolicies = ctx.governance.listPiiPolicies(input.baseId, input.table) as PiiPolicy[];

        const sanitizedRecords = rawRecords.map((record) => {
          const fields = typeof record.fields === 'object' && record.fields !== null ? record.fields : {};
          return {
            id: String(record.id ?? ''),
            createdTime: record.createdTime ? String(record.createdTime) : undefined,
            fields: applyPiiPolicies(fields as Record<string, unknown>, piiPolicies)
          };
        });

        const structuredContent: QueryOutput = {
          records: sanitizedRecords,
          offset: typeof response?.offset === 'string' ? response.offset : undefined,
          summary: {
            returned: sanitizedRecords.length,
            hasMore: Boolean(response?.offset)
          }
        };

        logger.debug('Query completed', {
          returned: sanitizedRecords.length,
          hasMore: structuredContent.summary?.hasMore
        });

        return createToolResponse(structuredContent);
      } catch (error) {
        return handleToolError('query', error, ctx);
      }
    }
  );
}

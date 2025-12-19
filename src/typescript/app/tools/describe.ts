import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
  DescribeInput,
  DescribeOutput,
  describeInputSchema,
  describeInputShape,
  describeOutputSchema
} from '../types';
import { AppContext } from '../context';
import { GovernanceError, NotFoundError } from '../../errors';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

type DescribeTableEntry = NonNullable<DescribeOutput['tables']>[number];
type DescribeFieldEntry = NonNullable<DescribeTableEntry['fields']>[number];
type DescribeViewEntry = NonNullable<DescribeTableEntry['views']>[number];

function normalizeField(raw: unknown): DescribeFieldEntry {
  const source = raw as Record<string, unknown>;
  const field: DescribeFieldEntry = {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? ''),
    type: String(source?.type ?? '')
  };
  if (source?.description && typeof source.description === 'string') {
    field.description = source.description;
  }
  if (source?.options && typeof source.options === 'object') {
    field.options = source.options as Record<string, unknown>;
  }
  return field;
}

function normalizeView(raw: unknown): DescribeViewEntry {
  const source = raw as Record<string, unknown>;
  const view: DescribeViewEntry = {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? '')
  };
  if (source?.type && typeof source.type === 'string') {
    view.type = source.type;
  }
  return view;
}

function normalizeTable(
  raw: unknown,
  { includeFields, includeViews }: { includeFields: boolean; includeViews: boolean }
): DescribeTableEntry {
  const source = raw as Record<string, unknown>;
  const table: DescribeTableEntry = {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? '')
  };
  if (source?.primaryFieldId && typeof source.primaryFieldId === 'string') {
    table.primaryFieldId = source.primaryFieldId;
  }
  if (includeFields && Array.isArray(source?.fields)) {
    table.fields = (source.fields as unknown[]).map((field) => normalizeField(field));
  }
  if (includeViews && Array.isArray(source?.views)) {
    table.views = (source.views as unknown[]).map((view) => normalizeView(view));
  }
  return table;
}

export function registerDescribeTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'describe',
    {
      description: 'Describe Airtable base or table schema.',
      inputSchema: describeInputShape,
      outputSchema: describeOutputSchema.shape
    },
    async (args: DescribeInput, _extra: unknown) => {
      try {
        const input = describeInputSchema.parse(args);
        ctx.governance.ensureOperationAllowed('describe');
        ctx.governance.ensureBaseAllowed(input.baseId);

        const includeFields = input.includeFields ?? true;
        const includeViews = input.includeViews ?? false;

        const logger = ctx.logger.child({
          tool: 'describe',
          baseId: input.baseId,
          scope: input.scope
        });

        const [baseInfo, tableInfo] = await Promise.all([
          ctx.airtable.getBase(input.baseId),
          ctx.airtable.listTables(input.baseId)
        ]);

        const baseName =
          typeof (baseInfo as any)?.name === 'string'
            ? String((baseInfo as any).name)
            : input.baseId;

        const rawTables: unknown[] = Array.isArray((tableInfo as any)?.tables)
          ? ((tableInfo as any).tables as unknown[])
          : [];

        const tables: DescribeTableEntry[] = rawTables
          .filter((rawTable: unknown) => {
            const record = rawTable as Record<string, unknown>;
            const tableId = typeof record.id === 'string' ? record.id : '';
            const tableName = typeof record.name === 'string' ? record.name : '';
            const idAllowed = tableId
              ? ctx.governance.isTableAllowed(input.baseId, tableId)
              : false;
            const nameAllowed = tableName
              ? ctx.governance.isTableAllowed(input.baseId, tableName)
              : false;
            return idAllowed || nameAllowed;
          })
          .map((table: unknown) => normalizeTable(table, { includeFields, includeViews }));

        let selectedTables: DescribeTableEntry[] = tables;

        if (input.scope === 'table') {
          const target = tables.find(
            (tableRecord) =>
              String(tableRecord.id) === input.table ||
              String(tableRecord.name).toLowerCase() === input.table?.toLowerCase()
          );
          if (!target) {
            const context: Record<string, string> = { baseId: input.baseId };
            if (input.table) {
              context.table = input.table;
            }
            throw new NotFoundError(`Table ${input.table} not found in base ${input.baseId}`, {
              context
            });
          }
          const targetId = String(target.id);
          const targetName = String(target.name);
          if (
            !ctx.governance.isTableAllowed(input.baseId, targetId) &&
            !ctx.governance.isTableAllowed(input.baseId, targetName)
          ) {
            const context: Record<string, string> = { baseId: input.baseId };
            if (input.table) {
              context.table = input.table;
            }
            throw new GovernanceError(`Table ${input.table} is not allowed in base ${input.baseId}`, {
              context
            });
          }
          selectedTables = [target];
        }

        const structuredContent: DescribeOutput = {
          base: {
            id: input.baseId,
            name: baseName
          },
          tables: selectedTables
        };

        if (input.scope === 'base' && includeViews) {
          structuredContent.views = rawTables
            .flatMap((table: unknown) => {
              const record = table as Record<string, unknown>;
              return Array.isArray(record.views) ? (record.views as unknown[]) : [];
            })
            .map((view: unknown) => normalizeView(view));
        }

        logger.debug('Describe completed', {
          tableCount: selectedTables.length
        });

        return createToolResponse(structuredContent);
      } catch (error) {
        return handleToolError('describe', error, ctx);
      }
    }
  );
}

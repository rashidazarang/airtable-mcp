import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  DescribeInput,
  DescribeOutput,
  describeInputSchema,
  describeInputShape,
  describeOutputSchema,
  DetailLevel
} from '../types';
import { AppContext } from '../context';
import { GovernanceError, NotFoundError } from '../../errors';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

type DescribeTableEntry = NonNullable<DescribeOutput['tables']>[number];
type DescribeFieldEntry = NonNullable<DescribeTableEntry['fields']>[number];
type DescribeViewEntry = NonNullable<DescribeTableEntry['views']>[number];

interface NormalizeOptions {
  detailLevel: DetailLevel;
  includeFields: boolean;
  includeViews: boolean;
}

/**
 * Normalize field based on detail level:
 * - identifiersOnly: only id and name
 * - full: all details including type, description, options
 */
function normalizeField(raw: unknown, detailLevel: DetailLevel): DescribeFieldEntry {
  const source = raw as Record<string, unknown>;
  const field: DescribeFieldEntry = {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? ''),
    type: detailLevel === 'full' ? String(source?.type ?? '') : ''
  };

  // Only include full details in 'full' mode
  if (detailLevel === 'full') {
    if (source?.description && typeof source.description === 'string') {
      field.description = source.description;
    }
    if (source?.options && typeof source.options === 'object') {
      field.options = source.options as Record<string, unknown>;
    }
  }

  // Remove empty type for identifiersOnly
  if (detailLevel === 'identifiersOnly') {
    delete (field as Record<string, unknown>).type;
  }

  return field;
}

/**
 * Normalize view based on detail level:
 * - identifiersOnly: only id and name
 * - full: includes type
 */
function normalizeView(raw: unknown, detailLevel: DetailLevel): DescribeViewEntry {
  const source = raw as Record<string, unknown>;
  const view: DescribeViewEntry = {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? '')
  };

  if (detailLevel === 'full' && source?.type && typeof source.type === 'string') {
    view.type = source.type;
  }

  return view;
}

/**
 * Normalize table based on detail level:
 * - tableIdentifiersOnly: only id and name
 * - identifiersOnly: id, name, and field/view identifiers
 * - full: complete details
 */
function normalizeTable(raw: unknown, options: NormalizeOptions): DescribeTableEntry {
  const { detailLevel, includeFields, includeViews } = options;
  const source = raw as Record<string, unknown>;

  const table: DescribeTableEntry = {
    id: String(source?.id ?? ''),
    name: String(source?.name ?? '')
  };

  // tableIdentifiersOnly: stop here
  if (detailLevel === 'tableIdentifiersOnly') {
    return table;
  }

  // identifiersOnly and full: include primaryFieldId
  if (source?.primaryFieldId && typeof source.primaryFieldId === 'string') {
    table.primaryFieldId = source.primaryFieldId;
  }

  // Include fields based on settings
  if (includeFields && Array.isArray(source?.fields)) {
    table.fields = (source.fields as unknown[]).map((field) =>
      normalizeField(field, detailLevel)
    );
  }

  // Include views based on settings
  if (includeViews && Array.isArray(source?.views)) {
    table.views = (source.views as unknown[]).map((view) =>
      normalizeView(view, detailLevel)
    );
  }

  return table;
}

export function registerDescribeTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'describe',
    {
      description: `Describe Airtable base or table schema.

Use detailLevel to optimize context usage:
- tableIdentifiersOnly: Only table IDs and names (minimal)
- identifiersOnly: Table, field, and view IDs and names
- full: Complete details including field types and options (default)`,
      inputSchema: describeInputShape as any,
      outputSchema: describeOutputSchema.shape as any
    },
    async (args: DescribeInput, _extra: unknown) => {
      try {
        const input = describeInputSchema.parse(args);
        ctx.governance.ensureOperationAllowed('describe');
        ctx.governance.ensureBaseAllowed(input.baseId);

        // Determine detail level and field/view inclusion
        const detailLevel: DetailLevel = input.detailLevel ?? 'full';

        // For backward compatibility, respect includeFields/includeViews
        // but detailLevel takes precedence for tableIdentifiersOnly
        const includeFields = detailLevel !== 'tableIdentifiersOnly' && (input.includeFields ?? true);
        const includeViews = detailLevel !== 'tableIdentifiersOnly' && (input.includeViews ?? false);

        const normalizeOptions: NormalizeOptions = {
          detailLevel,
          includeFields,
          includeViews
        };

        const logger = ctx.logger.child({
          tool: 'describe',
          baseId: input.baseId,
          scope: input.scope,
          detailLevel
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
          .map((table: unknown) => normalizeTable(table, normalizeOptions));

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
            .map((view: unknown) => normalizeView(view, detailLevel));
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

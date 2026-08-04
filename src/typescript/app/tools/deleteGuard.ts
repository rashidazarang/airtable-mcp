import { z } from 'zod';
import { AppContext } from '../context';

/**
 * Shared guard logic for the delete tools (delete_record, batch_delete_records).
 *
 * Deletion is the one irreversible operation, so it gets the same shape as the
 * sibling write tools: `dryRun` previews exactly what would be destroyed —
 * including linked-record impact — and `idempotencyKey` makes the real delete
 * safe to retry.
 */

export const deleteGuardInputSchema = z
  .object({
    baseId: z.string().min(1),
    table: z.string().min(1),
    recordIds: z.array(z.string().min(1)).min(1).max(10),
    dryRun: z.boolean().optional().default(false),
    idempotencyKey: z.string().min(1).optional()
  })
  .strict();

export type DeleteGuardInput = z.infer<typeof deleteGuardInputSchema>;

export interface LinkedRecordImpact {
  field: string;
  fieldId?: string;
  linkedTableId?: string;
  linkedRecordIds: string[];
}

export interface DeletePreviewEntry {
  id: string;
  fields: Record<string, unknown>;
  linkedRecordImpact: LinkedRecordImpact[];
}

interface LinkFieldMeta {
  id?: string;
  name: string;
  linkedTableId?: string;
}

/**
 * Find the schema entry for `table` (by id or name, case-insensitive on name)
 * and return its multipleRecordLinks fields.
 */
function collectLinkFields(tableInfo: unknown, table: string): LinkFieldMeta[] {
  const tables = Array.isArray((tableInfo as any)?.tables)
    ? ((tableInfo as any).tables as Array<Record<string, unknown>>)
    : [];

  const match = tables.find(
    (entry) =>
      String(entry?.id ?? '') === table ||
      String(entry?.name ?? '').toLowerCase() === table.toLowerCase()
  );

  if (!match || !Array.isArray(match.fields)) {
    return [];
  }

  return (match.fields as Array<Record<string, unknown>>)
    .filter((field) => field?.type === 'multipleRecordLinks')
    .map((field) => {
      const options = (field?.options ?? {}) as Record<string, unknown>;
      const meta: LinkFieldMeta = {
        name: String(field?.name ?? '')
      };
      if (typeof field?.id === 'string') {
        meta.id = field.id;
      }
      if (typeof options.linkedTableId === 'string') {
        meta.linkedTableId = options.linkedTableId;
      }
      return meta;
    });
}

function linkImpactForRecord(
  fields: Record<string, unknown>,
  linkFields: LinkFieldMeta[]
): LinkedRecordImpact[] {
  const impact: LinkedRecordImpact[] = [];

  for (const linkField of linkFields) {
    const value = fields[linkField.name];
    if (!Array.isArray(value) || value.length === 0) {
      continue;
    }
    const linkedRecordIds = value
      .map((entry) => (typeof entry === 'string' ? entry : String((entry as any)?.id ?? '')))
      .filter((id) => id.length > 0);
    if (linkedRecordIds.length === 0) {
      continue;
    }
    const entry: LinkedRecordImpact = {
      field: linkField.name,
      linkedRecordIds
    };
    if (linkField.id) {
      entry.fieldId = linkField.id;
    }
    if (linkField.linkedTableId) {
      entry.linkedTableId = linkField.linkedTableId;
    }
    impact.push(entry);
  }

  return impact;
}

/**
 * Build the dry-run preview: each target record's current fields plus which
 * link fields are populated (and therefore which records on the other side
 * will be silently mutated by the delete).
 */
export async function buildDeletePreview(
  ctx: AppContext,
  args: DeleteGuardInput
): Promise<DeletePreviewEntry[]> {
  const [tableInfo, ...records] = await Promise.all([
    ctx.airtable.listTables(args.baseId),
    ...args.recordIds.map((recordId) =>
      ctx.airtable.getRecord(args.baseId, args.table, recordId)
    )
  ]);

  const linkFields = collectLinkFields(tableInfo, args.table);

  return records.map((record, index) => {
    const source = record as Record<string, unknown>;
    const fields =
      source?.fields && typeof source.fields === 'object'
        ? (source.fields as Record<string, unknown>)
        : {};
    return {
      id: typeof source?.id === 'string' ? source.id : args.recordIds[index]!,
      fields,
      linkedRecordImpact: linkImpactForRecord(fields, linkFields)
    };
  });
}

/**
 * Perform the actual deletion and report the ids Airtable confirmed deleted.
 */
export async function performDelete(
  ctx: AppContext,
  args: DeleteGuardInput
): Promise<string[]> {
  const response: any = await ctx.airtable.deleteRecords(
    args.baseId,
    args.table,
    args.recordIds,
    args.idempotencyKey
  );

  return Array.isArray(response?.records)
    ? response.records.filter((r: any) => r?.deleted).map((r: any) => String(r.id))
    : [];
}

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
export declare const deleteGuardInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    recordIds: z.ZodArray<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
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
/**
 * Build the dry-run preview: each target record's current fields plus which
 * link fields are populated (and therefore which records on the other side
 * will be silently mutated by the delete).
 */
export declare function buildDeletePreview(ctx: AppContext, args: DeleteGuardInput): Promise<DeletePreviewEntry[]>;
/**
 * Perform the actual deletion and report the ids Airtable confirmed deleted.
 */
export declare function performDelete(ctx: AppContext, args: DeleteGuardInput): Promise<string[]>;

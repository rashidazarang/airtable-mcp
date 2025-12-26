import { z } from 'zod';

/**
 * Shared Zod schemas and TypeScript types for Airtable Brain tools.
 * Keep these aligned with the JSON Schemas under docs/prd/schemas.
 */

/**
 * Detail level for schema operations to optimize LLM context usage.
 * - tableIdentifiersOnly: Only table IDs and names
 * - identifiersOnly: Table, field, and view IDs and names
 * - full: Complete details including field types, options, descriptions
 */
export const detailLevelSchema = z.enum(['tableIdentifiersOnly', 'identifiersOnly', 'full']);
export type DetailLevel = z.infer<typeof detailLevelSchema>;

const describeInputBase = z
  .object({
    scope: z.enum(['base', 'table']),
    baseId: z.string().min(1, 'baseId is required'),
    table: z
      .string()
      .min(1, 'table is required when scope=table')
      .optional(),
    detailLevel: detailLevelSchema.optional().default('full'),
    // Deprecated: use detailLevel instead
    includeFields: z.boolean().optional().default(true),
    includeViews: z.boolean().optional().default(false)
  })
  .strict();

export const describeInputSchema = describeInputBase.superRefine((data, ctx) => {
    if (data.scope === 'table' && !data.table) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['table'],
        message: 'table is required when scope is "table"'
      });
    }
  });

export const describeInputShape = describeInputBase.shape;

const describeFieldSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    options: z.record(z.string(), z.unknown()).optional()
  })
  .passthrough();

const describeTableSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    primaryFieldId: z.string().optional(),
    fields: z.array(describeFieldSchema).optional(),
    views: z.array(z.record(z.string(), z.unknown())).optional()
  })
  .passthrough();

export const describeOutputSchema = z
  .object({
    base: z
      .object({
        id: z.string(),
        name: z.string()
      })
      .passthrough(),
    tables: z.array(describeTableSchema).optional(),
    views: z.array(z.record(z.string(), z.unknown())).optional()
  })
  .strict();

const sortDirectionSchema = z.enum(['asc', 'desc']);

const queryInputBase = z
  .object({
    baseId: z.string().min(1, 'baseId is required'),
    table: z.string().min(1, 'table is required'),
    fields: z.array(z.string().min(1)).optional(),
    filterByFormula: z.string().optional(),
    view: z.string().optional(),
    sorts: z
      .array(
        z
          .object({
            field: z.string().min(1),
            direction: sortDirectionSchema.optional().default('asc')
          })
          .strict()
      )
      .optional(),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional(),
    maxRecords: z
      .number()
      .int()
      .min(1)
      .optional(),
    offset: z.string().optional(),
    returnFieldsByFieldId: z.boolean().optional().default(false)
  })
  .strict();

export const queryInputSchema = queryInputBase;
export const queryInputShape = queryInputBase.shape;

const recordSchema = z
  .object({
    id: z.string(),
    createdTime: z.string().optional(),
    fields: z.record(z.string(), z.unknown())
  })
  .strict();

export const queryOutputSchema = z
  .object({
    records: z.array(recordSchema),
    offset: z.string().optional(),
    summary: z
      .object({
        returned: z.number().int().nonnegative(),
        hasMore: z.boolean()
      })
      .strict()
      .optional()
  })
  .strict();

export const createInputSchema = z
  .object({
    baseId: z.string().min(1),
    table: z.string().min(1),
    records: z
      .array(
        z
          .object({
            fields: z.record(z.string(), z.unknown())
          })
          .strict()
      )
      .min(1),
    typecast: z.boolean().optional().default(false),
    idempotencyKey: z.string().min(1).optional(),
    dryRun: z.boolean().optional().default(false)
  })
  .strict();

const createDiffSchema = z
  .object({
    added: z.number().int().nonnegative(),
    updated: z.number().int().nonnegative(),
    unchanged: z.number().int().nonnegative()
  })
  .strict();

export const createOutputSchema = z
  .object({
    diff: createDiffSchema,
    records: z.array(recordSchema).optional(),
    dryRun: z.boolean(),
    warnings: z.array(z.string()).optional()
  })
  .strict();

const conflictSchema = z
  .object({
    id: z.string(),
    field: z.string(),
    before: z.unknown().optional(),
    after: z.unknown().optional(),
    current: z.unknown()
  })
  .strict();

const mutationDiffSchema = z
  .object({
    added: z.number().int().nonnegative(),
    updated: z.number().int().nonnegative(),
    unchanged: z.number().int().nonnegative(),
    conflicts: z.number().int().nonnegative()
  })
  .strict();

export const updateOutputSchema = z
  .object({
    diff: mutationDiffSchema,
    records: z.array(recordSchema).optional(),
    dryRun: z.boolean(),
    conflicts: z.array(conflictSchema).optional()
  })
  .strict();

export const updateInputSchema = z
  .object({
    baseId: z.string().min(1),
    table: z.string().min(1),
    records: z
      .array(
        z
          .object({
            id: z.string(),
            fields: z.record(z.string(), z.unknown())
          })
          .strict()
      )
      .min(1),
    typecast: z.boolean().optional().default(false),
    idempotencyKey: z.string().min(1).optional(),
    dryRun: z.boolean().optional().default(false),
    conflictStrategy: z
      .enum(['fail_on_conflict', 'server_merge', 'client_merge'])
      .optional()
      .default('fail_on_conflict'),
    ifUnchangedHash: z.string().optional()
  })
  .strict();

export const upsertInputSchema = z
  .object({
    baseId: z.string().min(1),
    table: z.string().min(1),
    records: z
      .array(
        z
          .object({
            fields: z.record(z.string(), z.unknown())
          })
          .strict()
      )
      .min(1),
    performUpsert: z
      .object({
        fieldsToMergeOn: z.array(z.string().min(1)).min(1)
      })
      .strict(),
    typecast: z.boolean().optional().default(false),
    idempotencyKey: z.string().min(1).optional(),
    dryRun: z.boolean().optional().default(false),
    conflictStrategy: z
      .enum(['fail_on_conflict', 'server_merge', 'client_merge'])
      .optional()
      .default('fail_on_conflict')
  })
  .strict();

export const upsertOutputSchema = z
  .object({
    diff: mutationDiffSchema,
    records: z.array(recordSchema).optional(),
    dryRun: z.boolean(),
    conflicts: z.array(conflictSchema).optional()
  })
  .strict();

export const listExceptionsInputSchema = z
  .object({
    since: z.string().optional(),
    severity: z.enum(['info', 'warning', 'error']).optional(),
    limit: z.number().int().min(1).max(500).optional().default(100),
    cursor: z.string().optional()
  })
  .strict();

export const exceptionItemSchema = z
  .object({
    id: z.string(),
    timestamp: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
    category: z.enum(['rate_limit', 'validation', 'auth', 'conflict', 'schema_drift', 'other']),
    summary: z.string(),
    details: z.string().optional(),
    proposedFix: z.record(z.string(), z.unknown()).optional()
  })
  .strict();

export const listExceptionsOutputSchema = z
  .object({
    items: z.array(exceptionItemSchema),
    cursor: z.string().optional()
  })
  .strict();

const allowedOperations = ['describe', 'query', 'create', 'update', 'upsert'] as const;

export const governanceOutputSchema = z
  .object({
    allowedBases: z.array(z.string()),
    allowedTables: z
      .array(
        z
          .object({
            baseId: z.string(),
            table: z.string()
          })
          .strict()
      )
      .optional()
      .default([]),
    allowedOperations: z
      .array(z.enum(allowedOperations))
      .default([...allowedOperations]),
    piiFields: z
      .array(
        z
          .object({
            baseId: z.string(),
            table: z.string(),
            field: z.string(),
            policy: z.enum(['mask', 'hash', 'drop'])
          })
          .strict()
      )
      .optional()
      .default([]),
    redactionPolicy: z.enum(['mask_all_pii', 'mask_on_inline', 'none']).default('mask_on_inline'),
    loggingPolicy: z.enum(['errors_only', 'minimal', 'verbose']).default('minimal'),
    retentionDays: z.number().int().min(0).default(7)
  })
  .strict();

export type DescribeInput = z.infer<typeof describeInputSchema>;
export type DescribeOutput = z.infer<typeof describeOutputSchema>;

export type QueryInput = z.infer<typeof queryInputSchema>;
export type QueryOutput = z.infer<typeof queryOutputSchema>;

export type CreateInput = z.infer<typeof createInputSchema>;
export type CreateOutput = z.infer<typeof createOutputSchema>;
export type UpdateInput = z.infer<typeof updateInputSchema>;
export type UpdateOutput = z.infer<typeof updateOutputSchema>;
export type UpsertInput = z.infer<typeof upsertInputSchema>;
export type UpsertOutput = z.infer<typeof upsertOutputSchema>;

export type ListExceptionsInput = z.infer<typeof listExceptionsInputSchema>;
export type ExceptionItem = z.infer<typeof exceptionItemSchema>;
export type ListExceptionsOutput = z.infer<typeof listExceptionsOutputSchema>;

export type GovernanceSnapshot = z.infer<typeof governanceOutputSchema>;

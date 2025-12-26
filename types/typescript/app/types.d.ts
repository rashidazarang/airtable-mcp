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
export declare const detailLevelSchema: z.ZodEnum<{
    tableIdentifiersOnly: "tableIdentifiersOnly";
    identifiersOnly: "identifiersOnly";
    full: "full";
}>;
export type DetailLevel = z.infer<typeof detailLevelSchema>;
export declare const describeInputSchema: z.ZodObject<{
    scope: z.ZodEnum<{
        base: "base";
        table: "table";
    }>;
    baseId: z.ZodString;
    table: z.ZodOptional<z.ZodString>;
    detailLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        tableIdentifiersOnly: "tableIdentifiersOnly";
        identifiersOnly: "identifiersOnly";
        full: "full";
    }>>>;
    includeFields: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeViews: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strict>;
export declare const describeInputShape: {
    scope: z.ZodEnum<{
        base: "base";
        table: "table";
    }>;
    baseId: z.ZodString;
    table: z.ZodOptional<z.ZodString>;
    detailLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        tableIdentifiersOnly: "tableIdentifiersOnly";
        identifiersOnly: "identifiersOnly";
        full: "full";
    }>>>;
    includeFields: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeViews: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare const describeOutputSchema: z.ZodObject<{
    base: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$loose>;
    tables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        primaryFieldId: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$loose>>>;
        views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$loose>>>;
    views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strict>;
export declare const queryInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodString>>;
    filterByFormula: z.ZodOptional<z.ZodString>;
    view: z.ZodOptional<z.ZodString>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>>;
    }, z.core.$strict>>>;
    pageSize: z.ZodOptional<z.ZodNumber>;
    maxRecords: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodString>;
    returnFieldsByFieldId: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strict>;
export declare const queryInputShape: {
    baseId: z.ZodString;
    table: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodString>>;
    filterByFormula: z.ZodOptional<z.ZodString>;
    view: z.ZodOptional<z.ZodString>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>>;
    }, z.core.$strict>>>;
    pageSize: z.ZodOptional<z.ZodNumber>;
    maxRecords: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodString>;
    returnFieldsByFieldId: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare const queryOutputSchema: z.ZodObject<{
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>;
    offset: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodObject<{
        returned: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const createInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>;
    typecast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strict>;
export declare const createOutputSchema: z.ZodObject<{
    diff: z.ZodObject<{
        added: z.ZodNumber;
        updated: z.ZodNumber;
        unchanged: z.ZodNumber;
    }, z.core.$strict>;
    records: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>>;
    dryRun: z.ZodBoolean;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export declare const updateOutputSchema: z.ZodObject<{
    diff: z.ZodObject<{
        added: z.ZodNumber;
        updated: z.ZodNumber;
        unchanged: z.ZodNumber;
        conflicts: z.ZodNumber;
    }, z.core.$strict>;
    records: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>>;
    dryRun: z.ZodBoolean;
    conflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        field: z.ZodString;
        before: z.ZodOptional<z.ZodUnknown>;
        after: z.ZodOptional<z.ZodUnknown>;
        current: z.ZodUnknown;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const updateInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>;
    typecast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    conflictStrategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        fail_on_conflict: "fail_on_conflict";
        server_merge: "server_merge";
        client_merge: "client_merge";
    }>>>;
    ifUnchangedHash: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const upsertInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>;
    performUpsert: z.ZodObject<{
        fieldsToMergeOn: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    typecast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    conflictStrategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        fail_on_conflict: "fail_on_conflict";
        server_merge: "server_merge";
        client_merge: "client_merge";
    }>>>;
}, z.core.$strict>;
export declare const upsertOutputSchema: z.ZodObject<{
    diff: z.ZodObject<{
        added: z.ZodNumber;
        updated: z.ZodNumber;
        unchanged: z.ZodNumber;
        conflicts: z.ZodNumber;
    }, z.core.$strict>;
    records: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>>>;
    dryRun: z.ZodBoolean;
    conflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        field: z.ZodString;
        before: z.ZodOptional<z.ZodUnknown>;
        after: z.ZodOptional<z.ZodUnknown>;
        current: z.ZodUnknown;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export declare const listExceptionsInputSchema: z.ZodObject<{
    since: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<{
        error: "error";
        info: "info";
        warning: "warning";
    }>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const exceptionItemSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    severity: z.ZodEnum<{
        error: "error";
        info: "info";
        warning: "warning";
    }>;
    category: z.ZodEnum<{
        rate_limit: "rate_limit";
        validation: "validation";
        auth: "auth";
        conflict: "conflict";
        schema_drift: "schema_drift";
        other: "other";
    }>;
    summary: z.ZodString;
    details: z.ZodOptional<z.ZodString>;
    proposedFix: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strict>;
export declare const listExceptionsOutputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodString;
        severity: z.ZodEnum<{
            error: "error";
            info: "info";
            warning: "warning";
        }>;
        category: z.ZodEnum<{
            rate_limit: "rate_limit";
            validation: "validation";
            auth: "auth";
            conflict: "conflict";
            schema_drift: "schema_drift";
            other: "other";
        }>;
        summary: z.ZodString;
        details: z.ZodOptional<z.ZodString>;
        proposedFix: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strict>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const governanceOutputSchema: z.ZodObject<{
    allowedBases: z.ZodArray<z.ZodString>;
    allowedTables: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        baseId: z.ZodString;
        table: z.ZodString;
    }, z.core.$strict>>>>;
    allowedOperations: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        describe: "describe";
        query: "query";
        create: "create";
        update: "update";
        upsert: "upsert";
    }>>>;
    piiFields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        baseId: z.ZodString;
        table: z.ZodString;
        field: z.ZodString;
        policy: z.ZodEnum<{
            mask: "mask";
            hash: "hash";
            drop: "drop";
        }>;
    }, z.core.$strict>>>>;
    redactionPolicy: z.ZodDefault<z.ZodEnum<{
        mask_all_pii: "mask_all_pii";
        mask_on_inline: "mask_on_inline";
        none: "none";
    }>>;
    loggingPolicy: z.ZodDefault<z.ZodEnum<{
        errors_only: "errors_only";
        minimal: "minimal";
        verbose: "verbose";
    }>>;
    retentionDays: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
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

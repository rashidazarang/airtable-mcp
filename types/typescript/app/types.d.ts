import { z } from 'zod';
export declare const describeInputSchema: z.ZodEffects<z.ZodObject<{
    scope: z.ZodEnum<["base", "table"]>;
    baseId: z.ZodString;
    table: z.ZodOptional<z.ZodString>;
    includeFields: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeViews: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strict", z.ZodTypeAny, {
    scope: "base" | "table";
    baseId: string;
    includeFields: boolean;
    includeViews: boolean;
    table?: string | undefined;
}, {
    scope: "base" | "table";
    baseId: string;
    table?: string | undefined;
    includeFields?: boolean | undefined;
    includeViews?: boolean | undefined;
}>, {
    scope: "base" | "table";
    baseId: string;
    includeFields: boolean;
    includeViews: boolean;
    table?: string | undefined;
}, {
    scope: "base" | "table";
    baseId: string;
    table?: string | undefined;
    includeFields?: boolean | undefined;
    includeViews?: boolean | undefined;
}>;
export declare const describeInputShape: {
    scope: z.ZodEnum<["base", "table"]>;
    baseId: z.ZodString;
    table: z.ZodOptional<z.ZodString>;
    includeFields: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeViews: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export declare const describeOutputSchema: z.ZodObject<{
    base: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>;
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
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        primaryFieldId: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        primaryFieldId: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    }, z.ZodTypeAny, "passthrough">>, "many">>;
    views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
}, "strict", z.ZodTypeAny, {
    base: {
        id: string;
        name: string;
    } & {
        [k: string]: unknown;
    };
    views?: Record<string, unknown>[] | undefined;
    tables?: z.objectOutputType<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        primaryFieldId: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}, {
    base: {
        id: string;
        name: string;
    } & {
        [k: string]: unknown;
    };
    views?: Record<string, unknown>[] | undefined;
    tables?: z.objectInputType<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        primaryFieldId: z.ZodOptional<z.ZodString>;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            id: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.ZodTypeAny, "passthrough">>, "many">>;
        views: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">>;
    }, z.ZodTypeAny, "passthrough">[] | undefined;
}>;
export declare const queryInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filterByFormula: z.ZodOptional<z.ZodString>;
    view: z.ZodOptional<z.ZodString>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strict", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction?: "asc" | "desc" | undefined;
    }>, "many">>;
    pageSize: z.ZodOptional<z.ZodNumber>;
    maxRecords: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodString>;
    returnFieldsByFieldId: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strict", z.ZodTypeAny, {
    table: string;
    baseId: string;
    returnFieldsByFieldId: boolean;
    fields?: string[] | undefined;
    filterByFormula?: string | undefined;
    view?: string | undefined;
    sorts?: {
        field: string;
        direction: "asc" | "desc";
    }[] | undefined;
    pageSize?: number | undefined;
    maxRecords?: number | undefined;
    offset?: string | undefined;
}, {
    table: string;
    baseId: string;
    fields?: string[] | undefined;
    filterByFormula?: string | undefined;
    view?: string | undefined;
    sorts?: {
        field: string;
        direction?: "asc" | "desc" | undefined;
    }[] | undefined;
    pageSize?: number | undefined;
    maxRecords?: number | undefined;
    offset?: string | undefined;
    returnFieldsByFieldId?: boolean | undefined;
}>;
export declare const queryInputShape: {
    baseId: z.ZodString;
    table: z.ZodString;
    fields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filterByFormula: z.ZodOptional<z.ZodString>;
    view: z.ZodOptional<z.ZodString>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strict", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction?: "asc" | "desc" | undefined;
    }>, "many">>;
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
    }, "strict", z.ZodTypeAny, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }>, "many">;
    offset: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodObject<{
        returned: z.ZodNumber;
        hasMore: z.ZodBoolean;
    }, "strict", z.ZodTypeAny, {
        returned: number;
        hasMore: boolean;
    }, {
        returned: number;
        hasMore: boolean;
    }>>;
}, "strict", z.ZodTypeAny, {
    records: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[];
    offset?: string | undefined;
    summary?: {
        returned: number;
        hasMore: boolean;
    } | undefined;
}, {
    records: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[];
    offset?: string | undefined;
    summary?: {
        returned: number;
        hasMore: boolean;
    } | undefined;
}>;
export declare const createInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strict", z.ZodTypeAny, {
        fields: Record<string, unknown>;
    }, {
        fields: Record<string, unknown>;
    }>, "many">;
    typecast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strict", z.ZodTypeAny, {
    table: string;
    baseId: string;
    records: {
        fields: Record<string, unknown>;
    }[];
    typecast: boolean;
    dryRun: boolean;
    idempotencyKey?: string | undefined;
}, {
    table: string;
    baseId: string;
    records: {
        fields: Record<string, unknown>;
    }[];
    typecast?: boolean | undefined;
    idempotencyKey?: string | undefined;
    dryRun?: boolean | undefined;
}>;
export declare const createOutputSchema: z.ZodObject<{
    diff: z.ZodObject<{
        added: z.ZodNumber;
        updated: z.ZodNumber;
        unchanged: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        added: number;
        updated: number;
        unchanged: number;
    }, {
        added: number;
        updated: number;
        unchanged: number;
    }>;
    records: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }>, "many">>;
    dryRun: z.ZodBoolean;
    warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strict", z.ZodTypeAny, {
    dryRun: boolean;
    diff: {
        added: number;
        updated: number;
        unchanged: number;
    };
    records?: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[] | undefined;
    warnings?: string[] | undefined;
}, {
    dryRun: boolean;
    diff: {
        added: number;
        updated: number;
        unchanged: number;
    };
    records?: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[] | undefined;
    warnings?: string[] | undefined;
}>;
export declare const updateOutputSchema: z.ZodObject<{
    diff: z.ZodObject<{
        added: z.ZodNumber;
        updated: z.ZodNumber;
        unchanged: z.ZodNumber;
        conflicts: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    }, {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    }>;
    records: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }>, "many">>;
    dryRun: z.ZodBoolean;
    conflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        field: z.ZodString;
        before: z.ZodOptional<z.ZodUnknown>;
        after: z.ZodOptional<z.ZodUnknown>;
        current: z.ZodUnknown;
    }, "strict", z.ZodTypeAny, {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }, {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    dryRun: boolean;
    diff: {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    };
    records?: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[] | undefined;
    conflicts?: {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }[] | undefined;
}, {
    dryRun: boolean;
    diff: {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    };
    records?: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[] | undefined;
    conflicts?: {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }[] | undefined;
}>;
export declare const updateInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        fields: Record<string, unknown>;
    }, {
        id: string;
        fields: Record<string, unknown>;
    }>, "many">;
    typecast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    conflictStrategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["fail_on_conflict", "server_merge", "client_merge"]>>>;
    ifUnchangedHash: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    table: string;
    baseId: string;
    records: {
        id: string;
        fields: Record<string, unknown>;
    }[];
    typecast: boolean;
    dryRun: boolean;
    conflictStrategy: "fail_on_conflict" | "server_merge" | "client_merge";
    idempotencyKey?: string | undefined;
    ifUnchangedHash?: string | undefined;
}, {
    table: string;
    baseId: string;
    records: {
        id: string;
        fields: Record<string, unknown>;
    }[];
    typecast?: boolean | undefined;
    idempotencyKey?: string | undefined;
    dryRun?: boolean | undefined;
    conflictStrategy?: "fail_on_conflict" | "server_merge" | "client_merge" | undefined;
    ifUnchangedHash?: string | undefined;
}>;
export declare const upsertInputSchema: z.ZodObject<{
    baseId: z.ZodString;
    table: z.ZodString;
    records: z.ZodArray<z.ZodObject<{
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strict", z.ZodTypeAny, {
        fields: Record<string, unknown>;
    }, {
        fields: Record<string, unknown>;
    }>, "many">;
    performUpsert: z.ZodObject<{
        fieldsToMergeOn: z.ZodArray<z.ZodString, "many">;
    }, "strict", z.ZodTypeAny, {
        fieldsToMergeOn: string[];
    }, {
        fieldsToMergeOn: string[];
    }>;
    typecast: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    conflictStrategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["fail_on_conflict", "server_merge", "client_merge"]>>>;
}, "strict", z.ZodTypeAny, {
    table: string;
    baseId: string;
    records: {
        fields: Record<string, unknown>;
    }[];
    typecast: boolean;
    dryRun: boolean;
    conflictStrategy: "fail_on_conflict" | "server_merge" | "client_merge";
    performUpsert: {
        fieldsToMergeOn: string[];
    };
    idempotencyKey?: string | undefined;
}, {
    table: string;
    baseId: string;
    records: {
        fields: Record<string, unknown>;
    }[];
    performUpsert: {
        fieldsToMergeOn: string[];
    };
    typecast?: boolean | undefined;
    idempotencyKey?: string | undefined;
    dryRun?: boolean | undefined;
    conflictStrategy?: "fail_on_conflict" | "server_merge" | "client_merge" | undefined;
}>;
export declare const upsertOutputSchema: z.ZodObject<{
    diff: z.ZodObject<{
        added: z.ZodNumber;
        updated: z.ZodNumber;
        unchanged: z.ZodNumber;
        conflicts: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    }, {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    }>;
    records: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        createdTime: z.ZodOptional<z.ZodString>;
        fields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }, {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }>, "many">>;
    dryRun: z.ZodBoolean;
    conflicts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        field: z.ZodString;
        before: z.ZodOptional<z.ZodUnknown>;
        after: z.ZodOptional<z.ZodUnknown>;
        current: z.ZodUnknown;
    }, "strict", z.ZodTypeAny, {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }, {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    dryRun: boolean;
    diff: {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    };
    records?: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[] | undefined;
    conflicts?: {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }[] | undefined;
}, {
    dryRun: boolean;
    diff: {
        added: number;
        updated: number;
        unchanged: number;
        conflicts: number;
    };
    records?: {
        id: string;
        fields: Record<string, unknown>;
        createdTime?: string | undefined;
    }[] | undefined;
    conflicts?: {
        id: string;
        field: string;
        before?: unknown;
        after?: unknown;
        current?: unknown;
    }[] | undefined;
}>;
export declare const listExceptionsInputSchema: z.ZodObject<{
    since: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["info", "warning", "error"]>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    cursor: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    limit: number;
    since?: string | undefined;
    severity?: "info" | "warning" | "error" | undefined;
    cursor?: string | undefined;
}, {
    since?: string | undefined;
    severity?: "info" | "warning" | "error" | undefined;
    limit?: number | undefined;
    cursor?: string | undefined;
}>;
export declare const exceptionItemSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    severity: z.ZodEnum<["info", "warning", "error"]>;
    category: z.ZodEnum<["rate_limit", "validation", "auth", "conflict", "schema_drift", "other"]>;
    summary: z.ZodString;
    details: z.ZodOptional<z.ZodString>;
    proposedFix: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    id: string;
    summary: string;
    severity: "info" | "warning" | "error";
    timestamp: string;
    category: "validation" | "rate_limit" | "auth" | "conflict" | "schema_drift" | "other";
    details?: string | undefined;
    proposedFix?: Record<string, unknown> | undefined;
}, {
    id: string;
    summary: string;
    severity: "info" | "warning" | "error";
    timestamp: string;
    category: "validation" | "rate_limit" | "auth" | "conflict" | "schema_drift" | "other";
    details?: string | undefined;
    proposedFix?: Record<string, unknown> | undefined;
}>;
export declare const listExceptionsOutputSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodString;
        severity: z.ZodEnum<["info", "warning", "error"]>;
        category: z.ZodEnum<["rate_limit", "validation", "auth", "conflict", "schema_drift", "other"]>;
        summary: z.ZodString;
        details: z.ZodOptional<z.ZodString>;
        proposedFix: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        summary: string;
        severity: "info" | "warning" | "error";
        timestamp: string;
        category: "validation" | "rate_limit" | "auth" | "conflict" | "schema_drift" | "other";
        details?: string | undefined;
        proposedFix?: Record<string, unknown> | undefined;
    }, {
        id: string;
        summary: string;
        severity: "info" | "warning" | "error";
        timestamp: string;
        category: "validation" | "rate_limit" | "auth" | "conflict" | "schema_drift" | "other";
        details?: string | undefined;
        proposedFix?: Record<string, unknown> | undefined;
    }>, "many">;
    cursor: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    items: {
        id: string;
        summary: string;
        severity: "info" | "warning" | "error";
        timestamp: string;
        category: "validation" | "rate_limit" | "auth" | "conflict" | "schema_drift" | "other";
        details?: string | undefined;
        proposedFix?: Record<string, unknown> | undefined;
    }[];
    cursor?: string | undefined;
}, {
    items: {
        id: string;
        summary: string;
        severity: "info" | "warning" | "error";
        timestamp: string;
        category: "validation" | "rate_limit" | "auth" | "conflict" | "schema_drift" | "other";
        details?: string | undefined;
        proposedFix?: Record<string, unknown> | undefined;
    }[];
    cursor?: string | undefined;
}>;
export declare const governanceOutputSchema: z.ZodObject<{
    allowedBases: z.ZodArray<z.ZodString, "many">;
    allowedTables: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        baseId: z.ZodString;
        table: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        table: string;
        baseId: string;
    }, {
        table: string;
        baseId: string;
    }>, "many">>>;
    allowedOperations: z.ZodDefault<z.ZodArray<z.ZodEnum<["describe", "query", "create", "update", "upsert"]>, "many">>;
    piiFields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        baseId: z.ZodString;
        table: z.ZodString;
        field: z.ZodString;
        policy: z.ZodEnum<["mask", "hash", "drop"]>;
    }, "strict", z.ZodTypeAny, {
        table: string;
        baseId: string;
        field: string;
        policy: "mask" | "hash" | "drop";
    }, {
        table: string;
        baseId: string;
        field: string;
        policy: "mask" | "hash" | "drop";
    }>, "many">>>;
    redactionPolicy: z.ZodDefault<z.ZodEnum<["mask_all_pii", "mask_on_inline", "none"]>>;
    loggingPolicy: z.ZodDefault<z.ZodEnum<["errors_only", "minimal", "verbose"]>>;
    retentionDays: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    allowedBases: string[];
    allowedTables: {
        table: string;
        baseId: string;
    }[];
    allowedOperations: ("describe" | "query" | "create" | "update" | "upsert")[];
    piiFields: {
        table: string;
        baseId: string;
        field: string;
        policy: "mask" | "hash" | "drop";
    }[];
    redactionPolicy: "mask_all_pii" | "mask_on_inline" | "none";
    loggingPolicy: "errors_only" | "minimal" | "verbose";
    retentionDays: number;
}, {
    allowedBases: string[];
    allowedTables?: {
        table: string;
        baseId: string;
    }[] | undefined;
    allowedOperations?: ("describe" | "query" | "create" | "update" | "upsert")[] | undefined;
    piiFields?: {
        table: string;
        baseId: string;
        field: string;
        policy: "mask" | "hash" | "drop";
    }[] | undefined;
    redactionPolicy?: "mask_all_pii" | "mask_on_inline" | "none" | undefined;
    loggingPolicy?: "errors_only" | "minimal" | "verbose" | undefined;
    retentionDays?: number | undefined;
}>;
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

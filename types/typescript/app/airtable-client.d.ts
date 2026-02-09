import { RateLimiter } from './rateLimiter';
import { Logger } from './logger';
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /**
     * Path including leading slash and version segment, e.g. `/v0/meta/bases/app123`.
     */
    path: string;
    query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>;
    body?: unknown;
    baseId?: string;
    idempotencyKey?: string;
}
interface ClientOptions {
    baseLimiter: RateLimiter;
    patLimiter: RateLimiter;
    logger: Logger;
    userAgent: string;
    patHash: string;
    maxRetries?: number;
}
export declare class AirtableClient {
    private readonly baseLimiter;
    private readonly patLimiter;
    private readonly logger;
    private readonly userAgent;
    private readonly pat;
    private readonly patHash;
    private readonly maxRetries;
    constructor(personalAccessToken: string, options: ClientOptions);
    listBases(): Promise<{
        bases: unknown[];
    }>;
    getBase(baseId: string): Promise<unknown>;
    listTables(baseId: string): Promise<{
        tables: unknown[];
    }>;
    queryRecords<T = unknown>(baseId: string, table: string, query?: RequestOptions['query']): Promise<T>;
    createRecords<T = unknown>(baseId: string, table: string, payload: unknown, idempotencyKey?: string): Promise<T>;
    updateRecords<T = unknown>(baseId: string, table: string, payload: unknown, idempotencyKey?: string): Promise<T>;
    upsertRecords<T = unknown>(baseId: string, table: string, payload: unknown, idempotencyKey?: string): Promise<T>;
    getRecord<T = unknown>(baseId: string, table: string, recordId: string): Promise<T>;
    deleteRecords<T = unknown>(baseId: string, table: string, recordIds: string[]): Promise<T>;
    createTable<T = unknown>(baseId: string, payload: unknown): Promise<T>;
    updateTable<T = unknown>(baseId: string, tableId: string, payload: unknown): Promise<T>;
    createField<T = unknown>(baseId: string, tableId: string, payload: unknown): Promise<T>;
    updateField<T = unknown>(baseId: string, tableId: string, fieldId: string, payload: unknown): Promise<T>;
    deleteWebhook<T = unknown>(baseId: string, webhookId: string): Promise<T>;
    getWebhookPayloads<T = unknown>(baseId: string, webhookId: string, cursor?: string): Promise<T>;
    createNewBase<T = unknown>(payload: unknown): Promise<T>;
    listComments<T = unknown>(baseId: string, table: string, recordId: string, offset?: string, pageSize?: number): Promise<T>;
    createComment<T = unknown>(baseId: string, table: string, recordId: string, text: string): Promise<T>;
    updateComment<T = unknown>(baseId: string, table: string, recordId: string, commentId: string, text: string): Promise<T>;
    deleteComment<T = unknown>(baseId: string, table: string, recordId: string, commentId: string): Promise<T>;
    whoami<T = unknown>(): Promise<T>;
    private request;
    private withRetry;
    private backoffWithJitter;
    private performRequest;
    private toDomainError;
    private safeExtractErrorInfo;
    private extractRequestId;
}
export {};

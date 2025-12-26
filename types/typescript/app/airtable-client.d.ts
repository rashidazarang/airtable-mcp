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
    private request;
    private withRetry;
    private backoffWithJitter;
    private performRequest;
    private toDomainError;
    private safeExtractErrorInfo;
    private extractRequestId;
}
export {};

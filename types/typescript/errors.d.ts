/**
 * Error taxonomy aligned with Airtable Brain guardrails.
 *
 * All tool errors should use these types so the LLM can reason about
 * retry behaviour and user messaging. Avoid leaking raw Airtable payloads
 * through error messages.
 */
export type AirtableErrorCode = 'RateLimited' | 'ValidationError' | 'AuthError' | 'ConflictError' | 'NotFound' | 'InternalError' | 'GovernanceError';
export interface ErrorContext {
    baseId?: string;
    table?: string;
    retryAfterMs?: number;
    attempt?: number;
    totalAttempts?: number;
    upstreamErrorType?: string;
    upstreamRequestId?: string;
    governanceRule?: string;
    endpoint?: string;
}
interface AirtableErrorOptions {
    status?: number;
    retryAfterMs?: number;
    context?: ErrorContext;
    cause?: unknown;
}
export declare class AirtableBrainError extends Error {
    readonly code: AirtableErrorCode;
    readonly status?: number;
    readonly retryAfterMs?: number;
    readonly context: ErrorContext;
    constructor(code: AirtableErrorCode, message: string, options?: AirtableErrorOptions);
    withContext(context: Partial<ErrorContext>): this;
}
export declare class RateLimitError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export declare class AirtableValidationError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export declare class AuthError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export declare class ConflictError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export declare class NotFoundError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export declare class InternalServerError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export declare class GovernanceError extends AirtableBrainError {
    constructor(message: string, options?: AirtableErrorOptions);
}
export {};

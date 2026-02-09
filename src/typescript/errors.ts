/**
 * Error taxonomy aligned with Airtable Brain guardrails.
 *
 * All tool errors should use these types so the LLM can reason about
 * retry behaviour and user messaging. Avoid leaking raw Airtable payloads
 * through error messages.
 */

export type AirtableErrorCode =
  | 'RateLimited'
  | 'ValidationError'
  | 'AuthError'
  | 'ConflictError'
  | 'NotFound'
  | 'InternalError'
  | 'GovernanceError';

export interface ErrorContext {
  baseId?: string;
  table?: string;
  retryAfterMs?: number;
  attempt?: number;
  totalAttempts?: number;
  upstreamErrorType?: string;
  upstreamErrorMessage?: string;
  upstreamRequestId?: string;
  governanceRule?: string;
  endpoint?: string;
  tokenFormatWarnings?: string[];
}

interface AirtableErrorOptions {
  status?: number;
  retryAfterMs?: number;
  context?: ErrorContext;
  cause?: unknown;
}

export class AirtableBrainError extends Error {
  readonly code: AirtableErrorCode;
  readonly status?: number;
  readonly retryAfterMs?: number;
  readonly context: ErrorContext;

  constructor(code: AirtableErrorCode, message: string, options: AirtableErrorOptions = {}) {
    super(message);
    this.name = code;
    this.code = code;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
    if (options.status !== undefined) {
      this.status = options.status;
    }
    if (options.retryAfterMs !== undefined) {
      this.retryAfterMs = options.retryAfterMs;
    }
    this.context = options.context ?? {};
  }

  withContext(context: Partial<ErrorContext>): this {
    Object.assign(this.context, context);
    return this;
  }
}

export class RateLimitError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('RateLimited', message, options);
  }
}

export class AirtableValidationError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('ValidationError', message, options);
  }
}

export class AuthError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('AuthError', message, options);
  }
}

export class ConflictError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('ConflictError', message, options);
  }
}

export class NotFoundError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('NotFound', message, options);
  }
}

export class InternalServerError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('InternalError', message, options);
  }
}

export class GovernanceError extends AirtableBrainError {
  constructor(message: string, options: AirtableErrorOptions = {}) {
    super('GovernanceError', message, options);
  }
}

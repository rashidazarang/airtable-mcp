import https from 'node:https';
import { IncomingHttpHeaders } from 'node:http';
import { URL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { RateLimiter } from './rateLimiter';
import { Logger } from './logger';
import {
  AirtableBrainError,
  AuthError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  RateLimitError,
  AirtableValidationError,
  ErrorContext
} from '../errors';

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

type AirtableResponse<T> = {
  status: number;
  body: T;
  headers: IncomingHttpHeaders;
};

function toQueryString(query?: RequestOptions['query']): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(`${key}[]`, String(item)));
    } else {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString.length > 0 ? `?${queryString}` : '';
}

function parseRetryAfter(headers: IncomingHttpHeaders): number | undefined {
  const retryAfter = headers['retry-after'];
  if (!retryAfter) return undefined;

  const parsedSeconds = Number(retryAfter);
  if (!Number.isNaN(parsedSeconds)) {
    return parsedSeconds * 1000;
  }

  const retryDate = new Date(retryAfter);
  if (!Number.isNaN(retryDate.getTime())) {
    return Math.max(retryDate.getTime() - Date.now(), 0);
  }

  return undefined;
}

export class AirtableClient {
  private readonly baseLimiter: RateLimiter;
  private readonly patLimiter: RateLimiter;
  private readonly logger: Logger;
  private readonly userAgent: string;
  private readonly pat: string;
  private readonly patHash: string;
  private readonly maxRetries: number;

  constructor(personalAccessToken: string, options: ClientOptions) {
    this.pat = personalAccessToken;
    this.baseLimiter = options.baseLimiter;
    this.patLimiter = options.patLimiter;
    this.logger = options.logger;
    this.userAgent = options.userAgent;
    this.patHash = options.patHash;
    this.maxRetries = options.maxRetries ?? 3;
  }

  async listBases(): Promise<{ bases: unknown[] }> {
    return this.request<{ bases: unknown[] }>({
      method: 'GET',
      path: '/v0/meta/bases'
    });
  }

  async getBase(baseId: string): Promise<unknown> {
    return this.request<unknown>({
      method: 'GET',
      path: `/v0/meta/bases/${encodeURIComponent(baseId)}`,
      baseId
    });
  }

  async listTables(baseId: string): Promise<{ tables: unknown[] }> {
    return this.request<{ tables: unknown[] }>({
      method: 'GET',
      path: `/v0/meta/bases/${encodeURIComponent(baseId)}/tables`,
      baseId
    });
  }

  async queryRecords<T = unknown>(
    baseId: string,
    table: string,
    query?: RequestOptions['query']
  ): Promise<T> {
    const requestOptions: RequestOptions = {
      method: 'GET',
      path: `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`,
      baseId
    };

    if (query && Object.keys(query).length > 0) {
      requestOptions.query = query;
    }

    return this.request<T>(requestOptions);
  }

  async createRecords<T = unknown>(
    baseId: string,
    table: string,
    payload: unknown,
    idempotencyKey?: string
  ): Promise<T> {
    const requestOptions: RequestOptions = {
      method: 'POST',
      path: `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`,
      baseId,
      body: payload
    };

    if (idempotencyKey) {
      requestOptions.idempotencyKey = idempotencyKey;
    }

    return this.request<T>(requestOptions);
  }

  async updateRecords<T = unknown>(
    baseId: string,
    table: string,
    payload: unknown,
    idempotencyKey?: string
  ): Promise<T> {
    const requestOptions: RequestOptions = {
      method: 'PATCH',
      path: `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`,
      baseId,
      body: payload
    };

    if (idempotencyKey) {
      requestOptions.idempotencyKey = idempotencyKey;
    }

    return this.request<T>(requestOptions);
  }

  async upsertRecords<T = unknown>(
    baseId: string,
    table: string,
    payload: unknown,
    idempotencyKey?: string
  ): Promise<T> {
    const requestOptions: RequestOptions = {
      method: 'PATCH',
      path: `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`,
      baseId,
      body: payload
    };
    if (idempotencyKey) {
      requestOptions.idempotencyKey = idempotencyKey;
    }
    return this.request<T>(requestOptions);
  }

  private async request<T>(options: RequestOptions): Promise<T> {
    const { baseId } = options;
    if (baseId) {
      await this.baseLimiter.schedule(baseId);
    }
    await this.patLimiter.schedule(this.patHash);
    return this.withRetry(() => this.performRequest<T>(options));
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let lastError: unknown;
    while (attempt < this.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt += 1;

        if (error instanceof RateLimitError) {
          const delayMs = error.retryAfterMs ?? this.backoffWithJitter(attempt);
          this.logger.warn('Rate limited, backing off', {
            attempt,
            delayMs
          });
          await delay(delayMs);
          continue;
        }

        if (error instanceof InternalServerError && attempt < this.maxRetries) {
          const delayMs = this.backoffWithJitter(attempt);
          this.logger.warn('Upstream error, retrying', {
            attempt,
            delayMs
          });
          await delay(delayMs);
          continue;
        }

        throw error;
      }
    }

    if (lastError instanceof AirtableBrainError) {
      throw lastError.withContext({ attempt: this.maxRetries, totalAttempts: this.maxRetries });
    }
    throw lastError;
  }

  private backoffWithJitter(attempt: number): number {
    const baseDelay = Math.min(1000 * 2 ** (attempt - 1), 8000);
    const jitter = Math.random() * 250;
    return baseDelay + jitter;
  }

  private performRequest<T>(options: RequestOptions): Promise<T> {
    const { method = 'GET', path, query, body, idempotencyKey } = options;
    const logger = this.logger.child({
      op: 'airtable_request',
      method,
      path,
      baseId: options.baseId,
      patHash: this.patHash
    });

    const queryString = toQueryString(query);
    const url = new URL(`https://api.airtable.com${path}${queryString}`);

    const payload = body === undefined ? undefined : JSON.stringify(body);

    return new Promise<T>((resolve, reject) => {
      const request = https.request(
        {
          method,
          hostname: url.hostname,
          path: url.pathname + url.search,
          headers: {
            Authorization: `Bearer ${this.pat}`,
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
            ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
          }
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            let parsedBody: unknown;
            if (rawBody.length > 0) {
              try {
                parsedBody = JSON.parse(rawBody);
              } catch (error) {
                reject(
                  new InternalServerError('Failed to parse Airtable response', {
                    cause: error,
                    status: response.statusCode ?? 0
                  })
                );
                return;
              }
            }

          const result: AirtableResponse<unknown> = {
              status: response.statusCode ?? 0,
              body: parsedBody,
              headers: response.headers
            };

            try {
              if (result.status >= 200 && result.status < 300) {
                resolve(parsedBody as T);
                return;
              }
              reject(this.toDomainError(result, options));
            } catch (error) {
              reject(error);
            }
          });
        }
      );

      request.on('error', (error) => {
        logger.error('Network error calling Airtable', {
          error: error instanceof Error ? error.message : String(error)
        });
        reject(
          new InternalServerError('Network error communicating with Airtable', {
            cause: error
          })
        );
      });

      request.setTimeout(30_000, () => {
        request.destroy();
        reject(
          new InternalServerError('Airtable request timed out', {
            status: 504
          })
        );
      });

      if (payload) {
        request.write(payload);
      }
      request.end();
    });
  }

  private toDomainError(response: AirtableResponse<unknown>, request: RequestOptions): AirtableBrainError {
    const { status, body, headers } = response;
    const baseContext: ErrorContext = {
      endpoint: request.path
    };
    if (request.baseId) {
      baseContext.baseId = request.baseId;
    }

    if (status === 401 || status === 403) {
      const authContext: ErrorContext = { ...baseContext };
      const upstreamErrorType = this.safeExtractErrorType(body);
      if (upstreamErrorType) {
        authContext.upstreamErrorType = upstreamErrorType;
      }
      return new AuthError('Authentication failed with Airtable', {
        status,
        context: authContext
      });
    }

    if (status === 404) {
      return new NotFoundError('Requested resource was not found in Airtable', {
        status,
        context: baseContext
      });
    }

    if (status === 409) {
      return new ConflictError('Airtable reported a conflict', {
        status,
        context: baseContext
      });
    }

    if (status === 400 || status === 422) {
      const validationContext: ErrorContext = { ...baseContext };
      const upstreamErrorType = this.safeExtractErrorType(body);
      if (upstreamErrorType) {
        validationContext.upstreamErrorType = upstreamErrorType;
      }
      return new AirtableValidationError('Airtable validation error', {
        status,
        context: validationContext
      });
    }

    if (status === 429) {
      const retryAfterMs = parseRetryAfter(headers);
      return new RateLimitError('Airtable rate limit exceeded', {
        status,
        ...(retryAfterMs !== undefined ? { retryAfterMs } : {}),
        context: baseContext
      });
    }

    if (status >= 500) {
      const internalContext: ErrorContext = { ...baseContext };
      const upstreamErrorType = this.safeExtractErrorType(body);
      if (upstreamErrorType) {
        internalContext.upstreamErrorType = upstreamErrorType;
      }
      return new InternalServerError('Airtable returned an internal error', {
        status,
        context: internalContext
      });
    }

    return new InternalServerError('Unexpected Airtable response', {
      status,
      context: baseContext
    });
  }

  private safeExtractErrorType(body: unknown): string | undefined {
    if (body && typeof body === 'object' && 'error' in body) {
      const error = (body as Record<string, unknown>).error;
      if (error && typeof error === 'object' && 'type' in error) {
        const type = (error as Record<string, unknown>).type;
        if (typeof type === 'string') {
          return type;
        }
      }
    }
    return undefined;
  }
}

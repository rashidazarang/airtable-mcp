import { randomUUID } from 'node:crypto';
import { Logger } from './logger';
import {
  ExceptionItem,
  ListExceptionsInput,
  ListExceptionsOutput
} from './types';
import { AirtableBrainError, AirtableErrorCode } from '../errors';

type ExceptionCategory = ExceptionItem['category'];
type ExceptionSeverity = ExceptionItem['severity'];

function mapCategory(code: AirtableErrorCode): ExceptionCategory {
  switch (code) {
    case 'RateLimited':
      return 'rate_limit';
    case 'ValidationError':
      return 'validation';
    case 'AuthError':
      return 'auth';
    case 'ConflictError':
      return 'conflict';
    case 'GovernanceError':
      return 'schema_drift';
    default:
      return 'other';
  }
}

function mapSeverity(code: AirtableErrorCode): ExceptionSeverity {
  switch (code) {
    case 'RateLimited':
    case 'AuthError':
    case 'ConflictError':
    case 'GovernanceError':
      return 'error';
    case 'ValidationError':
      return 'warning';
    default:
      return 'error';
  }
}

export class ExceptionStore {
  private readonly capacity: number;
  private readonly items: ExceptionItem[] = [];
  private readonly logger: Logger;

  constructor(capacity: number, logger: Logger) {
    this.capacity = capacity;
    this.logger = logger.child({ component: 'exception_store' });
  }

  record(error: AirtableBrainError, summary: string, details?: string, proposedFix?: Record<string, unknown>): void {
    const item: ExceptionItem = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      severity: mapSeverity(error.code),
      category: mapCategory(error.code),
      summary,
      details,
      proposedFix
    };

    this.items.unshift(item);
    if (this.items.length > this.capacity) {
      this.items.pop();
    }
    this.logger.debug('Recorded exception', { code: error.code });
  }

  list(params: ListExceptionsInput): ListExceptionsOutput {
    const limit = params.limit ?? 100;
    const cursorIndex = this.parseCursor(params.cursor);

    let filtered = this.items;

    if (params.since) {
      filtered = filtered.filter((item) => item.timestamp > params.since!);
    }

    if (params.severity) {
      filtered = filtered.filter((item) => item.severity === params.severity);
    }

    const slice = filtered.slice(cursorIndex, cursorIndex + limit);
    const nextCursor = cursorIndex + limit < filtered.length ? String(cursorIndex + limit) : undefined;

    return {
      items: slice,
      cursor: nextCursor
    };
  }

  private parseCursor(cursor?: string): number {
    if (!cursor) {
      return 0;
    }
    const parsed = Number.parseInt(cursor, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  }
}

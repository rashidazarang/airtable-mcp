import { Logger } from './logger';
import { ListExceptionsInput, ListExceptionsOutput } from './types';
import { AirtableBrainError } from '../errors';
export declare class ExceptionStore {
    private readonly capacity;
    private readonly items;
    private readonly logger;
    constructor(capacity: number, logger: Logger);
    record(error: AirtableBrainError, summary: string, details?: string, proposedFix?: Record<string, unknown>): void;
    list(params: ListExceptionsInput): ListExceptionsOutput;
    private parseCursor;
}

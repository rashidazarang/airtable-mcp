import { LogLevel } from './config';
export type LogMetadata = Record<string, unknown>;
export declare class Logger {
    private readonly level;
    private readonly context;
    constructor(level: LogLevel, context?: LogMetadata);
    child(context: LogMetadata): Logger;
    error(message: string, metadata?: LogMetadata): void;
    warn(message: string, metadata?: LogMetadata): void;
    info(message: string, metadata?: LogMetadata): void;
    debug(message: string, metadata?: LogMetadata): void;
    private log;
}

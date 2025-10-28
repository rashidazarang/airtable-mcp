import { LogLevel } from './config';

const LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

export type LogMetadata = Record<string, unknown>;

export class Logger {
  private readonly level: LogLevel;
  private readonly context: LogMetadata;

  constructor(level: LogLevel, context: LogMetadata = {}) {
    this.level = level;
    this.context = context;
  }

  child(context: LogMetadata): Logger {
    return new Logger(this.level, { ...this.context, ...context });
  }

  error(message: string, metadata: LogMetadata = {}): void {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata: LogMetadata = {}): void {
    this.log('warn', message, metadata);
  }

  info(message: string, metadata: LogMetadata = {}): void {
    this.log('info', message, metadata);
  }

  debug(message: string, metadata: LogMetadata = {}): void {
    this.log('debug', message, metadata);
  }

  private log(level: LogLevel, message: string, metadata: LogMetadata): void {
    if (LEVEL_ORDER[level] > LEVEL_ORDER[this.level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const output = {
      timestamp,
      level,
      message,
      ...this.context,
      ...(Object.keys(metadata).length > 0 ? { metadata } : {})
    };

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(output));
  }
}

import { GovernanceSnapshot } from './types';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export interface AirtableAuthConfig {
    personalAccessToken: string;
    patHash: string;
    defaultBaseId?: string;
    allowedBases: string[];
}
export interface AppConfig {
    version: string;
    auth: AirtableAuthConfig;
    governance: GovernanceSnapshot;
    logLevel: LogLevel;
    exceptionQueueSize: number;
}
export declare function loadConfig(): AppConfig;

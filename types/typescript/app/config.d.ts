import { GovernanceSnapshot } from './types';
import { ToolsetConfig } from './toolset';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export interface AirtableAuthConfig {
    personalAccessToken: string;
    patHash: string;
    defaultBaseId?: string;
    allowedBases: string[];
    tokenFormatWarnings: string[];
}
export interface AppConfig {
    version: string;
    auth: AirtableAuthConfig;
    governance: GovernanceSnapshot;
    logLevel: LogLevel;
    exceptionQueueSize: number;
    /**
     * Which tools to register, from AIRTABLE_TOOLSET. Omitted means full.
     * Lets the server fit client-side tool caps (Cursor allows 40 enabled
     * tools across all servers).
     */
    toolset?: ToolsetConfig;
}
export declare function loadConfig(): AppConfig;

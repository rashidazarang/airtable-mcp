/**
 * Airtable MCP Server - Main Export
 *
 * This module exports the main server functionality for programmatic use.
 * For CLI usage, use the bin/airtable-mcp.js executable.
 */
export { start } from './airtable-mcp-server';
export * from './errors';
export type { AppConfig, AirtableAuthConfig, LogLevel } from './app/config';
export type { AppContext } from './app/context';

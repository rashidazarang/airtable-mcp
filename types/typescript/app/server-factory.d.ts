import { McpServerFactory } from '@modelcontextprotocol/server';
import { AppContext } from './context';
export declare const SERVER_INSTRUCTIONS = "Use describe and query tools for read flows. All mutations require diff review and idempotency keys.";
/**
 * Per-serving-unit server factory for the 2026-07-28 stateless core: one
 * fresh McpServer per HTTP request under createMcpHandler, one per connection
 * under serveStdio. The same factory serves both the modern and legacy eras.
 *
 * App-level state (Airtable client, governance, rate limiters, exception
 * queue) lives in the shared AppContext — never in the protocol layer, so any
 * request can land on any instance.
 */
export declare function createAirtableServerFactory(ctx: AppContext): McpServerFactory;

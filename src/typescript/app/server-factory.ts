import { McpServer, McpServerFactory } from '@modelcontextprotocol/server';
import { AppContext } from './context';
import { registerAllTools } from './tools';
import { registerAllPrompts } from './prompts';

export const SERVER_INSTRUCTIONS =
  'Use describe and query tools for read flows. All mutations require diff review and idempotency keys.';

/**
 * Per-serving-unit server factory for the 2026-07-28 stateless core: one
 * fresh McpServer per HTTP request under createMcpHandler, one per connection
 * under serveStdio. The same factory serves both the modern and legacy eras.
 *
 * App-level state (Airtable client, governance, rate limiters, exception
 * queue) lives in the shared AppContext — never in the protocol layer, so any
 * request can land on any instance.
 */
export function createAirtableServerFactory(ctx: AppContext): McpServerFactory {
  return () => {
    const server = new McpServer(
      { name: 'airtable-brain', version: ctx.config.version },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {}
        },
        instructions: SERVER_INSTRUCTIONS
      }
    );

    registerAllTools(server, ctx);
    registerAllPrompts(server, ctx);

    return server;
  };
}

#!/usr/bin/env node

// Import via require to avoid TS type resolution issues with deep subpath exports
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
import * as http from 'node:http';
import { loadConfig } from './app/config';
import { Logger } from './app/logger';
import { RateLimiter } from './app/rateLimiter';
import { AirtableClient } from './app/airtable-client';
import { GovernanceService } from './app/governance';
import { ExceptionStore } from './app/exceptions';
import { registerAllTools } from './app/tools';
import { AppContext } from './app/context';

const PROTOCOL_VERSION = '2024-11-05';

function buildContext(config: ReturnType<typeof loadConfig>, rootLogger: Logger): AppContext {
  const baseLimiter = new RateLimiter({ maxRequestsPerSecond: 5 });
  const patLimiter = new RateLimiter({ maxRequestsPerSecond: 50 });

  const airtable = new AirtableClient(config.auth.personalAccessToken, {
    baseLimiter,
    patLimiter,
    logger: rootLogger.child({ component: 'airtable_client' }),
    userAgent: `airtable-brain-mcp/${config.version}`,
    patHash: config.auth.patHash
  });

  const governance = new GovernanceService(config.governance);
  const exceptions = new ExceptionStore(config.exceptionQueueSize, rootLogger);

  return {
    config,
    logger: rootLogger,
    airtable,
    governance,
    exceptions
  };
}

export async function start(): Promise<void> {
  const config = loadConfig();
  const logger = new Logger(config.logLevel, { component: 'server' });

  const context = buildContext(config, logger);

  const server = new McpServer(
    {
      name: 'airtable-brain',
      version: config.version,
      protocolVersion: PROTOCOL_VERSION
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {}
      },
      instructions:
        'Use describe and query tools for read flows. All mutations require diff review and idempotency keys.'
    }
  );

  registerAllTools(server, context);

  // Check if HTTP mode is requested (for Smithery hosting)
  const httpPort = process.env.PORT || process.env.MCP_HTTP_PORT;

  if (httpPort) {
    // HTTP transport for hosted deployments
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    const httpServer = http.createServer(async (req, res) => {
      // Health check endpoint
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', version: config.version }));
        return;
      }

      // MCP endpoint
      if (req.url === '/mcp' || req.url === '/') {
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    await server.connect(transport);

    const port = parseInt(httpPort, 10);
    httpServer.listen(port, () => {
      logger.info('Airtable Brain MCP server ready (HTTP mode)', {
        version: config.version,
        protocolVersion: PROTOCOL_VERSION,
        port
      });
    });

    const shutdown = async (signal: string) => {
      logger.info('Shutting down due to signal', { signal });
      httpServer.close();
      await server.close();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } else {
    // Stdio transport for local usage
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Airtable Brain MCP server ready (stdio mode)', {
      version: config.version,
      protocolVersion: PROTOCOL_VERSION
    });

    const shutdown = async (signal: string) => {
      logger.info('Shutting down due to signal', { signal });
      await server.close();
      await transport.close();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  start().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start Airtable Brain MCP server:', error);
    process.exit(1);
  });
}

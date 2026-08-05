#!/usr/bin/env node

import * as http from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { loadConfig } from './app/config';
import { Logger } from './app/logger';
import { RateLimiter } from './app/rateLimiter';
import { AirtableClient } from './app/airtable-client';
import { GovernanceService } from './app/governance';
import { ExceptionStore } from './app/exceptions';
import { AppContext } from './app/context';
import { createAirtableServerFactory } from './app/server-factory';

/**
 * MCP protocol revision this server targets. Version selection is owned by
 * the SDK entries (serveStdio / createMcpHandler): 2026-07-28 stateless core
 * for modern clients, with per-request stateless fallback for 2025-era
 * clients. This constant is informational (logs, health endpoint).
 */
const PROTOCOL_VERSION = '2026-07-28';

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
  const factory = createAirtableServerFactory(context);

  const onerror = (error: Error): void => {
    logger.error('MCP entry error', { error: error.message });
  };

  // Check if HTTP mode is requested (for hosted deployments)
  const httpPort = process.env.PORT || process.env.MCP_HTTP_PORT;

  if (httpPort) {
    // Stateless HTTP entry: every request is served by a fresh instance from
    // the factory, so this scales horizontally with no sticky sessions.
    // 2025-era clients are served through the stateless legacy fallback.
    const handler = createMcpHandler(factory, {
      legacy: 'stateless',
      onerror
    });
    const nodeHandler = toNodeHandler(handler, { onerror });

    const httpServer = http.createServer((req, res) => {
      // Health check endpoint
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ status: 'ok', version: config.version, protocolVersion: PROTOCOL_VERSION })
        );
        return;
      }

      // MCP endpoint
      if (req.url === '/mcp' || req.url === '/') {
        // Cast: node:http types mark `method`/`url` optional, which trips
        // exactOptionalPropertyTypes against NodeIncomingMessageLike.
        void nodeHandler(req as Parameters<typeof nodeHandler>[0], res);
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    const port = parseInt(httpPort, 10);
    httpServer.listen(port, () => {
      logger.info('Airtable Brain MCP server ready (stateless HTTP mode)', {
        version: config.version,
        protocolVersion: PROTOCOL_VERSION,
        port
      });
    });

    const shutdown = async (signal: string) => {
      logger.info('Shutting down due to signal', { signal });
      httpServer.close();
      await handler.close();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } else {
    // Stdio entry for local usage. The opening exchange pins the era for the
    // connection; 2025-era clients keep working through the same factory.
    const handle = serveStdio(factory, { onerror });

    logger.info('Airtable Brain MCP server ready (stdio mode)', {
      version: config.version,
      protocolVersion: PROTOCOL_VERSION
    });

    const shutdown = async (signal: string) => {
      logger.info('Shutting down due to signal', { signal });
      await handle.close();
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

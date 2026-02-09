import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

export function registerWebhookTools(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_webhooks',
    { description: 'List Airtable webhooks for the default base.' },
    async (_args: Record<string, unknown>) => {
      try {
        const baseId = ctx.config.auth.defaultBaseId || ctx.config.auth.allowedBases[0];
        if (!baseId) throw new Error('No base configured');
        const body = await ctx.airtable.queryRecords(baseId, 'meta/webhooks');
        return createToolResponse({ webhooks: body as Record<string, unknown> });
      } catch (error) {
        return handleToolError('list_webhooks', error, ctx);
      }
    }
  );

  server.registerTool(
    'create_webhook',
    { description: 'Create a new webhook for a base.' },
    async (args: Record<string, unknown>) => {
      try {
        const baseId = (args.baseId as string) || ctx.config.auth.defaultBaseId || ctx.config.auth.allowedBases[0];
        if (!baseId) throw new Error('No base configured');
        const payload = { notificationUrl: String(args.notificationUrl || '') };
        const result = await ctx.airtable.createRecords(baseId, 'meta/webhooks', payload as any);
        return createToolResponse({ webhook: result as Record<string, unknown> });
      } catch (error) {
        return handleToolError('create_webhook', error, ctx);
      }
    }
  );

  server.registerTool(
    'refresh_webhook',
    { description: 'Refresh webhook expiration.' },
    async (args: Record<string, unknown>) => {
      try {
        const baseId = (args.baseId as string) || ctx.config.auth.defaultBaseId || ctx.config.auth.allowedBases[0];
        if (!baseId) throw new Error('No base configured');
        const result = await ctx.airtable.updateRecords(baseId, `meta/webhooks/${String(args.webhookId)}/refresh`, {} as any);
        return createToolResponse({ webhook: result as Record<string, unknown> });
      } catch (error) {
        return handleToolError('refresh_webhook', error, ctx);
      }
    }
  );

  server.registerTool(
    'delete_webhook',
    { description: 'Delete an Airtable webhook by ID.' },
    async (args: Record<string, unknown>) => {
      try {
        ctx.governance.ensureOperationAllowed('manage_webhooks');
        const baseId = (args.baseId as string) || ctx.config.auth.defaultBaseId || ctx.config.auth.allowedBases[0];
        if (!baseId) throw new Error('No base configured');
        const webhookId = String(args.webhookId || '');
        if (!webhookId) throw new Error('webhookId is required');
        const result = await ctx.airtable.deleteWebhook(baseId, webhookId);
        return createToolResponse({ deleted: true, webhookId, result: result as Record<string, unknown> });
      } catch (error) {
        return handleToolError('delete_webhook', error, ctx);
      }
    }
  );

  server.registerTool(
    'get_webhook_payloads',
    { description: 'Get payload history for an Airtable webhook.' },
    async (args: Record<string, unknown>) => {
      try {
        ctx.governance.ensureOperationAllowed('manage_webhooks');
        const baseId = (args.baseId as string) || ctx.config.auth.defaultBaseId || ctx.config.auth.allowedBases[0];
        if (!baseId) throw new Error('No base configured');
        const webhookId = String(args.webhookId || '');
        if (!webhookId) throw new Error('webhookId is required');
        const cursor = args.cursor ? String(args.cursor) : undefined;
        const result = await ctx.airtable.getWebhookPayloads(baseId, webhookId, cursor);
        return createToolResponse({ payloads: result as Record<string, unknown> });
      } catch (error) {
        return handleToolError('get_webhook_payloads', error, ctx);
      }
    }
  );
}

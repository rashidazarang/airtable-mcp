import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordId: z.string().min(1),
  offset: z.string().optional(),
  pageSize: z.number().int().min(1).max(100).optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerListCommentsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_comments',
    {
      description: 'List comments on an Airtable record. Requires data.recordComments:read scope.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_comments');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const result = await ctx.airtable.listComments(
          args.baseId,
          args.table,
          args.recordId,
          args.offset,
          args.pageSize
        );

        return createToolResponse({ comments: result });
      } catch (error) {
        return handleToolError('list_comments', error, ctx);
      }
    }
  );
}

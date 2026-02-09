import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordId: z.string().min(1),
  commentId: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerDeleteCommentTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'delete_comment',
    {
      description: 'Delete a comment from an Airtable record. Requires data.recordComments:write scope.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_comments');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        await ctx.airtable.deleteComment(
          args.baseId,
          args.table,
          args.recordId,
          args.commentId
        );

        return createToolResponse({ deleted: true, commentId: args.commentId });
      } catch (error) {
        return handleToolError('delete_comment', error, ctx);
      }
    }
  );
}

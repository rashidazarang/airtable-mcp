import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordId: z.string().min(1),
  commentId: z.string().min(1),
  text: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerUpdateCommentTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'update_comment',
    {
      description: 'Update an existing comment on an Airtable record. Requires data.recordComments:write scope.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_comments');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const result = await ctx.airtable.updateComment(
          args.baseId,
          args.table,
          args.recordId,
          args.commentId,
          args.text
        );

        return createToolResponse({ comment: result });
      } catch (error) {
        return handleToolError('update_comment', error, ctx);
      }
    }
  );
}

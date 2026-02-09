import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordId: z.string().min(1),
  text: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerCreateCommentTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_comment',
    {
      description: 'Create a comment on an Airtable record. Requires data.recordComments:write scope.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_comments');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const result = await ctx.airtable.createComment(
          args.baseId,
          args.table,
          args.recordId,
          args.text
        );

        return createToolResponse({ comment: result });
      } catch (error) {
        return handleToolError('create_comment', error, ctx);
      }
    }
  );
}

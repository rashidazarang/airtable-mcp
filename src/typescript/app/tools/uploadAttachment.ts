import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1),
  table: z.string().min(1),
  recordId: z.string().min(1),
  fieldName: z.string().min(1),
  url: z.string().url(),
  filename: z.string().optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerUploadAttachmentTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'upload_attachment',
    {
      description: 'Add an attachment to a record by URL.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('update');
        ctx.governance.ensureBaseAllowed(args.baseId);
        ctx.governance.ensureTableAllowed(args.baseId, args.table);

        const attachment: any = { url: args.url };
        if (args.filename) attachment.filename = args.filename;

        const payload = {
          records: [{
            id: args.recordId,
            fields: { [args.fieldName]: [attachment] }
          }]
        };

        const result = await ctx.airtable.updateRecords(args.baseId, args.table, payload) as any;

        return createToolResponse({
          record: result.records?.[0] || null
        });
      } catch (error) {
        return handleToolError('upload_attachment', error, ctx);
      }
    }
  );
}

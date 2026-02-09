import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

const inputSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1),
  tables: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    fields: z.array(z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      description: z.string().optional(),
      options: z.record(z.string(), z.unknown()).optional()
    })).optional()
  })).optional()
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerCreateBaseTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'create_base',
    {
      description: 'Create a new Airtable base in a workspace.',
      inputSchema: inputSchema.shape as any
    },
    async (raw: InputType) => {
      try {
        const args = inputSchema.parse(raw);
        ctx.governance.ensureOperationAllowed('manage_schema');

        const result = await ctx.airtable.createNewBase({
          workspaceId: args.workspaceId,
          name: args.name,
          tables: args.tables
        });

        return createToolResponse({ base: result });
      } catch (error) {
        return handleToolError('create_base', error, ctx);
      }
    }
  );
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AppContext } from '../context';
import { z } from 'zod';
import { handleToolError } from './handleError';
import { createToolResponse } from './response';

// Schema for list_bases output
const listBasesOutputSchema = z.object({
  bases: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      permissionLevel: z.string().optional()
    })
  )
});

export type ListBasesOutput = z.infer<typeof listBasesOutputSchema>;

export function registerListBasesTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_bases',
    {
      description: 'List all accessible Airtable bases with their names, IDs, and permission levels',
      inputSchema: {} as any,
      outputSchema: listBasesOutputSchema.shape as any
    },
    async (_args: unknown, _extra: unknown) => {
      try {
        ctx.logger.info('Listing accessible Airtable bases');

        const response = await ctx.airtable.listBases();
        const bases = response.bases;

        if (!bases || bases.length === 0) {
          const structuredContent: ListBasesOutput = {
            bases: []
          };
          return createToolResponse(structuredContent);
        }

        const normalizedBases = bases.map((base: any) => ({
          id: String(base.id ?? ''),
          name: String(base.name ?? ''),
          permissionLevel: base.permissionLevel ? String(base.permissionLevel) : undefined
        }));

        const structuredContent: ListBasesOutput = {
          bases: normalizedBases
        };

        ctx.logger.info('Successfully listed bases', { count: bases.length });

        return createToolResponse(structuredContent);
      } catch (error) {
        return handleToolError('list_bases', error, ctx);
      }
    }
  );
}

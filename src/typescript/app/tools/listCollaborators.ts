import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';
import { createToolResponse } from './response';

const inputSchema = z.object({
  baseId: z.string().min(1)
}).strict();

type InputType = z.infer<typeof inputSchema>;

export function registerListCollaboratorsTool(server: McpServer, _ctx: AppContext): void {
  server.registerTool(
    'list_collaborators',
    {
      description: 'List collaborators for a base (informational — not supported by standard API).',
      inputSchema: inputSchema.shape as any
    },
    async (_raw: InputType) => {
      return createToolResponse({
        supported: false,
        message: 'The standard Airtable REST API does not support listing collaborators. This feature is available through the Airtable Enterprise API or the web interface.',
        suggestion: 'Check base sharing settings in the Airtable web app, or use the Enterprise API if available.'
      });
    }
  );
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { governanceOutputSchema } from '../types';
import { AppContext } from '../context';
import { createToolResponse } from './response';

export function registerGovernanceTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_governance',
    {
      description: 'Return governance allow-lists and PII masking policies.',
      outputSchema: governanceOutputSchema.shape as any
    },
    async () => {
      const snapshot = ctx.governance.getSnapshot();
      return createToolResponse(snapshot);
    }
  );
}

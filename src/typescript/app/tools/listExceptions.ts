import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import {
  ListExceptionsInput,
  listExceptionsInputSchema,
  listExceptionsOutputSchema
} from '../types';
import { AppContext } from '../context';
import { createToolResponse } from './response';

export function registerExceptionsTool(server: McpServer, ctx: AppContext): void {
  server.registerTool(
    'list_exceptions',
    {
      description: 'List recent exceptions and remediation proposals.',
      inputSchema: listExceptionsInputSchema.shape,
      outputSchema: listExceptionsOutputSchema.shape
    },
    async (args: ListExceptionsInput) => {
      const snapshot = ctx.exceptions.list(args);
      return createToolResponse(snapshot);
    }
  );
}

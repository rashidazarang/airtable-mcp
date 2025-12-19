import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AppContext } from '../context';
import { registerListBasesTool } from './listBases';
import { registerDescribeTool } from './describe';
import { registerQueryTool } from './query';
import { registerGovernanceTool } from './listGovernance';
import { registerExceptionsTool } from './listExceptions';
import { registerCreateTool } from './create';
import { registerUpdateTool } from './update';
import { registerUpsertTool } from './upsert';
import { registerWebhookTools } from './webhooks';

export function registerAllTools(server: McpServer, ctx: AppContext): void {
  registerListBasesTool(server, ctx);
  registerDescribeTool(server, ctx);
  registerQueryTool(server, ctx);
  registerGovernanceTool(server, ctx);
  registerExceptionsTool(server, ctx);
  registerCreateTool(server, ctx);
  registerUpdateTool(server, ctx);
  registerUpsertTool(server, ctx);
  registerWebhookTools(server, ctx);
}

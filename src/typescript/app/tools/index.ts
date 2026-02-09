import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AppContext } from '../context';

// Original tools
import { registerListBasesTool } from './listBases';
import { registerDescribeTool } from './describe';
import { registerQueryTool } from './query';
import { registerGovernanceTool } from './listGovernance';
import { registerExceptionsTool } from './listExceptions';
import { registerCreateTool } from './create';
import { registerUpdateTool } from './update';
import { registerUpsertTool } from './upsert';
import { registerWebhookTools } from './webhooks';

// Data operations
import { registerGetRecordTool } from './getRecord';
import { registerDeleteRecordTool } from './deleteRecord';
import { registerSearchRecordsTool } from './searchRecords';
import { registerListRecordsTool } from './listRecords';

// Schema discovery
import { registerGetBaseSchemaTool } from './getBaseSchema';
import { registerListTablesTool } from './listTables';
import { registerListFieldTypesTool } from './listFieldTypes';
import { registerGetTableViewsTool } from './getTableViews';

// Table management
import { registerCreateTableTool } from './createTable';
import { registerUpdateTableTool } from './updateTable';
import { registerDeleteTableTool } from './deleteTable';

// Field management
import { registerCreateFieldTool } from './createField';
import { registerUpdateFieldTool } from './updateField';
import { registerDeleteFieldTool } from './deleteField';

// Batch operations
import { registerBatchCreateRecordsTool } from './batchCreateRecords';
import { registerBatchUpdateRecordsTool } from './batchUpdateRecords';
import { registerBatchDeleteRecordsTool } from './batchDeleteRecords';
import { registerBatchUpsertRecordsTool } from './batchUpsertRecords';

// Views & attachments
import { registerCreateViewTool } from './createView';
import { registerGetViewMetadataTool } from './getViewMetadata';
import { registerUploadAttachmentTool } from './uploadAttachment';

// Base management
import { registerCreateBaseTool } from './createBase';
import { registerListCollaboratorsTool } from './listCollaborators';
import { registerListSharesTool } from './listShares';

// Record comments
import { registerListCommentsTool } from './listComments';
import { registerCreateCommentTool } from './createComment';
import { registerUpdateCommentTool } from './updateComment';
import { registerDeleteCommentTool } from './deleteComment';

// User info
import { registerWhoamiTool } from './whoami';

export function registerAllTools(server: McpServer, ctx: AppContext): void {
  // Original tools
  registerListBasesTool(server, ctx);
  registerDescribeTool(server, ctx);
  registerQueryTool(server, ctx);
  registerGovernanceTool(server, ctx);
  registerExceptionsTool(server, ctx);
  registerCreateTool(server, ctx);
  registerUpdateTool(server, ctx);
  registerUpsertTool(server, ctx);
  registerWebhookTools(server, ctx);

  // Data operations
  registerGetRecordTool(server, ctx);
  registerDeleteRecordTool(server, ctx);
  registerSearchRecordsTool(server, ctx);
  registerListRecordsTool(server, ctx);

  // Schema discovery
  registerGetBaseSchemaTool(server, ctx);
  registerListTablesTool(server, ctx);
  registerListFieldTypesTool(server);
  registerGetTableViewsTool(server, ctx);

  // Table management
  registerCreateTableTool(server, ctx);
  registerUpdateTableTool(server, ctx);
  registerDeleteTableTool(server);

  // Field management
  registerCreateFieldTool(server, ctx);
  registerUpdateFieldTool(server, ctx);
  registerDeleteFieldTool(server, ctx);

  // Batch operations
  registerBatchCreateRecordsTool(server, ctx);
  registerBatchUpdateRecordsTool(server, ctx);
  registerBatchDeleteRecordsTool(server, ctx);
  registerBatchUpsertRecordsTool(server, ctx);

  // Views & attachments
  registerCreateViewTool(server, ctx);
  registerGetViewMetadataTool(server, ctx);
  registerUploadAttachmentTool(server, ctx);

  // Base management
  registerCreateBaseTool(server, ctx);
  registerListCollaboratorsTool(server, ctx);
  registerListSharesTool(server, ctx);

  // Record comments
  registerListCommentsTool(server, ctx);
  registerCreateCommentTool(server, ctx);
  registerUpdateCommentTool(server, ctx);
  registerDeleteCommentTool(server, ctx);

  // User info
  registerWhoamiTool(server, ctx);
}

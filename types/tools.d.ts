/**
 * Tool Schema Type Definitions
 * Comprehensive TypeScript types for all 33 Airtable MCP tools
 */

import { ToolSchema } from './index';

// ============================================================================
// Data Operation Tool Interfaces
// ============================================================================

export interface ListTablesInput {
  include_schema?: boolean;
}

export interface ListRecordsInput {
  [key: string]: unknown;
  table: string;
  maxRecords?: number;
  view?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  pageSize?: number;
  offset?: string;
}

export interface GetRecordInput {
  table: string;
  recordId: string;
}

export interface CreateRecordInput {
  table: string;
  fields: Record<string, unknown>;
  typecast?: boolean;
}

export interface UpdateRecordInput {
  table: string;
  recordId: string;
  fields: Record<string, unknown>;
  typecast?: boolean;
}

export interface DeleteRecordInput {
  table: string;
  recordId: string;
}

export interface SearchRecordsInput {
  table: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  maxRecords?: number;
  view?: string;
}

// ============================================================================
// Webhook Management Tool Interfaces
// ============================================================================

export interface ListWebhooksInput {
  cursor?: string;
}

export interface CreateWebhookInput {
  notificationUrl: string;
  specification?: {
    options?: {
      filters?: {
        dataTypes?: ('tableData' | 'tableSchema')[];
        recordChangeScope?: string;
        watchDataInTableIds?: string[];
      };
    };
  };
}

export interface DeleteWebhookInput {
  webhookId: string;
}

export interface GetWebhookPayloadsInput {
  webhookId: string;
  cursor?: string;
  limit?: number;
}

export interface RefreshWebhookInput {
  webhookId: string;
}

// ============================================================================
// Schema Discovery Tool Interfaces
// ============================================================================

export interface ListBasesInput {
  offset?: string;
}

export interface GetBaseSchemaInput {
  baseId?: string;
}

export interface DescribeTableInput {
  table: string;
  include_sample_data?: boolean;
}

export interface ListFieldTypesInput {
  category?: 'basic' | 'advanced' | 'computed';
}

export interface GetTableViewsInput {
  table: string;
}

// ============================================================================
// Table Management Tool Interfaces
// ============================================================================

export interface CreateTableInput {
  name: string;
  description?: string;
  fields: Array<{
    name: string;
    type: string;
    description?: string;
    options?: Record<string, unknown>;
  }>;
}

export interface UpdateTableInput {
  table: string;
  name?: string;
  description?: string;
}

export interface DeleteTableInput {
  table: string;
  confirmation?: string;
}

// ============================================================================
// Field Management Tool Interfaces
// ============================================================================

export interface CreateFieldInput {
  table: string;
  name: string;
  type: string;
  description?: string;
  options?: Record<string, unknown>;
}

export interface UpdateFieldInput {
  table: string;
  fieldId: string;
  name?: string;
  description?: string;
  options?: Record<string, unknown>;
}

export interface DeleteFieldInput {
  table: string;
  fieldId: string;
  confirmation?: string;
}

// ============================================================================
// Batch Operations Tool Interfaces
// ============================================================================

export interface BatchCreateRecordsInput {
  table: string;
  records: Array<{
    fields: Record<string, unknown>;
  }>;
  typecast?: boolean;
}

export interface BatchUpdateRecordsInput {
  table: string;
  records: Array<{
    id: string;
    fields: Record<string, unknown>;
  }>;
  typecast?: boolean;
}

export interface BatchDeleteRecordsInput {
  table: string;
  records: Array<{
    id: string;
  }>;
}

export interface BatchUpsertRecordsInput {
  table: string;
  records: Array<{
    key_field: string;
    key_value: string;
    fields: Record<string, unknown>;
  }>;
  typecast?: boolean;
}

// ============================================================================
// Attachment Management Tool Interfaces
// ============================================================================

export interface UploadAttachmentInput {
  table: string;
  recordId: string;
  fieldName: string;
  url: string;
  filename?: string;
}

// ============================================================================
// Advanced Views Tool Interfaces
// ============================================================================

export interface CreateViewInput {
  table: string;
  name: string;
  type: 'grid' | 'form' | 'calendar' | 'gallery' | 'kanban';
  visibleFieldIds?: string[];
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

export interface GetViewMetadataInput {
  table: string;
  viewId: string;
}

// ============================================================================
// Base Management Tool Interfaces
// ============================================================================

export interface CreateBaseInput {
  name: string;
  workspaceId?: string;
  tables?: Array<{
    name: string;
    description?: string;
    fields: Array<{
      name: string;
      type: string;
      options?: Record<string, unknown>;
    }>;
  }>;
}

export interface ListCollaboratorsInput {
  baseId?: string;
}

export interface ListSharesInput {
  baseId?: string;
}

// ============================================================================
// Tool Response Interfaces
// ============================================================================

export interface ToolResponse<T = unknown> {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: T;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface PaginatedResponse<T> {
  records?: T[];
  offset?: string;
}

export interface TableInfo {
  id: string;
  name: string;
  description?: string;
  primaryFieldId: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    options?: Record<string, unknown>;
    description?: string;
  }>;
  views: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

export interface RecordInfo {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
  commentCount?: number;
}

export interface WebhookInfo {
  id: string;
  macSecretBase64: string;
  expirationTime: string;
  notificationUrl: string;
  isHookEnabled: boolean;
  specification: {
    options: {
      filters: {
        dataTypes: string[];
        recordChangeScope?: string;
        watchDataInTableIds?: string[];
      };
    };
  };
}

export interface BaseInfo {
  id: string;
  name: string;
  permissionLevel: 'read' | 'comment' | 'edit' | 'create';
}

export interface FieldTypeInfo {
  type: string;
  name: string;
  description: string;
  supportedOptions?: string[];
  examples?: Record<string, unknown>[];
}

export interface ViewInfo {
  id: string;
  name: string;
  type: 'grid' | 'form' | 'calendar' | 'gallery' | 'kanban' | 'timeline' | 'block';
  visibleFieldIds?: string[];
  filterByFormula?: string;
  sort?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
}

export interface CollaboratorInfo {
  type: 'user' | 'group';
  id: string;
  email?: string;
  name?: string;
  permissionLevel: 'read' | 'comment' | 'edit' | 'create';
  createdTime: string;
}

export interface ShareInfo {
  id: string;
  type: 'view' | 'base';
  url: string;
  isPasswordRequired: boolean;
  allowedActions: string[];
  restriction?: {
    dateRange?: {
      startDate?: string;
      endDate?: string;
    };
    allowCommenting?: boolean;
    allowCopyingData?: boolean;
  };
}

// ============================================================================
// Complete Tool Schema Definitions
// ============================================================================

export const COMPLETE_TOOL_SCHEMAS: ToolSchema[] = [
  // Data Operations (7 tools)
  {
    name: 'list_tables',
    description: 'Get all tables in your base with schema information',
    inputSchema: {
      type: 'object',
      properties: {
        include_schema: { type: 'boolean', description: 'Include field schema information', default: false }
      }
    }
  },
  {
    name: 'list_records',
    description: 'Query records with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        maxRecords: { type: 'number', description: 'Maximum number of records to return' },
        view: { type: 'string', description: 'View name or ID' },
        filterByFormula: { type: 'string', description: 'Airtable formula to filter records' },
        sort: { type: 'array', description: 'Sort configuration' },
        pageSize: { type: 'number', description: 'Number of records per page' },
        offset: { type: 'string', description: 'Pagination offset' }
      },
      required: ['table']
    }
  },
  {
    name: 'get_record',
    description: 'Retrieve a single record by ID',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        recordId: { type: 'string', description: 'Record ID' }
      },
      required: ['table', 'recordId']
    }
  },
  {
    name: 'create_record',
    description: 'Add new records to any table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        fields: { type: 'object', description: 'Field values for the new record' },
        typecast: { type: 'boolean', description: 'Automatically typecast field values' }
      },
      required: ['table', 'fields']
    }
  },
  {
    name: 'update_record',
    description: 'Modify existing record fields',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        recordId: { type: 'string', description: 'Record ID to update' },
        fields: { type: 'object', description: 'Fields to update' },
        typecast: { type: 'boolean', description: 'Automatically typecast field values' }
      },
      required: ['table', 'recordId', 'fields']
    }
  },
  {
    name: 'delete_record',
    description: 'Remove records from a table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        recordId: { type: 'string', description: 'Record ID to delete' }
      },
      required: ['table', 'recordId']
    }
  },
  {
    name: 'search_records',
    description: 'Advanced search with Airtable formulas and sorting',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name or ID' },
        filterByFormula: { type: 'string', description: 'Search formula' },
        sort: { type: 'array', description: 'Sort configuration' },
        maxRecords: { type: 'number', description: 'Maximum records to return' },
        view: { type: 'string', description: 'View to search within' }
      },
      required: ['table']
    }
  }
  // Note: Additional tool schemas would continue here for all 33 tools
  // This is a representative sample showing the structure
];

// ============================================================================
// Export All Tool Types
// ============================================================================

export {
  ListTablesInput,
  ListRecordsInput,
  GetRecordInput,
  CreateRecordInput,
  UpdateRecordInput,
  DeleteRecordInput,
  SearchRecordsInput,
  
  ListWebhooksInput,
  CreateWebhookInput,
  DeleteWebhookInput,
  GetWebhookPayloadsInput,
  RefreshWebhookInput,
  
  BatchCreateRecordsInput,
  BatchUpdateRecordsInput,
  BatchDeleteRecordsInput,
  BatchUpsertRecordsInput,
  
  ToolResponse,
  PaginatedResponse,
  TableInfo,
  RecordInfo,
  WebhookInfo,
  BaseInfo,
  FieldTypeInfo,
  ViewInfo,
  CollaboratorInfo,
  ShareInfo
};
/**
 * Airtable MCP Server TypeScript Definitions
 * Enterprise-grade type safety for AI-powered Airtable operations
 */

// ============================================================================
// MCP Protocol Types (2024-11-05 Specification)
// ============================================================================

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export interface MCPServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  roots?: {
    listChanged?: boolean;
  };
  sampling?: Record<string, unknown>;
  logging?: Record<string, unknown>;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities: MCPServerCapabilities;
}

// ============================================================================
// Tool Schema Types
// ============================================================================

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

// ============================================================================
// AI Prompt Types
// ============================================================================

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
  type?: 'string' | 'number' | 'boolean';
  enum?: string[];
}

export interface PromptSchema {
  name: string;
  description: string;
  arguments: PromptArgument[];
}

export type AnalysisType = 
  | 'trends' 
  | 'statistical' 
  | 'patterns' 
  | 'predictive' 
  | 'anomaly_detection' 
  | 'correlation_matrix';

export type ConfidenceLevel = 0.90 | 0.95 | 0.99;

export interface AnalysisOptions {
  table: string;
  analysis_type?: AnalysisType;
  field_focus?: string;
  time_dimension?: string;
  confidence_level?: ConfidenceLevel;
}

export interface PredictiveAnalyticsOptions {
  table: string;
  target_field: string;
  prediction_periods?: number;
  algorithm?: 'linear_regression' | 'arima' | 'exponential_smoothing' | 'random_forest';
  include_confidence_intervals?: boolean;
  historical_periods?: number;
}

export interface StatisticalResult {
  confidence_interval: [number, number];
  significance_level: number;
  p_value?: number;
  correlation_coefficient?: number;
}

// ============================================================================
// Airtable API Types
// ============================================================================

export interface AirtableFieldType {
  type: 'singleLineText' | 'multilineText' | 'richText' | 'email' | 'url' | 'phoneNumber' |
        'number' | 'percent' | 'currency' | 'singleSelect' | 'multipleSelects' |
        'date' | 'dateTime' | 'checkbox' | 'rating' | 'formula' | 'rollup' |
        'count' | 'lookup' | 'createdTime' | 'lastModifiedTime' | 'createdBy' |
        'lastModifiedBy' | 'attachment' | 'barcode' | 'button';
}

export interface AirtableField {
  id: string;
  name: string;
  type: AirtableFieldType['type'];
  options?: Record<string, unknown>;
  description?: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  description?: string;
  primaryFieldId: string;
  fields: AirtableField[];
  views: AirtableView[];
}

export interface AirtableView {
  id: string;
  name: string;
  type: 'grid' | 'form' | 'calendar' | 'gallery' | 'kanban';
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: 'read' | 'comment' | 'edit' | 'create';
  tables: AirtableTable[];
}

export interface AirtableWebhook {
  id: string;
  macSecretBase64: string;
  expirationTime: string;
  notificationUrl: string;
  isHookEnabled: boolean;
  cursorForNextPayload: number;
  lastSuccessfulNotificationTime?: string;
}

export interface WebhookPayload {
  timestamp: string;
  base: {
    id: string;
  };
  webhook: {
    id: string;
  };
  changedTablesById: Record<string, {
    changedRecordsById: Record<string, {
      current?: AirtableRecord;
      previous?: AirtableRecord;
    }>;
  }>;
}

// ============================================================================
// Server Configuration Types
// ============================================================================

export interface ServerConfig {
  PORT: number;
  HOST: string;
  MAX_REQUESTS_PER_MINUTE: number;
  LOG_LEVEL: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
}

export interface AuthConfig {
  AIRTABLE_TOKEN: string;
  AIRTABLE_BASE_ID: string;
}

export interface OAuth2Config {
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge?: string;
  code_challenge_method?: 'S256';
}

// ============================================================================
// Batch Operation Types
// ============================================================================

export interface BatchCreateRecord {
  fields: Record<string, unknown>;
}

export interface BatchUpdateRecord {
  id: string;
  fields: Record<string, unknown>;
}

export interface BatchDeleteRecord {
  id: string;
}

export interface BatchUpsertRecord {
  key_field: string;
  key_value: string;
  fields: Record<string, unknown>;
}

// ============================================================================
// Advanced Analytics Types
// ============================================================================

export interface DataQualityReport {
  total_records: number;
  missing_values: Record<string, number>;
  duplicate_records: string[];
  data_types: Record<string, string>;
  quality_score: number;
  recommendations: string[];
}

export interface WorkflowOptimization {
  current_efficiency: number;
  bottlenecks: string[];
  automation_opportunities: Array<{
    field: string;
    suggestion: string;
    impact_level: 'high' | 'medium' | 'low';
    implementation_complexity: 'simple' | 'moderate' | 'complex';
  }>;
  estimated_time_savings: string;
}

export interface SchemaOptimization {
  field_recommendations: Array<{
    field: string;
    current_type: string;
    suggested_type: string;
    reason: string;
  }>;
  index_suggestions: string[];
  normalization_opportunities: string[];
  compliance_notes: string[];
}

// ============================================================================
// Root Directory Types
// ============================================================================

export interface RootDirectory {
  uri: string;
  name: string;
  description?: string;
}

// ============================================================================
// Error Types (defined in errors.ts)
// ============================================================================

export interface AirtableError extends Error {
  code: string;
  statusCode?: number;
}

export interface ValidationError extends Error {
  field: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = T & Partial<Pick<T, K>>;

// ============================================================================
// Main Server Class Type
// ============================================================================

export interface AirtableMCPServer {
  config: ServerConfig;
  authConfig: AuthConfig;
  tools: ToolSchema[];
  prompts: PromptSchema[];
  
  initialize(capabilities: MCPServerCapabilities): Promise<MCPServerInfo>;
  handleToolCall(name: string, params: Record<string, unknown>): Promise<unknown>;
  handlePromptGet(name: string, args: Record<string, unknown>): Promise<{ messages: Array<{ role: string; content: { type: string; text: string } }> }>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ============================================================================
// Export All Types
// ============================================================================

export * from './tools';
export * from './ai-prompts';
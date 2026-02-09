/**
 * Basic TypeScript Usage Example
 * Demonstrates type-safe Airtable MCP operations
 */

import {
  AirtableMCPServer,
  MCPServerCapabilities,
  ListRecordsInput,
  CreateRecordInput,
  AnalyzeDataPrompt
} from '@rashidazarang/airtable-mcp/types';

// Type-safe server initialization
async function initializeServer(): Promise<void> {
  const server = new AirtableMCPServer();
  
  const capabilities: MCPServerCapabilities = {
    tools: { listChanged: false },
    prompts: { listChanged: false },
    resources: { subscribe: false, listChanged: false },
    roots: { listChanged: false },
    sampling: {},
    logging: {}
  };
  
  const serverInfo = await server.initialize(capabilities);
  console.log('Server initialized:', serverInfo);
}

// Type-safe data operations
async function performDataOperations(): Promise<void> {
  const server = new AirtableMCPServer();
  
  // List records with type safety
  const listParams: ListRecordsInput = {
    table: 'Tasks',
    maxRecords: 10,
    filterByFormula: "Status = 'Active'"
  };
  
  const records = await server.handleToolCall('list_records', listParams);
  console.log('Records retrieved:', records);
  
  // Create record with validated types
  const createParams: CreateRecordInput = {
    table: 'Tasks',
    fields: {
      'Name': 'New Task',
      'Status': 'Active',
      'Priority': 'High',
      'Due Date': new Date().toISOString()
    },
    typecast: true
  };
  
  const newRecord = await server.handleToolCall('create_record', createParams);
  console.log('Record created:', newRecord);
}

// Type-safe AI prompt usage
async function useAIPrompts(): Promise<void> {
  const server = new AirtableMCPServer();
  
  // Advanced data analysis with strict typing
  const analysisParams: AnalyzeDataPrompt = {
    table: 'Sales',
    analysis_type: 'predictive',
    field_focus: 'revenue,conversion_rate',
    time_dimension: 'created_date',
    confidence_level: 0.95
  };
  
  const analysis = await server.handlePromptGet('analyze_data', analysisParams);
  console.log('AI Analysis:', analysis);
  
  // Type-safe error handling
  try {
    // This will cause a TypeScript compile error if types don't match
    const invalidParams = {
      table: 'Sales',
      analysis_type: 'invalid_type', // TypeScript will catch this!
      confidence_level: 1.5 // TypeScript will catch this too!
    };
    
    // await server.handlePromptGet('analyze_data', invalidParams);
  } catch (error) {
    console.error('Type-safe error handling:', error);
  }
}

// Enterprise-grade type validation
interface BusinessMetrics {
  revenue: number;
  conversion_rate: number;
  customer_count: number;
  timestamp: Date;
}

function validateBusinessMetrics(data: unknown): data is BusinessMetrics {
  const metrics = data as BusinessMetrics;
  return (
    typeof metrics.revenue === 'number' &&
    typeof metrics.conversion_rate === 'number' &&
    typeof metrics.customer_count === 'number' &&
    metrics.timestamp instanceof Date
  );
}

// Type-safe configuration
interface AppConfig {
  airtable: {
    token: string;
    baseId: string;
  };
  server: {
    port: number;
    host: string;
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  };
  ai: {
    enablePredictiveAnalytics: boolean;
    confidenceThreshold: number;
    maxAnalysisFields: number;
  };
}

const config: AppConfig = {
  airtable: {
    token: process.env.AIRTABLE_TOKEN!,
    baseId: process.env.AIRTABLE_BASE_ID!
  },
  server: {
    port: 8010,
    host: 'localhost',
    logLevel: 'INFO'
  },
  ai: {
    enablePredictiveAnalytics: true,
    confidenceThreshold: 0.85,
    maxAnalysisFields: 10
  }
};

// Main execution with comprehensive error handling
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting TypeScript Airtable MCP Example');
    
    await initializeServer();
    await performDataOperations();
    await useAIPrompts();
    
    console.log('✅ All operations completed successfully with type safety!');
  } catch (error) {
    console.error('❌ Error occurred:', error);
    process.exit(1);
  }
}

// Export for testing and reuse
export {
  initializeServer,
  performDataOperations,
  useAIPrompts,
  validateBusinessMetrics,
  BusinessMetrics,
  AppConfig
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}